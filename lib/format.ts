import { BN, web3 } from "@coral-xyz/anchor";

const { PublicKey } = web3;

/**
 * Best-effort display formatter for on-chain values (BN, PublicKey, hex, etc).
 *
 * Previously a named export on `app/portfolio/token/[mid]/page.tsx`, which
 * Next.js disallows for route files. Moved here so it can be imported anywhere.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts BN | PublicKey | primitives
export const toDisplay = (val: any): string => {
  if (val === null || val === undefined) return "N/A";
  try {
    if (val instanceof PublicKey) return val.toBase58();
    if (typeof val === "object" && val.words) return new BN(val).toString();
    if (BN.isBN?.(val)) return val.toString();
    if (typeof val === "string" && /^[0-9a-fA-F]+$/.test(val))
      return parseInt(val, 16).toLocaleString();
    return val.toString();
  } catch {
    return String(val);
  }
};

const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Convert an on-chain lamports value to a Number of SOL.
 *
 * Every SOL-denominated `u64` on this program (current_price, initial_price,
 * current_market_cap, pools, …) is lamports. Rendering one straight through
 * `toDisplay()` and appending " SOL" is why a 0.1 SOL launch price displayed as
 * "100000000 SOL".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts BN | number | string
export const lamportsToSol = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const n = Number(typeof val === "object" ? toDisplay(val) : val);
  return Number.isFinite(n) ? n / LAMPORTS_PER_SOL : 0;
};

/**
 * Format a lamports value as a SOL string. Bonding-curve prices are small, so
 * significant digits are kept rather than a fixed 2dp that would render "0.00".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts BN | number | string
export const formatSolFromLamports = (val: any, maxDecimals = 9): string => {
  if (val === null || val === undefined) return "N/A";
  const sol = lamportsToSol(val);
  if (sol === 0) return "0";
  // Below display precision, show a floor marker instead of a misleading "0".
  if (Math.abs(sol) < 10 ** -maxDecimals) return `<${10 ** -maxDecimals}`;
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};
