/**
 * Quantum Wager — runtime configuration & honesty flags.
 *
 * Single source of truth for environment-driven behaviour on the frontend.
 * IMPORTANT (product rule): anything that is NOT backed by a real service must
 * be gated behind `DEMO_MODE` and surfaced to the user as demo data. Never let
 * mock data silently masquerade as real backend/chain state.
 */

export type AppMode = "development" | "demo" | "production";

function readMode(): AppMode {
  const raw = (process.env.NEXT_PUBLIC_APP_MODE || "development").toLowerCase();
  if (raw === "production" || raw === "demo" || raw === "development") return raw;
  return "development";
}

export const APP_MODE: AppMode = readMode();

/**
 * DEMO_MODE is ON unless we are explicitly in production, OR forced on via flag.
 * When ON, screens are allowed to render clearly-labelled seed/demo data as a
 * fallback when the live backend/chain has nothing to show.
 */
export const DEMO_MODE: boolean =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || APP_MODE !== "production";

/**
 * REST backend base URL. Defaults to "" (same-origin) so the in-repo Next.js
 * API routes are used. Set NEXT_PUBLIC_API_URL to target an external backend.
 */
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "";

export const SOLANA_NETWORK: string =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export const SOLANA_RPC_URL: string =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

/**
 * The XP / quest / mission progression is a CLIENT-SIDE progression layer
 * persisted in localStorage. It is seeded from real backend signals where they
 * exist (e.g. on-chain predictions count), but the points themselves are local.
 * This flag documents that fact so the UI can label it honestly.
 */
export const PROGRESSION_IS_LOCAL = true as const;

/** Human-readable banner used wherever demo/local data is shown. */
export const DEMO_BADGE_TEXT = "DEMO";
export const LOCAL_PROGRESS_NOTE =
  "Progress is tracked locally on this device (demo). On-chain stats come from the live program.";
