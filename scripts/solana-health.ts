/**
 * `pnpm solana:health` — devnet RPC + signer preflight.
 *
 * Verifies (and FAILS LOUD with a non-zero exit on any violation):
 *   1. RPC is reachable.
 *   2. The cluster is devnet (by genesis hash — refuses mainnet/testnet).
 *   3. The signer pubkey from .devnet/id.json matches the expected E2E wallet.
 *   4. Reports the wallet balance and the RPC HOST (never the full URL / key).
 *
 * Exit codes: 0 = infra healthy (even at 0 SOL, with a clear "fund before E2E"
 * note); non-zero = unreachable / wrong cluster / mainnet / signer mismatch.
 */
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  EXPECTED_PUBKEY,
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

  console.log("=== QuantumWagner devnet health check ===");
  console.log(`RPC host: ${redactRpc(rpcUrl)}`); // host only — key-safe
  console.log(`Wallet:   ${walletPath}`);

  const conn = new Connection(rpcUrl, "confirmed");
  const { core, genesis } = await assertReachableDevnet(conn, rpcUrl);
  console.log(`\n[1] RPC reachable. solana-core: ${core}`);
  console.log(`[2] Cluster: devnet (genesis ${genesis}) ✓`);

  const keypair = loadKeypair(walletPath);
  const pubkey = keypair.publicKey.toBase58();
  if (pubkey !== EXPECTED_PUBKEY) {
    die(
      `signer pubkey mismatch.\n   expected: ${EXPECTED_PUBKEY}\n   got:      ${pubkey}\n` +
        `   The keypair at "${walletPath}" is not the expected devnet E2E wallet.`
    );
  }
  console.log(`[3] Signer pubkey matches expected E2E wallet ✓`);
  console.log(`    ${pubkey}`);

  const lamports = await conn.getBalance(keypair.publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;
  console.log(`[4] Balance: ${sol} SOL (${lamports} lamports)`);

  if (lamports === 0) {
    console.log(
      `\n⚠️  Infra is HEALTHY but the wallet holds 0 SOL — NOT yet ready for E2E.\n` +
        `   Fund ${pubkey} out-of-band on devnet, then run \`pnpm e2e\`.`
    );
  } else {
    console.log(`\n✅  HEALTHY and funded — ready for \`pnpm e2e\`.`);
  }
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)));
