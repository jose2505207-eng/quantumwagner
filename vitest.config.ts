import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest config for the server authority layer tests.
 *
 * Prisma + a single SQLite file must be driven by ONE process, otherwise the
 * file lock contends and tests flake. We force a single fork for that reason.
 */
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
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 20000,
  },
});
