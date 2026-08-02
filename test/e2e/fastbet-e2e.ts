/**
 * Full fast-bet money loop on DEVNET against a running server
 * (E2E_BASE_URL, default http://localhost:3000):
 *
 *  1. generate a live round (admin-gated)
 *  2. wallet auth (nonce -> ed25519 sign -> session cookie)
 *  3. stake REAL SOL by transferring it to the platform vault
 *  4. POST /api/fast-bets/[id]/enter — server verifies recipient/signer/amount
 *  5. resolve the round on the staked side (admin)
 *  6. assert the vault actually PAID the winner on-chain
 *
 * This proves the one path that has no on-chain instruction behind it: stakes
 * and payouts are plain SOL transfers, so nothing but a real balance change is
 * accepted as proof that the money moved.
 */
import { readFileSync } from "node:fs";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const STAKE_SOL = 0.05;
process.loadEnvFile(`${process.cwd()}/.env`);

const adminKey = process.env.ADMIN_RESOLUTION_KEY;
if (!adminKey) throw new Error("ADMIN_RESOLUTION_KEY must be set");

const kp = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(`${process.cwd()}/.devnet/id.json`, "utf8")))
);
const rpc =
  process.env.ANCHOR_PROVIDER_URL ||
  process.env.SOLANA_RPC_URL ||
  "https://api.devnet.solana.com";
if (/mainnet/i.test(rpc)) throw new Error("mainnet RPC rejected");
const conn = new Connection(rpc, {
  commitment: "confirmed",
  wsEndpoint: "wss://api.devnet.solana.com/",
});

async function authCookie(): Promise<string> {
  const wallet_address = kp.publicKey.toBase58();
  const { message } = await (
    await fetch(`${BASE}/api/auth/nonce`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet_address }),
    })
  ).json();
  if (!message) throw new Error("no nonce message");
  const signature = bs58.encode(
    nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey)
  );
  const res = await fetch(`${BASE}/api/auth/verify-wallet`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet_address, message, signature }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) throw new Error(`auth failed: ${JSON.stringify(await res.json())}`);
  return cookie;
}

async function main() {
  console.log("wallet:", kp.publicKey.toBase58());

  const config = (await (await fetch(`${BASE}/api/config/public`)).json()).data;
  const vault: string | null = config?.fastBets?.vault;
  if (!vault) throw new Error("fast-bet vault is not configured on this deployment");
  console.log("vault:", vault, "payouts:", config.fastBets.payoutsEnabled);

  const cookie = await authCookie();

  // ---- 1. create a live round -------------------------------------------
  const genRes = await fetch(`${BASE}/api/fast-bets/generate`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ symbol: "SOL/USD", count: 1, durationSec: 300, adminKey }),
  });
  const genBody = await genRes.json();
  if (!genRes.ok) throw new Error(`generate failed: ${JSON.stringify(genBody)}`);
  const round = genBody.data.fastBets[0];
  console.log("round:", round.id, "-", round.question);

  // ---- 2. stake REAL SOL into the vault ----------------------------------
  const before = await conn.getBalance(kp.publicKey, "confirmed");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: kp.publicKey,
      toPubkey: new PublicKey(vault),
      lamports: Math.round(STAKE_SOL * LAMPORTS_PER_SOL),
    })
  );
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = kp.publicKey;
  tx.sign(kp);
  const stakeSig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction({ signature: stakeSig, blockhash, lastValidBlockHeight }, "confirmed");
  console.log("stake transfer:", stakeSig);
  console.log(`  https://explorer.solana.com/tx/${stakeSig}?cluster=devnet`);

  // ---- 3. record the entry (server re-verifies the transfer) -------------
  const enterRes = await fetch(`${BASE}/api/fast-bets/${round.id}/enter`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ side: "YES", amount: STAKE_SOL, txSignature: stakeSig }),
  });
  const enterBody = await enterRes.json();
  if (!enterRes.ok) throw new Error(`enter failed: ${JSON.stringify(enterBody)}`);
  console.log("entry recorded:", enterBody.data.entry.id);

  // ---- 4. resolve on the staked side -> triggers the payout --------------
  const resolveRes = await fetch(`${BASE}/api/fast-bets/${round.id}/resolve`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ outcome: "YES", adminKey }),
  });
  const resolveBody = await resolveRes.json();
  if (!resolveRes.ok) throw new Error(`resolve failed: ${JSON.stringify(resolveBody)}`);
  console.log("resolved:", JSON.stringify(resolveBody.data));

  // ---- 5. prove the winner was actually paid ON-CHAIN --------------------
  const detail = (await (await fetch(`${BASE}/api/fast-bets/${round.id}`, {
    headers: { cookie },
  })).json()).data;
  const entry = detail.myEntries[0];
  if (!entry?.payoutTxSignature) {
    throw new Error(
      `no payout signature recorded (payout=${entry?.payout}, error=${entry?.payoutError})`
    );
  }
  const payoutTx = await conn.getTransaction(entry.payoutTxSignature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  if (!payoutTx || payoutTx.meta?.err) throw new Error("payout transaction did not confirm");
  console.log("payout tx:", entry.payoutTxSignature);
  console.log(`  https://explorer.solana.com/tx/${entry.payoutTxSignature}?cluster=devnet`);

  const after = await conn.getBalance(kp.publicKey, "confirmed");
  console.log(
    `balance ${(before / LAMPORTS_PER_SOL).toFixed(6)} -> ${(after / LAMPORTS_PER_SOL).toFixed(6)} SOL ` +
      `(staked ${STAKE_SOL}, paid ${entry.payout})`
  );

  if (entry.payout <= 0) throw new Error("winner payout was zero");
  console.log("\n✅ FULL FAST-BET MONEY LOOP PASSED (stake + payout on devnet)");
}

main().catch((e) => {
  console.error("❌ FAILED:", e.message ?? e);
  process.exit(1);
});
