/**
 * Global test setup. Runs BEFORE any test module is imported, so the env vars
 * below are in place when `server/env.ts` validates `process.env` at import.
 *
 * We use a REAL SQLite database (prisma/test.db), not mocks: mocking Prisma
 * would hide migration/query/schema-drift bugs, which is exactly what these
 * authority-layer tests exist to catch. The dev db (prisma/dev.db) is never
 * touched — we push the schema to a dedicated test file.
 */
import { execSync } from "node:child_process";
import { beforeAll } from "vitest";

// Prisma resolves a relative SQLite url against the schema directory (prisma/),
// exactly like the app's default "file:./dev.db" -> prisma/dev.db. So this
// lands at prisma/test.db, which the repo .gitignore already excludes
// (prisma/*.db), and never collides with the dev db.
const TEST_DATABASE_URL = "file:./test.db";

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

beforeAll(() => {
  // Provision the schema on the dedicated test db. `db push` is idempotent and
  // never migrates/resets the dev db because DATABASE_URL points at test.db.
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
});
