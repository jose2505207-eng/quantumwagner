import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest config for the server authority layer tests.
 *
 * The tests run against a real Postgres database (the app's Supabase project),
 * using a dedicated `quantum_test` schema so they never touch dev/prod data.
 * Prisma + that schema must be driven by ONE process to avoid lock contention,
 * so we force a single fork.
 *
 * `process.loadEnvFile()` (Node 20.12+) hydrates process.env from `.env` for
 * LOCAL runs; the forked test worker inherits it. CI has no `.env` and sets
 * DATABASE_URL / TEST_DATABASE_URL directly, so this is a harmless no-op there.
 */
try {
  process.loadEnvFile();
} catch {
  // No .env file (e.g. CI) — env vars are provided by the environment instead.
}

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig `@/*` -> `./*` path alias.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  // Node-only authority-layer tests never render components. Supplying an inline
  // empty PostCSS config stops Vite from loading the project's Tailwind v4
  // postcss.config.mjs (which fails to load outside the Next build pipeline).
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    // Never collect tests from agent worktrees (.claude/worktrees/**) or build
    // output — an isolated subagent's worktree carries duplicate *.test.ts copies
    // that pollute the count and load-fail if the worktree is removed mid-run.
    // `test/e2e/**` is the live-devnet on-chain harness (`pnpm e2e`): it needs a
    // funded wallet + RPC and must never gate the node-only authority suite/CI.
    // `test/component/**` is the jsdom React layer — it runs as its own project
    // (vitest.component.config.ts) and must not be collected in this node env.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/.claude/**", "test/e2e/**", "test/component/**"],
    // Forward the resolved DB URLs to the worker explicitly (belt-and-braces
    // alongside process.env inheritance).
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
    },
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 30000,
  },
});
