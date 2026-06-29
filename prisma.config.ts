import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "prisma/config";

/**
 * Prisma configuration (replaces the deprecated `package.json#prisma` block,
 * which is removed in Prisma 7). Currently this only re-homes the seed command;
 * the datasource URL still comes from the schema's `env("DATABASE_URL")`, loaded
 * from `.env` by the Prisma CLI.
 *
 * NOTE: with a Prisma config file present, the CLI no longer auto-loads `.env`
 * for the SCHEMA engine in some commands. We defensively load `.env`/`.env.local`
 * here (no `dotenv` dependency required) so DATABASE_URL / TEST_DATABASE_URL stay
 * available to `migrate`, `db execute`, `db push`, `generate`, and `db:seed` —
 * matching the prior behaviour exactly. Never hardcodes a connection string.
 */
function loadDotenv(file: string): void {
  try {
    const full = path.join(process.cwd(), file);
    if (!existsSync(full)) return;
    const raw = readFileSync(full, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key in process.env) continue; // never clobber an already-set var
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // If env loading fails the underlying Prisma command will surface the real
    // "environment variable not found" error — we never invent a connection.
  }
}

loadDotenv(".env");
loadDotenv(".env.local");

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
