/**
 * Central Solana config — the single source of truth for network, RPC endpoint,
 * program id, and Explorer links. Read env first, fall back to public Devnet.
 *
 * Devnet-only by design. Do NOT point these at mainnet without an audit.
 */
import { PublicKey } from "@solana/web3.js";

export const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

/** Deployed prediction-market program id (Devnet). Overridable via env. */
export const PROGRAM_ID_STR =
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
  "C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc";

/** Throws clearly if the configured program id is not a valid pubkey. */
export function getProgramId(): PublicKey {
  try {
    return new PublicKey(PROGRAM_ID_STR);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_PROGRAM_ID "${PROGRAM_ID_STR}". Set a real deployed Devnet program id.`
    );
  }
}

/** True when we have a plausibly-deployed program id configured. */
export const IS_PROGRAM_CONFIGURED = (() => {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(PROGRAM_ID_STR);
    return PROGRAM_ID_STR.length >= 32;
  } catch {
    return false;
  }
})();

/** Solana Explorer link for a transaction signature, on the active cluster. */
export function explorerTx(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_NETWORK}`;
}

/** Solana Explorer link for an account/address, on the active cluster. */
export function explorerAddress(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${SOLANA_NETWORK}`;
}
