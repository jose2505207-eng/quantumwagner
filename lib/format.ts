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
