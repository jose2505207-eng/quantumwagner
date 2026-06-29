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
