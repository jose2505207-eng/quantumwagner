import { z } from "zod";
import { assertNotMainnet, assertDevnetNetwork } from "@/lib/solanaNetwork";

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
  // Optional distributed limiter backend (Upstash Redis REST). When BOTH are set
  // the limiter uses Redis instead of in-memory; absence keeps memory behavior.
  RATE_LIMIT_REDIS_URL: z.string().optional(),
  RATE_LIMIT_REDIS_TOKEN: z.string().optional(),
  // Optional monitoring sink. MONITORING_DSN set -> unhandled 5xx are POSTed as
  // JSON; unset (or MONITORING_ENABLED="false") -> no-op. Provider-agnostic.
  MONITORING_ENABLED: z.string().optional(),
  MONITORING_DSN: z.string().optional(),
  SOLANA_NETWORK: z.string().default("devnet"),
  SOLANA_RPC_URL: z.string().default("https://api.devnet.solana.com"),
  // Server/Anchor RPC for on-chain + E2E paths (may carry an authenticated key —
  // server-side only, never exposed to the browser). Optional: falls back to
  // SOLANA_RPC_URL when unset. Must be devnet (guarded below).
  ANCHOR_PROVIDER_URL: z.string().optional(),
  ANCHOR_WALLET: z.string().optional(),
  NEXT_PUBLIC_SOLANA_RPC_URL: z.string().optional(),
  // Pyth Hermes price oracle (public, keyless). PYTH_HERMES_URL has a safe
  // default; PYTH_FEED_IDS maps symbols to 32-byte feed ids (see .env.example).
  // ORACLE_PROVIDER selects the real provider ("pyth") over the loud stub.
  PYTH_HERMES_URL: z.string().default("https://hermes.pyth.network"),
  PYTH_FEED_IDS: z.string().optional(),
  ORACLE_PROVIDER: z.string().optional(),
  // Shared secret for scheduled (cron) invocations. When unset, cron GET auth
  // never authorizes — admin POST (ADMIN_RESOLUTION_KEY) still works.
  CRON_SECRET: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // In dev we tolerate; in prod we refuse to boot with bad config.
  console.error("Invalid server environment:", parsed.error.flatten().fieldErrors);
  if (isProd) throw new Error("Invalid server environment configuration");
}

export const env = parsed.success ? parsed.data : schema.parse({});

// ---------------------------------------------------------------------------
// Devnet-only safety guard — UNCONDITIONAL (dev, build, and prod). Pointing any
// Solana endpoint at mainnet, or setting a non-devnet network, is a hard refusal
// regardless of NODE_ENV. These never echo a full URL (key-safe).
// ---------------------------------------------------------------------------
assertDevnetNetwork(env.SOLANA_NETWORK, "SOLANA_NETWORK");
assertNotMainnet(env.SOLANA_RPC_URL, "SOLANA_RPC_URL");
assertNotMainnet(env.ANCHOR_PROVIDER_URL, "ANCHOR_PROVIDER_URL");
assertNotMainnet(env.NEXT_PUBLIC_SOLANA_RPC_URL, "NEXT_PUBLIC_SOLANA_RPC_URL");

// ---------------------------------------------------------------------------
// Production-only required secrets. Fail fast with ONE clear message listing
// everything that is missing or still on an insecure dev default.
// ---------------------------------------------------------------------------
if (isProd) {
  const problems: string[] = [];
  if (env.JWT_SECRET === "dev-only-insecure-secret-change-me")
    problems.push("JWT_SECRET (still the insecure dev default)");
  if (env.ADMIN_RESOLUTION_KEY === "dev-admin-key-change-me")
    problems.push("ADMIN_RESOLUTION_KEY (still the insecure dev default)");
  if (!process.env.DATABASE_URL) problems.push("DATABASE_URL (unset)");
  if (!process.env.WALLET_AUTH_MESSAGE)
    problems.push("WALLET_AUTH_MESSAGE (unset)");
  if (problems.length) {
    throw new Error(
      `Invalid production environment — fix the following: ${problems.join("; ")}.`
    );
  }
}
