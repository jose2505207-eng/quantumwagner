/**
 * Shared helpers for the devnet-only Solana scripts (`solana:health`,
 * `solana:balance`) and the E2E harness. Node-only (fs), never imported by the
 * app bundle. Re-uses the dependency-free guard in `lib/solanaNetwork`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Connection, Keypair } from "@solana/web3.js";
import {
  assertDevnetGenesis,
  assertNotMainnet,
  redactRpc,
} from "../lib/solanaNetwork";

export { redactRpc, assertDevnetGenesis, assertNotMainnet };

/** The throwaway devnet signer the E2E proof is expected to use. */
export const EXPECTED_PUBKEY = "EBJjWqRqR6qidwo9qNNpaDvveX6A5PRD1avtxvDkVphA";

/** Load `.env` the same way the rest of the repo does (Node 20.12+). */
export function loadEnv(): void {
  try {
    process.loadEnvFile();
  } catch {
    /* no .env (vars may be exported by the shell) — fall through */
  }
}

/**
 * Resolve the devnet RPC for server/Anchor/E2E use. Prefers the authenticated
 * ANCHOR_PROVIDER_URL, then the server SOLANA_RPC_URL, then the public frontend
 * URL, then public devnet. Guards against mainnet before returning.
 */
export function resolveRpcUrl(): string {
  const url =
    process.env.ANCHOR_PROVIDER_URL ||
    process.env.SOLANA_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.devnet.solana.com";
  assertNotMainnet(url, "devnet RPC (ANCHOR_PROVIDER_URL/SOLANA_RPC_URL)");
  return url;
}

/** Resolve the local signer keypair path. */
export function resolveWalletPath(): string {
  return (
    process.env.ANCHOR_WALLET ||
    process.env.DEVNET_E2E_KEYPAIR ||
    path.join(".devnet", "id.json")
  );
}

export function die(msg: string): never {
  console.error(`\n❌  ${msg}\n`);
  process.exit(1);
}

export function loadKeypair(file: string): Keypair {
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
    die(
      `could not parse keypair JSON at "${full}": ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
  if (!Array.isArray(secret) || (secret.length !== 64 && secret.length !== 32)) {
    die(`keypair at "${full}" is not a valid Solana secret-key byte array.`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

/** Verify the connected RPC is reachable AND is the devnet cluster (by genesis). */
export async function assertReachableDevnet(conn: Connection, rpcUrl: string) {
  let version: { "solana-core"?: string };
  try {
    version = await conn.getVersion();
  } catch (err) {
    die(
      `RPC unreachable at host "${redactRpc(rpcUrl)}": ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
  const genesis = await conn.getGenesisHash();
  assertDevnetGenesis(genesis); // throws if not devnet
  return { core: version["solana-core"] ?? "?", genesis };
}
