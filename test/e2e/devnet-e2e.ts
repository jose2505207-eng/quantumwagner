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
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../idl/prediction_market.json";
import type { PredictionMarket } from "../../idl/types";

// ---------------------------------------------------------------------------
// env — load .env exactly like the rest of the repo (no `dotenv` dep here).
// process.loadEnvFile (Node 20.12+) mirrors vitest.config.ts / prisma.config.ts.
// ---------------------------------------------------------------------------
try {
  process.loadEnvFile();
} catch {
  /* no .env (e.g. another shell exported the vars) — fall through to checks */
}

const RPC_URL =
  process.env.ANCHOR_PROVIDER_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";
const WALLET_PATH = process.env.ANCHOR_WALLET || path.join(".devnet", "id.json");

function die(msg: string): never {
  console.error(`\n❌  E2E FAILED — ${msg}\n`);
  process.exit(1);
}

function loadKeypair(file: string): Keypair {
  const full = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!existsSync(full)) {
    die(
      `wallet keypair not found at "${full}". Set ANCHOR_WALLET (the repo expects ` +
        `.devnet/id.json, which is gitignored). Drop a devnet keypair there first.`
    );
  }
  let secret: number[];
  try {
    secret = JSON.parse(readFileSync(full, "utf8"));
  } catch (err) {
    die(`could not parse keypair JSON at "${full}": ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!Array.isArray(secret) || (secret.length !== 64 && secret.length !== 32)) {
    die(`keypair at "${full}" is not a valid Solana secret-key byte array.`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
const explorerAddr = (a: string) => `https://explorer.solana.com/address/${a}?cluster=devnet`;

async function main() {
  console.log("=== QuantumWagner devnet E2E harness ===");
  console.log(`RPC:    ${RPC_URL}`);
  console.log(`Wallet: ${WALLET_PATH}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const keypair = loadKeypair(WALLET_PATH);
  const wallet = new anchor.Wallet(keypair);
  console.log(`Pubkey: ${keypair.publicKey.toBase58()}`);
  console.log(`        ${explorerAddr(keypair.publicKey.toBase58())}`);

  // --- (1) genesis / chain reachability -----------------------------------
  let version: unknown;
  try {
    version = await connection.getVersion();
  } catch (err) {
    die(`RPC unreachable at ${RPC_URL}: ${err instanceof Error ? err.message : String(err)}`);
  }
  console.log(`\n[1] RPC reachable. solana-core: ${(version as { "solana-core"?: string })["solana-core"] ?? "?"}`);

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
  try {
    const cfg = await program.account.platformConfig.fetch(configPDA);
    console.log(`    -> admin=${cfg.admin.toBase58()}`);
    console.log(`    -> next_launch_id=${Number(cfg.nextLaunchId)} next_battle_id=${Number(cfg.nextBattleId)} next_market_id=${Number(cfg.nextMarketId)}`);
    console.log(`    -> totals: tokens=${Number(cfg.totalTokensCreated)} battles=${Number(cfg.totalBattles)} markets=${Number(cfg.totalMarkets)}`);
    console.log(`    -> platform_fee_bps=${cfg.platformFeeBps} treasury=${cfg.treasury.toBase58()}`);
  } catch (err) {
    console.warn(
      `    PlatformConfig not initialised yet (${err instanceof Error ? err.message : String(err)}). ` +
        `That is a valid chain state, not a fabrication — continuing read-only scan.`
    );
  }

  // Enumerate the live program accounts (real getProgramAccounts reads).
  const [battles, markets, tokens] = await Promise.all([
    program.account.battle.all(),
    program.account.market.all(),
    program.account.tokenLaunch.all(),
  ]);
  console.log(`\n    On-chain inventory (getProgramAccounts):`);
  console.log(`    -> battles:     ${battles.length}`);
  console.log(`    -> markets:     ${markets.length}`);
  console.log(`    -> tokenLaunch: ${tokens.length}`);
  if (battles[0]) {
    const b = battles[0];
    console.log(`    sample battle ${b.publicKey.toBase58()}: title="${b.account.title}" totalPool=${Number(b.account.totalPool)}`);
  }
  if (tokens[0]) {
    const t = tokens[0];
    console.log(`    sample token  ${t.publicKey.toBase58()}: ${t.account.symbol} mint=${t.account.tokenMint.toBase58()}`);
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
    await connection.confirmTransaction(sig, "confirmed");
  } catch (err) {
    die(`signing-liveness transfer failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  console.log(`    Signature: ${sig}`);
  console.log(`    ${explorerTx(sig)}`);

  console.log(`\n✅  E2E PASSED — chain reachable, program present, account reads real, wallet can sign.`);
}

main().catch((err) => {
  die(err instanceof Error ? err.stack ?? err.message : String(err));
});
