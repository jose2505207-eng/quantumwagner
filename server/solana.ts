/**
 * Server-side Solana (Devnet) — verify real transaction signatures on-chain.
 *
 * The backend must NEVER mark a bet/prediction/launch as confirmed unless the
 * Devnet transaction actually confirmed. This module is the single place that
 * talks to the chain from the server.
 */
import { Connection } from "@solana/web3.js";
import { SOLANA_RPC_URL as PUBLIC_RPC } from "@/lib/solana";
import { DEMO_MODE } from "@/lib/game/config";

const RPC = process.env.SOLANA_RPC_URL || PUBLIC_RPC;

let _conn: Connection | null = null;
export function solanaConnection(): Connection {
  if (!_conn) _conn = new Connection(RPC, "confirmed");
  return _conn;
}

/**
 * Whether an on-chain confirmed signature is REQUIRED to record an action.
 * - true  => production / devnet-strict: no confirmed tx, no record.
 * - false => local/demo: unconfirmed actions allowed but clearly labelled.
 * Strict unless explicitly in DEMO_MODE; force on with SOLANA_REQUIRE_ONCHAIN=true.
 */
export const REQUIRE_ONCHAIN =
  process.env.SOLANA_REQUIRE_ONCHAIN === "true" || !DEMO_MODE;

export interface TxVerification {
  confirmed: boolean;
  status?: string | null;
  slot?: number | null;
  reason?: string;
}

/**
 * Look up a signature on Devnet and report whether it confirmed.
 * Never invents a result; returns confirmed=false with a reason on any doubt.
 */
export async function verifySignature(
  signature: string | undefined | null
): Promise<TxVerification> {
  if (!signature || signature.length < 32) {
    return { confirmed: false, reason: "missing or malformed signature" };
  }
  try {
    const conn = solanaConnection();
    const res = await conn.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const info = res?.value?.[0];
    if (!info) {
      return { confirmed: false, reason: "transaction not found on devnet" };
    }
    if (info.err) {
      return {
        confirmed: false,
        slot: info.slot,
        status: info.confirmationStatus,
        reason: "transaction failed on-chain",
      };
    }
    const ok =
      info.confirmationStatus === "confirmed" ||
      info.confirmationStatus === "finalized";
    return {
      confirmed: ok,
      slot: info.slot,
      status: info.confirmationStatus ?? null,
      reason: ok ? undefined : "transaction not yet confirmed",
    };
  } catch (e) {
    return {
      confirmed: false,
      reason: `rpc error: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}
