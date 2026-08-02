/**
 * Global test setup. Runs BEFORE any test module is imported, so the env vars
 * below are in place when `server/env.ts` validates `process.env` at import.
 *
 * Tests run against a REAL Postgres database (the app's Supabase project), not
 * mocks: mocking Prisma would hide migration/query/schema-drift bugs, which is
 * exactly what these authority-layer tests exist to catch. To keep them fully
 * isolated from dev/prod rows, they target a dedicated `quantum_test` schema
 * (see TEST_DATABASE_URL's `?schema=quantum_test`); `public` is never touched.
 */
import { execSync } from "node:child_process";
import { beforeAll } from "vitest";

// Provided by vitest.config.ts (loaded from .env locally) or by CI env. Fall
// back to DATABASE_URL with a forced test schema so a bare DATABASE_URL still
// routes writes into quantum_test rather than public.
function resolveTestDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  const base = process.env.DATABASE_URL;
  if (!base) {
    throw new Error(
      "TEST_DATABASE_URL (or DATABASE_URL) must be set to a Postgres connection string to run the tests.",
    );
  }
  const url = new URL(base);
  url.searchParams.set("schema", "quantum_test");
  return url.toString();
}

const TEST_DATABASE_URL = resolveTestDatabaseUrl();

// Set env BEFORE server/env.ts (or anything it pulls in) is imported.
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = "test-secret";
process.env.WALLET_AUTH_MESSAGE = "Sign this message to login to Quantum: ";
process.env.ORACLE_MODE = "admin";
process.env.ADMIN_RESOLUTION_KEY = "test-admin-key";
process.env.SOLANA_NETWORK = "devnet";
process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
// Keep NODE_ENV as test so the env validator stays lenient and the Prisma
// singleton is cached on globalThis (avoids connection churn across files).
Object.assign(process.env, { NODE_ENV: "test" });

// The local .env points FASTBET_VAULT_SECRET at a FUNDED devnet keypair, and
// settling a round pays winners from it. Tests must never move real SOL, so the
// payout key is stripped here (server/fastbetVault.ts refuses it in tests too).
delete process.env.FASTBET_VAULT_SECRET;

beforeAll(() => {
  // Provision the schema on the dedicated test schema. `db push` is idempotent
  // and, because DATABASE_URL points at quantum_test, never touches `public`.
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
});
