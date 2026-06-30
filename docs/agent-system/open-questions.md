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
   *Status (Loop 7) — recon done, STILL OPEN (external):* a full sweep of all
   branches, remotes (incl. `copilot/*`, `docs/*`), and `git log --all` history
   found the deployed Rust source **nowhere in this repo**. `git log --all
   --diff-filter=A` lists exactly one `.rs` path — the 4-instruction
   `contracts/quantum_wager/.../lib.rs` scaffold (placeholder id
   `Quantum111…`), which is categorically NOT the 18-instruction deployed program.
   No `target/`, no `*.so`, no upgrade keypair; the IDL embeds no source. So the
   program is consumed **IDL-only**: it cannot be audited or rebuilt/redeployed
   from here, and the IDL is trusted blind. Recovery is external only — `anchor
   idl fetch` (interface check), `solana program show … --url devnet` to find the
   upgrade authority and request the source, or the original (likely private)
   Anchor workspace. Do NOT fabricate a source location.

3. **Are the on-chain `methods.tsx` flows exercised end-to-end on devnet today?**
   No in-repo automated proof. *Verify:* run the flows against devnet with a
   funded wallet and inspect tx signatures; ideally add an E2E harness.
   *Status (Loop 3):* DEFERRED — blocked on a funded devnet keypair (credential
   being requested from the team). `.gitignore` now excludes `.devnet/` so a local
   keypair can be dropped in for the E2E run without risk of committing it. Do NOT
   fabricate signatures; this stays open until a real run is captured.
   *RESOLVED (Loop 7):* **proven on live devnet with a real, confirmed transaction.**
   `pnpm e2e` (`test/e2e/devnet-e2e.ts`, excluded from CI) reads the real
   `PlatformConfig` PDA, verifies live accounts by **deterministic PDA derivation**
   (4 token launches, 7 battles, 0 markets — matching the on-chain counters, with
   NO `getProgramAccounts`, so it works on free-tier RPC), and signs + confirms a
   0-lamport self-transfer. Funded keypair `EBJjWqRqR6qidwo9qNNpaDvveX6A5PRD1avtxvDkVphA`
   (~1 SOL) + an authenticated Alchemy devnet `ANCHOR_PROVIDER_URL` (gitignored
   `.env`). Cluster proven by genesis hash. Sample real tx:
   `9c7hGBgp1ELMZSNm3WMHAjhAbgf2MmFSoYNsCyJFZdrAXxkYyiarZa8JUHJrJLK15M8EYat7Dpbor5NWKLMWpNA`
   (`?cluster=devnet`). Run with `NODE_OPTIONS="--dns-result-order=ipv4first" pnpm e2e`.
   Remaining: this proves reachability + signing, not the full create/bet/settle
   instruction path end-to-end — a deeper harness could exercise one real
   read-modify instruction next.

4. **Is `RATE_LIMIT_ENABLED` actually enforced anywhere?**
   *RESOLVED (Loop 2):* Yes. `server/rateLimit.ts` gates on
   `RATE_LIMIT_ENABLED === "true"` and is wired into the auth routes —
   `app/api/auth/nonce/route.ts` (`rateLimit(req, "auth-nonce", 30, 60_000)`) and
   `app/api/auth/verify-wallet/route.ts` (`"auth-verify", 20, 60_000`). The limiter
   throws `HttpError(…, 429)`, which `server/http.ts`'s `handler()` maps to a 429
   response — confirmed end-to-end. (The earlier "dead code" read was a stale grep
   for `RATE_LIMIT`, which misses lowercase `rateLimit(` call sites.)
   *Extended (Loop 7):* the limiter is now backed by a pluggable `RateLimitStore`
   (`server/rateLimit.ts`) — `MemoryStore` default, opt-in `RedisStore` (Upstash
   REST via `fetch`, gated by `RATE_LIMIT_REDIS_URL`+`RATE_LIMIT_REDIS_TOKEN`) for
   multi-instance deploys. `rateLimit()` is now async (call sites `await`), and
   **fails open** if the backend is unreachable. Zero behavior change without the
   new env.

5. **Does `test/setup.ts` exist and does `pnpm test` currently pass?**
   *RESOLVED (Loop 1):* `test/setup.ts` exists and provisions a real Postgres
   `quantum_test` schema (Supabase) via `prisma db push`. `pnpm test` passes —
   **47/47** as of `feat/product-loop-1`; **71/71** as of `feat/product-loop-4`
   (Loop 4 added settlement + auto-resolve + `getPriceAt` coverage).

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
   *RESOLVED + extended (Loops 2–3):* **Pyth Hermes** is the provider (public,
   keyless). Verified built-in feed ids: SOL/USD, **BTC/USD**
   (`e62df6c8…415b43`), **ETH/USD** (`ff61491a…fd0ace`) — all confirmed live
   against the Hermes catalog + price endpoint. Loop 3 added a 5s in-memory price
   cache (`CachingPriceFeedProvider`), an admin-guarded ops probe
   `GET /api/oracle/price?symbol=`, and closed the live-feed loop end-to-end
   (baseline `startPrice` capture + `/api/fast-bets/auto-resolve` settling expired
   rounds via the feed, scheduled by `vercel.json` + a GitHub Actions workflow).
   Add more symbols via `PYTH_FEED_IDS`; an unmapped symbol still throws (honest).
   *Extended (Loop 4):* added `getPriceAt(symbol, unixSeconds)` on the provider,
   backed by the Pyth **Benchmarks** endpoint `GET /v2/updates/price/{ts}` (verified
   live, keyless, same parsed shape as `/latest`) so auto-resolve settles on the
   price AS OF `endTime`. NOTE: the Pyth **TWAP** endpoint
   (`/v2/updates/twap/{w}/latest`) is **DEPRECATED** and returns an error — do not
   build on it; a single Benchmarks read at `endTime` is the honest substitute.
