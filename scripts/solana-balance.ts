/**
 * `pnpm solana:balance` — print the devnet signer's balance.
 *
 * Loads .devnet/id.json, connects to the devnet RPC (mainnet-guarded), and
 * prints the pubkey + balance + RPC HOST (never the full URL / API key).
 * Exits non-zero only if the RPC is unreachable / not devnet.
 */
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  assertReachableDevnet,
  die,
  loadEnv,
  loadKeypair,
  redactRpc,
  resolveRpcUrl,
  resolveWalletPath,
} from "./_devnet-common";

loadEnv();

async function main() {
  const rpcUrl = resolveRpcUrl(); // guards mainnet
  const walletPath = resolveWalletPath();
  const conn = new Connection(rpcUrl, "confirmed");
  await assertReachableDevnet(conn, rpcUrl); // devnet-only

  const keypair = loadKeypair(walletPath);
  const lamports = await conn.getBalance(keypair.publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;

  console.log(`RPC host: ${redactRpc(rpcUrl)}`);
  console.log(`Pubkey:   ${keypair.publicKey.toBase58()}`);
  console.log(`Balance:  ${sol} SOL (${lamports} lamports)`);
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)));
