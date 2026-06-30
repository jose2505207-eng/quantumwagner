import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Vitest config for the CLIENT component layer (React Testing Library + jsdom).
 *
 * This is a sibling of vitest.config.ts (the node authority layer). They run as
 * two projects via vitest.workspace.ts. Kept separate because:
 *   - components need a jsdom DOM + the React plugin (automatic JSX runtime),
 *     whereas the authority tests run in node;
 *   - this project must NOT load test/setup.ts (which provisions a Postgres
 *     schema) — component specs are deliberately DB-free.
 * Only test/component/** is collected here; the node project excludes that dir.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirror the tsconfig `@/*` -> `./*` path alias.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  // Stop Vite from loading the project's Tailwind v4 postcss.config.mjs, which
  // fails to load outside the Next build pipeline (same guard as the node config).
  css: {
    postcss: { plugins: [] },
  },
  test: {
    name: "component",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/component/setup.ts"],
    include: ["test/component/**/*.{test,spec}.{ts,tsx}"],
    testTimeout: 15000,
  },
});
