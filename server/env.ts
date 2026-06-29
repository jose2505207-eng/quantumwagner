import { z } from "zod";

/**
 * Server env validation. Fails fast in production if required secrets are
 * missing; provides safe, clearly-insecure defaults in development so the app
 * runs locally with zero setup.
 */
// NODE_ENV is "production" during `next build` too, but we must not throw while
// merely collecting routes — only at real runtime. NEXT_PHASE distinguishes them.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const isProd = process.env.NODE_ENV === "production" && !isBuildPhase;

const schema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  JWT_SECRET: z.string().min(8).default("dev-only-insecure-secret-change-me"),
  WALLET_AUTH_MESSAGE: z
    .string()
    .default("Sign this message to login to Quantum: "),
  ORACLE_MODE: z.enum(["dev", "admin", "provider"]).default("admin"),
  ADMIN_RESOLUTION_KEY: z.string().default("dev-admin-key-change-me"),
  RATE_LIMIT_ENABLED: z.string().optional(),
  SOLANA_NETWORK: z.string().default("devnet"),
  SOLANA_RPC_URL: z.string().default("https://api.devnet.solana.com"),
  // Pyth Hermes price oracle (public, keyless). PYTH_HERMES_URL has a safe
  // default; PYTH_FEED_IDS maps symbols to 32-byte feed ids (see .env.example).
  // ORACLE_PROVIDER selects the real provider ("pyth") over the loud stub.
  PYTH_HERMES_URL: z.string().default("https://hermes.pyth.network"),
  PYTH_FEED_IDS: z.string().optional(),
  ORACLE_PROVIDER: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // In dev we tolerate; in prod we refuse to boot with bad config.
  console.error("Invalid server environment:", parsed.error.flatten().fieldErrors);
  if (isProd) throw new Error("Invalid server environment configuration");
}

export const env = parsed.success ? parsed.data : schema.parse({});

// Loud warning if running prod with the insecure dev secret.
if (isProd && env.JWT_SECRET === "dev-only-insecure-secret-change-me") {
  throw new Error("JWT_SECRET must be set to a strong value in production");
}
