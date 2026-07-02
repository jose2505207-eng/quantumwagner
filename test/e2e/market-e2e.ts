/**
 * Full market-journey proof on DEVNET against a running server (E2E_BASE_URL,
 * default http://localhost:3000):
 *  1. on-chain initialize_market (real tx, e2e wallet pays)
 *  2. wallet auth vs http://localhost:3100 (nonce -> ed25519 sign -> session cookie)
 *  3. POST /api/markets with pda + txSignature (server verifies on-chain)
 *  4. on-chain place_bet (real tx)
 *  5. POST /api/markets/[id]/predictions with txSignature (hard-required in strict mode)
 */
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { PredictionMarket } from "../../idl/types";
import nacl from "tweetnacl";
import bs58 from "bs58";

const REPO = process.cwd(); // run from the repo root
const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
process.loadEnvFile(`${REPO}/.env`);

const idl = JSON.parse(
  readFileSync(`${REPO}/idl/prediction_market.json`, "utf8")
) as PredictionMarket;
const kp = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(`${REPO}/.devnet/id.json`, "utf8")))
);
const rpc =
  process.env.ANCHOR_PROVIDER_URL ||
  process.env.SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";
if (/mainnet/i.test(rpc)) throw new Error("mainnet RPC rejected");

// Alchemy free-tier WS lacks signatureSubscribe — confirm via the public devnet WS.
const conn = new Connection(rpc, {
  commitment: "confirmed",
  wsEndpoint: "wss://api.devnet.solana.com/",
});
const wallet = new anchor.Wallet(kp);
const provider = new anchor.AnchorProvider(conn, wallet, {
  commitment: "confirmed",
});
const program = new anchor.Program<PredictionMarket>(idl, provider);
const PROGRAM_ID = new PublicKey(idl.address);

async function main() {
  console.log("wallet:", kp.publicKey.toBase58());

  // ---- 1. on-chain initialize_market -------------------------------------
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID
  );
  const config = await program.account.platformConfig.fetch(configPDA);
  const nextMarketId: anchor.BN = config.nextMarketId;
  const [marketPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), nextMarketId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
  console.log("nextMarketId:", nextMarketId.toString(), "marketPDA:", marketPDA.toBase58());

  const question = "Will SOL/USD be higher 24h from market creation?";
  const durationSeconds = new anchor.BN(86400);
  const initSig = await program.methods
    .initializeMarket(
      question,
      { price: {} },
      durationSeconds,
      new anchor.BN(100_000_000), // 0.1 SOL min bet — same as the admin UI
      ["SOL", "Price"],
      null
    )
    .accountsPartial({
      creator: kp.publicKey,
      config: configPDA,
      market: marketPDA,
      treasury: config.treasury,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("initialize_market tx:", initSig);
  console.log(`  https://explorer.solana.com/tx/${initSig}?cluster=devnet`);

  // ---- 2. wallet auth (nonce -> sign -> cookie session) -------------------
  const walletAddress = kp.publicKey.toBase58();
  const nonceRes = await fetch(`${BASE}/api/auth/nonce`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
  const { message } = await nonceRes.json();
  if (!message) throw new Error("no nonce message");
  const signature = bs58.encode(
    nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey)
  );
  const verifyRes = await fetch(`${BASE}/api/auth/verify-wallet`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet_address: walletAddress, message, signature }),
  });
  const verifyBody = await verifyRes.json();
  const cookie = verifyRes.headers.get("set-cookie")?.split(";")[0];
  if (!verifyRes.ok || !cookie) {
    throw new Error(`auth failed: ${JSON.stringify(verifyBody)}`);
  }
  console.log("auth OK — user:", verifyBody.user?.id);

  // ---- 3. record the market via the API (server re-verifies the tx) -------
  const recRes = await fetch(`${BASE}/api/markets`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      question,
      category: "CRYPTO",
      endTime: new Date(Date.now() + 86400_000).toISOString(),
      pda: marketPDA.toBase58(),
      txSignature: initSig,
    }),
  });
  const recBody = await recRes.json();
  if (!recRes.ok) throw new Error(`record market failed: ${JSON.stringify(recBody)}`);
  const marketId = recBody.data?.market?.id ?? recBody.market?.id;
  console.log("market recorded:", marketId);

  // ---- 4. on-chain place_bet ----------------------------------------------
  const [positionPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), marketPDA.toBuffer(), kp.publicKey.toBuffer()],
    PROGRAM_ID
  );
  const betLamports = new anchor.BN(100_000_000); // 0.1 SOL (>= market min bet)
  const betSig = await program.methods
    .placeBet(true, betLamports)
    .accountsPartial({
      user: kp.publicKey,
      config: configPDA,
      market: marketPDA,
      userPosition: positionPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("place_bet tx:", betSig);
  console.log(`  https://explorer.solana.com/tx/${betSig}?cluster=devnet`);

  // ---- 5. record the prediction (strict mode: signature required) ---------
  const predRes = await fetch(
    `${BASE}/api/markets/${marketId}/predictions`,
    {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ side: "YES", amount: 0.1, txSignature: betSig }),
    }
  );
  const predBody = await predRes.json();
  if (!predRes.ok) throw new Error(`record prediction failed: ${JSON.stringify(predBody)}`);
  console.log("prediction recorded:", JSON.stringify(predBody.data?.prediction ?? predBody));

  console.log("\n✅ FULL MARKET JOURNEY PASSED (on-chain + backend, devnet)");
}

main().catch((e) => {
  console.error("❌ FAILED:", e.message ?? e);
  process.exit(1);
});
