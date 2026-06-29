# Lessons Learned

Durable lessons for agents working on QuantumWagner. Append as new ones emerge.

## Trust the README + wiki over `docs/ARCHITECTURE.md`
`docs/ARCHITECTURE.md` predates the backend migration and described an external
Render backend. The backend is in-repo (`app/api/*` → `server/*` → Prisma). When
docs disagree, the real code + `docs/wiki/01-architecture.md` + README win. A
banner + minimal correction were added to that file; the rest may still drift.

## The honesty boundary is the product's spine
Most "bugs" that matter here are boundary violations: demo data leaking into live,
or XP/wins set client-side. Always route demo through the badged fallback
(`lib/useMarkets.ts`) and grant value only via `awardXp`/`applyResolution`. Run
the `security-review.md` skill before merging anything in that zone.

## Build vs lint gates are asymmetric
`pnpm build` fails on TS errors but ignores ESLint (`next.config.mjs`). Don't
assume a green build means clean lint — the repo carries pre-existing lint debt
(verify count with `pnpm lint`). Conversely, a stray `any`/type error WILL block
the build (this is the live `methods.tsx` risk).

## SQLite + Prisma want one process
Tests must use the single-fork Vitest config — parallel forks contend on the
SQLite file and flake. Same idea applies to local migrate/seed: one driver.

## Two lockfiles cause silent drift
`package-lock.json` and `pnpm-lock.yaml` both exist. Pick the one CI installs
from and delete the other; until then, prefer pnpm (recent commits use it) and
don't regenerate the npm lockfile by accident.

## Deployed program ≠ reference contract
The deployed devnet program (18 instructions) is consumed via the IDL only; the
Rust in `contracts/quantum_wager/` is a minimal escrow scaffold with a
placeholder id. Never reason about deployed behaviour from the reference Rust —
read `idl/prediction_market.json`.

## Two RPC sources can drift
`app/utils/useProgram.ts` and `app/utils/SolanaProvider.tsx` derive the RPC
independently. If you change RPC/network, change both (or centralise on the
env-driven value).

## Keep the auth aliases alive
`app/api/auth/verify` and `app/api/auth/profile` are legacy aliases re-exporting
the canonical `verify-wallet`/`me` handlers — the existing frontend calls the
aliases. Don't remove them when refactoring auth.

## Update the wiki where it lives
The wiki is on `origin/docs/repo-wiki`, restored onto this branch — not on
`main`. After code changes, run `node scripts/update-wiki.mjs` and edit only the
impacted pages; re-cite real files.

## Levels 1-5 are already server-authoritative (don't re-wire them)
The 6-level arena progression is wired to REAL server actions, not the local HUD:
L1 connect-wallet (auth/verify-wallet), L2 first-prediction (markets predictions
+ positions/add), L3 win-fast-bet (fast-bets resolve), L4 join-meme-battle
(battles join), L5 launch-token (launchpad tokens). All call
`completeLevelServer` (idempotent, in `server/xp.ts`). Loop 1 closed the only gap:
L6 enter-leaderboard, previously client-only, now has POST
`/api/player/levels/[levelId]/complete` guarded by a strict allowlist
(`VISIT_LEVEL_IDS`/`isVisitLevel` in `lib/game/levels.ts`) so only genuine VISIT
levels can be completed that way — action levels are rejected, never fakeable.

## Provider oracle mode fails loudly when unconfigured (by design)
`ORACLE_MODE="provider"` is real but the concrete price feed is a stub
(`server/oracleProviders.ts` `StubPriceFeedProvider`) that THROWS
"not configured" rather than inventing a price. Resolving a market via
`source:"provider"` therefore returns an honest 400 until a real
`PriceFeedProvider` (Pyth Hermes / Switchboard) + its endpoint/feed-id is wired.
This is correct honesty-boundary behavior, not a bug. See open-questions.md #6.

## Loop 2: Pyth provider is now REAL (Hermes is public/keyless)
`server/oracleProviders.ts` ships `PythHermesProvider` + `getPriceFeedProvider()`.
Hermes (https://hermes.pyth.network, `GET /v2/updates/price/latest?ids[]=<feedId>`)
needs NO credential — it was never a real blocker. Provider is selected when
`ORACLE_PROVIDER="pyth"` OR `PYTH_FEED_IDS` is set; else the loud stub. SOL/USD
ships as a VERIFIED built-in feed id
(`ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d`, confirmed
against the live catalog + price endpoint). Other symbols MUST be mapped via
`PYTH_FEED_IDS` or `getPrice()` throws -> 400. Never hardcode an unverified feed
id: a wrong 32-byte id silently prices the WRONG market. open-questions.md #6 closed.

## Grep `rateLimit(` not `RATE_LIMIT` — the limiter IS wired
`server/rateLimit.ts` is enforced (gated by `RATE_LIMIT_ENABLED === "true"`) and
already called in `app/api/auth/nonce/route.ts` (`"auth-nonce"`) and
`app/api/auth/verify-wallet/route.ts` (`"auth-verify"`). A grep for the literal
`RATE_LIMIT` misses the lowercase `rateLimit(` call sites and falsely reads it as
dead code. `HttpError(429)` -> 429 via `server/http.ts` `handler()`. open-questions #4 closed.

## Fast-bets feed exposes per-side split + live price (no schema change)
`GET /api/fast-bets` returns `yesPool`/`noPool` (one `groupBy`, no N+1) and
`currentPrice` (live oracle per distinct symbol, fetched once; `null` on any
provider failure — never invented, never 500s the feed). `POST /api/fast-bets/generate`
is the admin/cron endpoint (ADMIN_RESOLUTION_KEY) that spawns live rounds to keep
the feed `live` not `demo`. The fast-bets UI polls every 15s via a quiet
background reload (skips the spinner) with an in-flight ref guard.

## Loop 3: Supabase migrations — `migrate dev` fails (no shadow DB); use diff + db execute + resolve
The `app_user` role CANNOT create the shadow database, so `pnpm prisma migrate dev`
dies with `P3014 / permission denied to create database`. The working pattern that
keeps BOTH the live Supabase DB and Prisma's migration history in sync:
  1. Edit `prisma/schema.prisma`.
  2. `pnpm prisma migrate diff --from-schema-datasource prisma/schema.prisma \
        --to-schema-datamodel prisma/schema.prisma --script`  → the DDL.
  3. Write it to `prisma/migrations/<UTC-timestamp>_<name>/migration.sql`.
  4. `pnpm prisma db execute --file <that file> --schema prisma/schema.prisma`  (applies to live DB).
  5. `pnpm prisma migrate resolve --applied <migration_name>`  (records it in `_prisma_migrations`).
  6. `pnpm prisma generate`.
`pnpm prisma migrate status` then reports "Database schema is up to date!". CI's
`prisma migrate deploy` (against its ephemeral Postgres) replays the same SQL.

## Loop 3: live-feed loop is closed end-to-end (scheduler + auto-resolve)
`FastBet` gained `startPrice Float?` (baseline captured at round creation) and
`resolutionSource String?`. `POST/GET /api/fast-bets/generate` now stores a
provider baseline (null if the feed throws — never invented). NEW
`/api/fast-bets/auto-resolve` settles EXPIRED live rounds: outcome =
`currentPrice > startPrice ? YES : NO` (source `provider:pyth`); a round whose
price can't be fetched is SKIPPED, never invented. Settlement was extracted into
`server/fastbetSettlement.ts` (`settleFastBet({fastBetId,outcome,source})`) shared
by the admin resolve route (source `admin`) and auto-resolve. Schedulers:
`vercel.json` crons (auto-resolve `* * * * *`, generate `*/5 * * * *`, Vercel sends
GET + injects `Authorization: Bearer ${CRON_SECRET}`) and
`.github/workflows/cron-fastbets.yml` (every 5m, curls with the same Bearer).
Endpoints authorize via `CRON_SECRET` (cron) OR `ADMIN_RESOLUTION_KEY` (admin POST).

## Loop 3: oracle hardening — short-TTL cache, BTC/ETH feeds, ops probe
`server/oracleProviders.ts` now wraps the chosen provider in
`CachingPriceFeedProvider` (5s TTL, module-level Map keyed `name:SYMBOL`) INSIDE
`getPriceFeedProvider()` — collapses Hermes round-trips on the hot path WITHOUT
changing `PriceFeedProvider` semantics. ONLY successes are cached (the `set`
runs after the `await`, so a throw is never cached → loud-failure honesty intact;
unit tests build providers directly = uncached). Verified built-in feed ids added:
BTC/USD `e62df6c8…415b43`, ETH/USD `ff61491a…fd0ace` (both confirmed live against
Hermes catalog + price endpoint, expo -8). NEW admin-guarded
`GET /api/oracle/price?symbol=` (x-admin-key / ?adminKey) returns
`{price,confidence,publishTime,source}` or a 502 with the loud error — ops probe,
never a fake price.

## Loop 4: verification catch-up (gate ON) + as-of-endTime settlement
**Gate result:** typecheck 0 errors · `pnpm test` 71/71 (was 56) · `pnpm build`
exit 0 — all green against the real `quantum_test` Supabase schema. No new
migration this loop.

**The only Loops 1–3 breakage found:** `app/api/fast-bets/generate/route.ts` had
`const fastBets = []` inferred as `never[]`, so `prisma.fastBet.create(...)`
push failed `tsc`. Fixed by typing the accumulator `FastBet[]`. Test + build
were otherwise green; Loop 3 was structurally sound, just one type error.

**Loop-3 test gap (now closed):** `settleFastBet` + `runAutoResolve` had ZERO
tests. Added `test/integration/fastbet-settlement.test.ts` (pro-rata split,
milestone, already-resolved guard, audit context) and
`fastbet-autoresolve.test.ts` (derivation, as-of-endTime, spot-fallback, skip,
expiry gate, idempotency), plus `getPriceAt` unit tests.

**Pyth oracle endpoints (verified live, keyless):** TWAP
(`/v2/updates/twap/{w}/latest`) is DEPRECATED — returns "The TWAP endpoint has
been deprecated and is no longer available." Do NOT build on it. The Benchmarks
endpoint `GET /v2/updates/price/{unixSeconds}?ids[]=<id>` IS live and returns the
SAME `parsed[].price` shape (`{price,conf,expo,publish_time}`) as
`/latest` — it serves the price as of that second. This is the basis of the
as-of-endTime settle path.

**Fairness fix (auto-resolve):** settlement now prefers the price AS OF the
round's `endTime` (`PriceFeedProvider.getPriceAt`, optional/capability-detected)
over the cron-tick spot. `captureSettlementPrice` records method honestly:
`asof` | `spot-fallback` (getPriceAt threw) | `spot` (no history capability). The
price/method/drift go into the audit-log meta via `settleFastBet`'s new optional
`context` arg; `resolutionSource` stays the stable `provider:<name>` attribution
(method is NOT crammed into it, so the UI badge renders a clean oracle name).
`runAutoResolve` moved to `server/fastbetAutoResolve.ts` — Next route modules may
only export handlers + config; the move also makes it injectable (provider/now)
for tests.

**Suspected Loop-3 bug (flagged for Loop 5, NOT fixed in catch-up):** the
`priorWins === 0` branch of `settleFastBet` grants the win-fast-bet milestone via
`completeLevelServer` but passes NO `win:true`, so a player's FIRST fast-bet win
never increments `profile.wins` — the wins stat (and season leaderboard wins)
lags actual wins by one. Pinned as real behavior in the settlement test.

## Loop 5: first-win `wins` bug FIXED + settle price columns + Prisma 7 prep
**Gate:** typecheck 0 · `pnpm test` GREEN (settlement spec 4→7) · `pnpm build` exit 0,
against the real `quantum_test` Supabase schema. One new migration (applied to Supabase).

**Wins fix (A):** `completeLevelServer` gained an optional `win?: boolean`
forwarded to `awardXp`; `settleFastBet`'s first-win (`priorWins === 0`) branch now
passes `win: true`. KEY INSIGHT for leaderboard reconciliation: `awardXp` already
sets the season `LeaderboardEntry.wins` to the recomputed authoritative
`profile.wins` (not an increment) — so fixing `profile.wins` reconciles the
leaderboard for free, no extra write. The fix is FORWARD-ONLY: pre-Loop-5 rows that
under-counted are not backfilled. `win` is omitted for non-competitive milestones
(connect-wallet / visit-leaderboard) so those stay level-completions, not wins.

**Settle columns (B):** `FastBet.settlePrice Float?` + `settleMethod String?` added.
SMALLEST-CHANGE TRICK: `settleFastBet` DERIVES the column values from the existing
settlement `context` (`context.settlePrice` / `context.method`) it already
receives — so `runAutoResolve` and the admin resolve route needed ZERO changes,
and the audit-meta path is untouched (existing audit test stays green). Admin path
(no context) → both null. Surfaced on resolved `FastBetCard`s ("Settled at $X" +
method label), honest: only a finite recorded number renders.

**Prisma config (C):** removed the deprecated `package.json#prisma` block; added
`prisma.config.ts` with `migrations.seed`. CRITICAL TRAP (verified live): once a
Prisma config file exists, Prisma PRINTS "Prisma config detected, skipping
environment variable loading" and does NOT auto-load `.env` — the test setup's
`prisma db push` against `TEST_DATABASE_URL` would break. Fix: `prisma.config.ts`
loads `.env`/`.env.local` itself via a tiny inline zero-dep parser (no `dotenv` —
it is not a hoisted/resolvable direct dep here). Verified: test setup connected to
`quantum_test` after the change. The Prisma 7 deprecation warning is now gone.

**Migration via the Supabase workaround (unchanged, reconfirmed):** edit schema →
`prisma migrate diff --from-schema-datasource → --to-schema-datamodel --script` →
write `prisma/migrations/<ts>_<name>/migration.sql` → `prisma db execute --file` →
`prisma migrate resolve --applied <name>` → `pnpm db:generate`. `migrate status`
then reads "up to date"; columns verified live via Supabase MCP `execute_sql`.
Migration: `20260629070918_fastbet_settle_price_and_method`.

**Parallel decomposition that worked:** serialized files (schema, xp.ts,
fastbetSettlement.ts, package.json, lockfile) were edited ONLY by the orchestrator;
the ESLint burn-down ran as ONE background agent on a DISJOINT file set with an
explicit exclusion list (incl. the build-fragile `methods.tsx`) and a
"keep typecheck 0" guard, then integrated centrally.
