# Open Questions

Questions that need a human/team answer. Each is `Unknown from current repo`
with how to verify. Do NOT guess these in code or docs. (Sourced from
`docs/wiki/12-roadmap-and-open-questions.md` and verified against the tree.)

1. **What is the canonical package manager — npm or pnpm?**
   *RESOLVED (Loop 2):* **pnpm** is canonical. `package-lock.json` is no longer
   git-tracked (only `pnpm-lock.yaml` remains) and no stray copy exists on disk.
   `README.md` is already pnpm throughout (`pnpm install`, `pnpm <script>`); it
   states "The package manager is pnpm only." (Some secondary docs under
   `docs/wiki/*` + `PRODUCTION_*` still mention `npm run`; flagged for a doc-sweep.)

2. **Where is the deployed (full) program's Rust source?**
   Only `idl/prediction_market.json` (18 instructions) is in this repo;
   `contracts/quantum_wager/` is a minimal escrow scaffold with a placeholder id.
   `docs/DEVNET_DEPLOYMENT.md` says the Anchor source is "a separate workspace."
   *Verify:* locate that workspace/repo and link it here.

3. **Are the on-chain `methods.tsx` flows exercised end-to-end on devnet today?**
   No in-repo automated proof. *Verify:* run the flows against devnet with a
   funded wallet and inspect tx signatures; ideally add an E2E harness.

4. **Is `RATE_LIMIT_ENABLED` actually enforced anywhere?**
   *RESOLVED (Loop 2):* Yes. `server/rateLimit.ts` gates on
   `RATE_LIMIT_ENABLED === "true"` and is wired into the auth routes —
   `app/api/auth/nonce/route.ts` (`rateLimit(req, "auth-nonce", 30, 60_000)`) and
   `app/api/auth/verify-wallet/route.ts` (`"auth-verify", 20, 60_000`). The limiter
   throws `HttpError(…, 429)`, which `server/http.ts`'s `handler()` maps to a 429
   response — confirmed end-to-end. (The earlier "dead code" read was a stale grep
   for `RATE_LIMIT`, which misses lowercase `rateLimit(` call sites.)

5. **Does `test/setup.ts` exist and does `pnpm test` currently pass?**
   *RESOLVED (Loop 1):* `test/setup.ts` exists and provisions a real Postgres
   `quantum_test` schema (Supabase) via `prisma db push`. `pnpm test` passes —
   **47/47** as of `feat/product-loop-1`.

6. **What live price-feed credential should the oracle `provider` mode use?**
   Loop 1 implemented `ORACLE_MODE="provider"` behind `PriceFeedProvider`
   (`server/oracleProviders.ts`) with a `StubPriceFeedProvider` that FAILS LOUDLY
   when unconfigured (never invents a price). A real adapter needs an external
   endpoint that is *not* in the repo:
   - **Pyth Hermes:** base URL `https://hermes.pyth.network` + a per-symbol 32-byte
     hex price-feed id (read via `GET /v2/updates/price/latest?ids[]=<feedId>`).
     Suggested env: `PYTH_HERMES_URL` + a per-symbol feed-id map.
   - **Switchboard On-Demand (alt):** a feed pubkey + Solana RPC (`SOLANA_RPC_URL`
     already exists, default devnet).
   *Verify/Decide:* which provider + which symbols/feed ids; then add a real
   `implements PriceFeedProvider` adapter and env wiring. Do NOT fabricate ids.
