/**
 * Server-side Solana (Devnet) — verify real transaction signatures on-chain.
 *
 * The backend must NEVER mark a bet/prediction/launch as confirmed unless the
 * Devnet transaction actually confirmed. This module is the single place that
 * talks to the chain from the server.
 */
import { createHash } from "node:crypto";
import { Connection, PublicKey } from "@solana/web3.js";
import { SOLANA_RPC_URL as PUBLIC_RPC } from "@/lib/solana";
import { assertNotMainnet } from "@/lib/solanaNetwork";
import { DEMO_MODE } from "@/lib/game/config";

// Server-side RPC: prefer the authenticated Anchor/devnet endpoint (may carry a
// key — never exposed to the browser), then the server SOLANA_RPC_URL, then the
// public devnet fallback. Devnet-only (guarded).
const RPC =
  process.env.ANCHOR_PROVIDER_URL || process.env.SOLANA_RPC_URL || PUBLIC_RPC;
assertNotMainnet(RPC, "server Solana RPC (ANCHOR_PROVIDER_URL/SOLANA_RPC_URL)");

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

// ---------------------------------------------------------------------------
// Deep verification — a confirmed signature is NOT enough.
//
// `verifySignature` above only answers "did this signature land". That alone is
// forgeable: any confirmed Devnet signature (an airdrop, someone else's bet)
// could be posted to a record endpoint to register a stake that never happened.
// The functions below read the actual transaction and assert WHAT it did:
// which program ran, which instruction, who signed, and how many lamports
// moved into the account that is supposed to hold the stake.
// ---------------------------------------------------------------------------

/** The on-chain prediction-market program this backend trusts. */
export const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID ||
    process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc"
);

/**
 * Anchor's instruction discriminator: the first 8 bytes of
 * sha256("global:<snake_case_instruction_name>"). Computing it (instead of
 * hardcoding hex) keeps the check readable and tied to the IDL's names.
 */
export function anchorDiscriminator(instruction: string): string {
  return createHash("sha256")
    .update(`global:${instruction}`)
    .digest()
    .subarray(0, 8)
    .toString("hex");
}

export interface DeepVerification extends TxVerification {
  /** Fee payer of the transaction (the wallet that actually signed). */
  signer?: string | null;
  /** Lamports credited to the account expected to receive the stake. */
  lamportsCredited?: number | null;
}

/**
 * Confirm a signature by POLLING, never by websocket subscription.
 *
 * `connection.confirmTransaction` subscribes via `signatureSubscribe`, which the
 * authenticated devnet provider used here does not implement — the call then
 * blocks until the blockhash expires and reports failure for a transaction that
 * actually succeeded. Polling `getSignatureStatuses` works on every provider.
 *
 * Returns the terminal state; "pending" means we ran out of time without a
 * verdict (the transaction may still land, so callers must NOT assume failure).
 */
export async function pollConfirmation(
  signature: string,
  { timeoutMs = 60_000, intervalMs = 2_000 } = {}
): Promise<"confirmed" | "failed" | "pending"> {
  const conn = solanaConnection();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await conn.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      });
      const info = res?.value?.[0];
      if (info) {
        if (info.err) return "failed";
        if (
          info.confirmationStatus === "confirmed" ||
          info.confirmationStatus === "finalized"
        ) {
          return "confirmed";
        }
      }
    } catch {
      // Transient RPC error — keep polling until the deadline.
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return "pending";
}

/** Fetch a transaction, retrying once — RPC nodes lag briefly behind confirmation. */
async function getTx(signature: string) {
  const conn = solanaConnection();
  for (let attempt = 0; attempt < 2; attempt++) {
    const tx = await conn.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (tx) return tx;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 1200));
  }
  return null;
}

/**
 * Verify that `signature` is a real call to OUR program that staked lamports.
 *
 * Every one of these must hold, or the result is `confirmed: false` with the
 * precise reason (we never downgrade a failed check into a pass):
 *  - the transaction exists on Devnet and did not error
 *  - its fee payer is the wallet of the authenticated session
 *  - it contains an instruction to `PROGRAM_ID` whose Anchor discriminator
 *    matches `instruction` (e.g. "place_bet")
 *  - `creditedAccount` (the market PDA / vault) took part in that instruction
 *  - that account's balance grew by at least `minLamports`
 */
export async function verifyProgramAction(params: {
  signature?: string | null;
  instruction: string;
  signer: string;
  creditedAccount?: string;
  minLamports?: number;
  /** Absorbs rounding between the client's SOL float and on-chain lamports. */
  toleranceLamports?: number;
}): Promise<DeepVerification> {
  const {
    signature,
    instruction,
    signer,
    creditedAccount,
    minLamports,
    toleranceLamports = 0,
  } = params;

  if (!signature || signature.length < 32) {
    return { confirmed: false, reason: "missing or malformed signature" };
  }

  try {
    const tx = await getTx(signature);
    if (!tx) return { confirmed: false, reason: "transaction not found on devnet" };
    if (tx.meta?.err) {
      return { confirmed: false, slot: tx.slot, reason: "transaction failed on-chain" };
    }

    const message = tx.transaction.message;
    const keys = message.getAccountKeys({
      accountKeysFromLookups: tx.meta?.loadedAddresses,
    });
    const feePayer = keys.get(0)?.toBase58() ?? null;
    if (feePayer !== signer) {
      return {
        confirmed: false,
        slot: tx.slot,
        signer: feePayer,
        reason: "transaction was not signed by the authenticated wallet",
      };
    }

    const wanted = anchorDiscriminator(instruction);
    const match = message.compiledInstructions.find((ix) => {
      const programId = keys.get(ix.programIdIndex);
      if (!programId?.equals(PROGRAM_ID)) return false;
      return Buffer.from(ix.data.subarray(0, 8)).toString("hex") === wanted;
    });
    if (!match) {
      return {
        confirmed: false,
        slot: tx.slot,
        signer: feePayer,
        reason: `transaction contains no ${instruction} call to the prediction-market program`,
      };
    }

    let lamportsCredited: number | null = null;
    if (creditedAccount) {
      const index = keys
        .keySegments()
        .flat()
        .findIndex((k) => k.toBase58() === creditedAccount);
      if (index === -1 || !match.accountKeyIndexes.includes(index)) {
        return {
          confirmed: false,
          slot: tx.slot,
          signer: feePayer,
          reason: `the ${instruction} call does not reference ${creditedAccount}`,
        };
      }
      const pre = tx.meta?.preBalances?.[index] ?? 0;
      const post = tx.meta?.postBalances?.[index] ?? 0;
      lamportsCredited = post - pre;

      if (minLamports !== undefined && lamportsCredited < minLamports - toleranceLamports) {
        return {
          confirmed: false,
          slot: tx.slot,
          signer: feePayer,
          lamportsCredited,
          reason: `on-chain stake (${lamportsCredited} lamports) is smaller than the claimed amount (${minLamports} lamports)`,
        };
      }
    }

    return {
      confirmed: true,
      slot: tx.slot,
      status: "confirmed",
      signer: feePayer,
      lamportsCredited,
    };
  } catch (e) {
    return {
      confirmed: false,
      reason: `rpc error: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}

/**
 * Verify a plain SOL transfer into a vault — the stake path for products with
 * no dedicated on-chain instruction (fast bets). Same rules as above minus the
 * program/discriminator check: the signer must be the session wallet and the
 * vault's balance must have grown by at least `minLamports`.
 */
export async function verifySolTransfer(params: {
  signature?: string | null;
  signer: string;
  recipient: string;
  minLamports: number;
  toleranceLamports?: number;
}): Promise<DeepVerification> {
  const { signature, signer, recipient, minLamports, toleranceLamports = 0 } = params;

  if (!signature || signature.length < 32) {
    return { confirmed: false, reason: "missing or malformed signature" };
  }

  try {
    const tx = await getTx(signature);
    if (!tx) return { confirmed: false, reason: "transaction not found on devnet" };
    if (tx.meta?.err) {
      return { confirmed: false, slot: tx.slot, reason: "transaction failed on-chain" };
    }

    const message = tx.transaction.message;
    const keys = message.getAccountKeys({
      accountKeysFromLookups: tx.meta?.loadedAddresses,
    });
    const feePayer = keys.get(0)?.toBase58() ?? null;
    if (feePayer !== signer) {
      return {
        confirmed: false,
        slot: tx.slot,
        signer: feePayer,
        reason: "transfer was not signed by the authenticated wallet",
      };
    }

    const index = keys
      .keySegments()
      .flat()
      .findIndex((k) => k.toBase58() === recipient);
    if (index === -1) {
      return {
        confirmed: false,
        slot: tx.slot,
        signer: feePayer,
        reason: "transfer does not credit the platform vault",
      };
    }

    const pre = tx.meta?.preBalances?.[index] ?? 0;
    const post = tx.meta?.postBalances?.[index] ?? 0;
    const lamportsCredited = post - pre;
    if (lamportsCredited < minLamports - toleranceLamports) {
      return {
        confirmed: false,
        slot: tx.slot,
        signer: feePayer,
        lamportsCredited,
        reason: `vault received ${lamportsCredited} lamports, less than the claimed stake (${minLamports} lamports)`,
      };
    }

    return {
      confirmed: true,
      slot: tx.slot,
      status: "confirmed",
      signer: feePayer,
      lamportsCredited,
    };
  } catch (e) {
    return {
      confirmed: false,
      reason: `rpc error: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}
