/**
 * Luxury UI feature flag.
 * Enable the premium "Quantum Wager Design System" theme by setting
 * NEXT_PUBLIC_LUXURY_UI=true. When off, the original UI renders unchanged.
 *
 * Read this in server components or pass down; for client components the same
 * env var is inlined at build time so it's safe to read directly too.
 */
export const LUXURY_UI = process.env.NEXT_PUBLIC_LUXURY_UI === "true";
