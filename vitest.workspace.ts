import { defineWorkspace } from "vitest/config";

/**
 * Two Vitest projects run under one `pnpm test`:
 *   - vitest.config.ts            node, server authority layer (real Postgres).
 *   - vitest.component.config.ts  jsdom, React component layer (DB-free).
 * The live-devnet harness (test/e2e/**, `pnpm e2e`) is intentionally absent.
 */
export default defineWorkspace([
  "./vitest.config.ts",
  "./vitest.component.config.ts",
]);
