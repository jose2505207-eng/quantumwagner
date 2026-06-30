/**
 * QuantumWagner — Devnet on-chain E2E harness (OQ#3 deliverable).
 *
 * Purpose: prove the deployed prediction-market program is REACHABLE and that the
 * locally-configured wallet can READ + (when funded) SIGN against it on devnet —
 * with REAL account reads and REAL transaction signatures, never fabricated.
 *
 * This is deliberately NOT a Vitest spec and is NOT part of `pnpm test` / CI:
 *   - it needs a funded devnet keypair (`.devnet/id.json` via ANCHOR_WALLET) and a
 *     live RPC (ANCHOR_PROVIDER_URL), neither of which CI has;
 *   - it talks to the real chain, so it must never gate the green build.
 * Run it explicitly with `pnpm e2e`. The node-only Vitest suite excludes
 * `test/e2e/**` (see vitest.config.ts), so this file never inflates the gate.
 *
 * HONESTY DOCTRINE (load-bearing):
 *   - At 0 SOL the wallet cannot sign. We FAIL LOUD with a clear, actionable
 *     message and a non-zero exit — we NEVER skip-as-pass and NEVER print a
 *     fabricated signature. The faucet is currently IP-blocked; the wallet is
 *     funded out-of-band (authenticated devnet RPC), after which this proves the
 *     full path.
 *   - Account reads are printed verbatim from the chain. The signing-liveness
 *     proof is a 0-lamport self-transfer (wallet -> wallet): a genuinely safe,
 *     economically-neutral instruction that still yields a REAL signature you can
 *     open on Solana Explorer. We do not invent markets/battles/bets here.
 */
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../idl/prediction_market.json";
import type { PredictionMarket } from "../../idl/types";
import {
  EXPECTED_PUBKEY,
  assertReachableDevnet,
  die as dieCommon,
  loadEnv,
  loadKeypair,
  redactRpc,
  resolveRpcUrl,
  resolveWalletPath,
} from "../../scripts/_devnet-common";

// ---------------------------------------------------------------------------
// env — load .env exactly like the rest of the repo (Node 20.12+ loadEnvFile),
// then resolve a devnet RPC (ANCHOR_PROVIDER_URL preferred) with a mainnet guard.
// ---------------------------------------------------------------------------
loadEnv();

const RPC_URL = resolveRpcUrl(); // throws if mainnet
const WALLET_PATH = resolveWalletPath();
const die: (msg: string) => never = (msg) => dieCommon(`E2E FAILED — ${msg}`);

const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
const explorerAddr = (a: string) => `https://explorer.solana.com/address/${a}?cluster=devnet`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Confirm a signature by HTTP polling (getSignatureStatuses), avoiding the
 * WebSocket `signatureSubscribe` path. Returns the confirmationStatus on success;
 * throws on on-chain error or timeout.
 */
async function confirmByPolling(
  conn: Connection,
  signature: string,
  timeoutMs = 60_000
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { value } = await conn.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const st = value[0];
    if (st?.err) {
      throw new Error(`transaction failed on-chain: ${JSON.stringify(st.err)}`);
    }
    if (
      st?.confirmationStatus === "confirmed" ||
      st?.confirmationStatus === "finalized"
    ) {
      return st.confirmationStatus;
    }
    await sleep(2_000);
  }
  throw new Error(
    `timed out after ${timeoutMs}ms polling for confirmation of ${signature}`
  );
}

async function main() {
  console.log("=== QuantumWagner devnet E2E harness ===");
  console.log(`RPC host: ${redactRpc(RPC_URL)}`); // host only — never leak the key
  console.log(`Wallet:   ${WALLET_PATH}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const keypair = loadKeypair(WALLET_PATH);
  const wallet = new anchor.Wallet(keypair);
  console.log(`Pubkey:   ${keypair.publicKey.toBase58()}`);
  console.log(`          ${explorerAddr(keypair.publicKey.toBase58())}`);
  if (keypair.publicKey.toBase58() !== EXPECTED_PUBKEY) {
    die(
      `signer pubkey mismatch — expected ${EXPECTED_PUBKEY}, got ` +
        `${keypair.publicKey.toBase58()}. Wrong keypair at "${WALLET_PATH}".`
    );
  }

  // --- (1) chain reachability + DEVNET cluster proof (genesis hash) --------
  const { core, genesis } = await assertReachableDevnet(connection, RPC_URL);
  console.log(`\n[1] RPC reachable. solana-core: ${core}`);
  console.log(`    Cluster: devnet (genesis ${genesis}) ✓`);

  // --- (2) BALANCE GATE — fail loud at 0 SOL -------------------------------
  const lamports = await connection.getBalance(keypair.publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;
  console.log(`\n[2] Balance: ${sol} SOL (${lamports} lamports)`);
  if (lamports === 0) {
    die(
      `wallet ${keypair.publicKey.toBase58()} holds 0 SOL on devnet, so it cannot sign ` +
        `any transaction. Read-only account checks below would still work, but the ` +
        `signing-liveness proof requires funding.\n` +
        `   Fund it via an authenticated devnet RPC / faucet, then re-run \`pnpm e2e\`.\n` +
        `   (We refuse to skip-as-pass or fabricate a signature — see honesty doctrine.)`
    );
  }

  // --- (3) program + read-only on-chain account reads (REAL) ---------------
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new anchor.Program<PredictionMarket>(idl as PredictionMarket, provider);
  const programId = program.programId;
  console.log(`\n[3] Program: ${programId.toBase58()}`);
  console.log(`        ${explorerAddr(programId.toBase58())}`);

  const programInfo = await connection.getAccountInfo(programId);
  if (!programInfo) {
    die(`program ${programId.toBase58()} not found on devnet at ${RPC_URL} — wrong cluster or program id?`);
  }
  console.log(`    Program account exists (executable=${programInfo.executable}, owner=${programInfo.owner.toBase58()}).`);

  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_config")],
    programId
  );
  console.log(`\n    PlatformConfig PDA: ${configPDA.toBase58()}`);
  // The PlatformConfig counters are the seed inputs for deterministic PDA
  // discovery below (step 3b). null => config unreadable => discovery is skipped.
  let nextLaunchId: number | null = null;
  let nextBattleId: number | null = null;
  let nextMarketId: number | null = null;
  try {
    const cfg = await program.account.platformConfig.fetch(configPDA);
    nextLaunchId = Number(cfg.nextLaunchId);
    nextBattleId = Number(cfg.nextBattleId);
    nextMarketId = Number(cfg.nextMarketId);
    console.log(`    -> admin=${cfg.admin.toBase58()}`);
    console.log(`    -> next_launch_id=${nextLaunchId} next_battle_id=${nextBattleId} next_market_id=${nextMarketId}`);
    console.log(`    -> totals: tokens=${Number(cfg.totalTokensCreated)} battles=${Number(cfg.totalBattles)} markets=${Number(cfg.totalMarkets)}`);
    console.log(`    -> platform_fee_bps=${cfg.platformFeeBps} treasury=${cfg.treasury.toBase58()}`);
  } catch (err) {
    console.warn(
      `    PlatformConfig not initialised yet (${err instanceof Error ? err.message : String(err)}). ` +
        `That is a valid chain state, not a fabrication — continuing read-only scan.`
    );
  }

  // --- (3b) deterministic PDA discovery — NO getProgramAccounts -----------
  // Instead of a program-wide `getProgramAccounts` scan (which Alchemy's free
  // tier blocks), we DERIVE each account PDA by id from the PlatformConfig
  // counters read above and batch-read them. This is exact, not a guess: the
  // seeds come straight from the program IDL (`idl/prediction_market.json`) and
  // match the client conventions in `app/utils/methods.tsx`:
  //   token_launch: ["token_launch", launch_id u64 LE]   (methods.tsx:~457)
  //   battle:       ["battle",       battle_id u64 LE]    (methods.tsx:~1050)
  //   market:       ["market",       market_id u64 LE]    (methods.tsx:~210)
  // Anchor's `fetchMultiple` uses getMultipleAccountsInfo under the hood (auto-
  // chunked at 100) and decodes with the program/IDL account coder, returning
  // `null` for any id that has no live account — so absent ids are reported
  // HONESTLY, never invented. Counters are 1-based here (first id = 1), so id 0
  // is expected to be null; we scan [0 .. nextId] inclusive to be exhaustive.
  const MAX_SCAN = 1024; // safety cap: a corrupt counter can't spin forever

  /** Derive `[seedPrefix, id]` PDAs for ids 0..nextId inclusive (capped). */
  const derivePdasById = (
    seedPrefix: string,
    nextId: number
  ): { id: number; pda: PublicKey }[] => {
    const cap = Math.min(Math.max(0, nextId), MAX_SCAN);
    if (nextId > MAX_SCAN) {
      console.warn(`    (capping ${seedPrefix} scan at ${MAX_SCAN}; next id was ${nextId})`);
    }
    const out: { id: number; pda: PublicKey }[] = [];
    for (let id = 0; id <= cap; id++) {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(seedPrefix), new anchor.BN(id).toArrayLike(Buffer, "le", 8)],
        programId
      );
      out.push({ id, pda });
    }
    return out;
  };

  if (nextLaunchId === null || nextBattleId === null || nextMarketId === null) {
    console.warn(
      `\n    Deterministic PDA discovery skipped — PlatformConfig counters are ` +
        `unreadable, so there is no id range to derive from. The program-present ` +
        `read above and the signed-tx proof below still stand. (No getProgramAccounts ` +
        `fallback is used on the standard run — see E2E_GPA_INVENTORY below.)`
    );
  } else {
    console.log(`\n    Direct PDA account verification (getMultipleAccountsInfo, no getProgramAccounts):`);

    const launchPdas = derivePdasById("token_launch", nextLaunchId);
    const battlePdas = derivePdasById("battle", nextBattleId);
    const marketPdas = derivePdasById("market", nextMarketId);

    const [launches, battles, markets] = await Promise.all([
      program.account.tokenLaunch.fetchMultiple(launchPdas.map((p) => p.pda)),
      program.account.battle.fetchMultiple(battlePdas.map((p) => p.pda)),
      program.account.market.fetchMultiple(marketPdas.map((p) => p.pda)),
    ]);

    const liveLaunches = launchPdas
      .map((p, i) => ({ ...p, account: launches[i] }))
      .filter((x) => x.account !== null);
    const liveBattles = battlePdas
      .map((p, i) => ({ ...p, account: battles[i] }))
      .filter((x) => x.account !== null);
    const liveMarkets = marketPdas
      .map((p, i) => ({ ...p, account: markets[i] }))
      .filter((x) => x.account !== null);

    console.log(
      `    -> tokenLaunch: ${liveLaunches.length} live of ${launchPdas.length} ids scanned ` +
        `[ids: ${liveLaunches.map((x) => x.id).join(", ") || "none"}]`
    );
    console.log(
      `    -> battles:     ${liveBattles.length} live of ${battlePdas.length} ids scanned ` +
        `[ids: ${liveBattles.map((x) => x.id).join(", ") || "none"}]`
    );
    console.log(
      `    -> markets:     ${liveMarkets.length} live of ${marketPdas.length} ids scanned ` +
        `[ids: ${liveMarkets.map((x) => x.id).join(", ") || "none"}]`
    );

    const sampleLaunch = liveLaunches[0];
    if (sampleLaunch?.account) {
      console.log(
        `    sample tokenLaunch id=${sampleLaunch.id} ${sampleLaunch.pda.toBase58()}: ` +
          `${sampleLaunch.account.symbol} mint=${sampleLaunch.account.tokenMint.toBase58()}`
      );
    }
    const sampleBattle = liveBattles[0];
    if (sampleBattle?.account) {
      console.log(
        `    sample battle     id=${sampleBattle.id} ${sampleBattle.pda.toBase58()}: ` +
          `title="${sampleBattle.account.title}" totalPool=${Number(sampleBattle.account.totalPool)}`
      );
    }
    const sampleMarket = liveMarkets[0];
    if (sampleMarket?.account) {
      console.log(
        `    sample market     id=${sampleMarket.id} ${sampleMarket.pda.toBase58()}: ` +
          `questionId="${sampleMarket.account.questionId}"`
      );
    }
  }

  // --- OPTIONAL: legacy getProgramAccounts inventory (env-gated, debug-only) -
  // The program-wide scan is NOT used by the standard run because many free RPC
  // tiers (e.g. Alchemy Free) disable getProgramAccounts. It remains available as
  // an admin/indexer/debug path behind E2E_GPA_INVENTORY=1, with a clear note.
  if (process.env.E2E_GPA_INVENTORY === "1") {
    console.log(
      `\n    [debug] getProgramAccounts inventory requested (E2E_GPA_INVENTORY=1). ` +
        `Note: this RPC provider may not support getProgramAccounts on a free tier.`
    );
    try {
      const [battles, markets, tokens] = await Promise.all([
        program.account.battle.all(),
        program.account.market.all(),
        program.account.tokenLaunch.all(),
      ]);
      console.log(`    -> battles:     ${battles.length}`);
      console.log(`    -> markets:     ${markets.length}`);
      console.log(`    -> tokenLaunch: ${tokens.length}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const tierBlocked = /getProgramAccounts is not available|not available on the .* tier/i.test(msg);
      console.warn(
        `    [debug] getProgramAccounts inventory skipped — ${
          tierBlocked
            ? "this RPC tier disables getProgramAccounts (use a paid devnet RPC for the bulk scan)"
            : msg
        }. This is OPTIONAL; the deterministic PDA verification above is the real proof.`
      );
    }
  }

  // --- (4) signing-liveness proof — REAL tx, economically neutral ----------
  // 0-lamport self-transfer: proves the wallet can build, sign, send and land a
  // transaction against this RPC. Costs only the network fee; sends to self.
  console.log(`\n[4] Signing-liveness proof (0-lamport self-transfer)...`);
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: keypair.publicKey,
      lamports: 0,
    })
  );
  let sig: string;
  try {
    sig = await connection.sendTransaction(tx, [keypair]);
    // Confirm via HTTP polling (getSignatureStatuses), NOT confirmTransaction:
    // the latter opens a `signatureSubscribe` WebSocket, which key-only HTTPS RPC
    // endpoints (e.g. Alchemy) don't serve — it would hang for 30s and time out
    // even though the tx already landed. Polling is HTTP-only and authoritative.
    const status = await confirmByPolling(connection, sig);
    console.log(`    Confirmed: ${status} (via getSignatureStatuses)`);
  } catch (err) {
    die(`signing-liveness transfer failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  console.log(`    Signature: ${sig}`);
  console.log(`    ${explorerTx(sig)}`);

  // --- focused proof summary (signer · program · tx · PDA reads · link) ----
  console.log(`\n=== E2E PROOF SUMMARY ===`);
  console.log(`  Signer wallet:   ${keypair.publicKey.toBase58()}`);
  console.log(`  Program id:      ${programId.toBase58()}`);
  console.log(`  PlatformConfig:  ${configPDA.toBase58()} (read OK${nextLaunchId === null ? " — uninitialised" : ""})`);
  console.log(`  Account verify:  deterministic PDA reads via getMultipleAccountsInfo (no getProgramAccounts)`);
  console.log(`  Tx signature:    ${sig}`);
  console.log(`  Explorer (tx):   ${explorerTx(sig)}`);

  console.log(`\n✅  E2E PASSED — chain reachable, program present, account reads real, wallet can sign.`);
}

main().catch((err) => {
  die(err instanceof Error ? err.stack ?? err.message : String(err));
});
