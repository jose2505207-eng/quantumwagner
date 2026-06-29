# Known Risks

Verified against the real repo. Each entry: the fact, where it lives, the impact.

## Active / being fixed

- **TypeScript build error in `app/utils/methods.tsx` (being fixed).** TS errors
  now fail `pnpm build` (`next.config.mjs`). This is the largest on-chain
  instruction-composer file; a type error here blocks the build until resolved.
  *Verify:* `pnpm typecheck`.
- **Hardcoded RPC drift (being centralised).** `app/utils/useProgram.ts` reads
  `NEXT_PUBLIC_SOLANA_RPC_URL` with a devnet fallback, but
  `app/utils/SolanaProvider.tsx` uses `clusterApiUrl(devnet)`. Two RPC sources can
  drift; intent is to centralise on one env-driven source.

## Tech debt

- **Lockfile RESOLVED (Loop 2):** pnpm is canonical; `package-lock.json` is no
  longer tracked, only `pnpm-lock.yaml`. Residual `npm run` command refs in docs
  were scrubbed to pnpm in Loop 3 (two npm-only `--legacy-peer-deps`
  troubleshooting rows intentionally kept — that flag doesn't exist under pnpm).
- **ESLint errors as tech debt (burn-down Loops 5–6).** ESLint is NOT
  enforced at build time (`next.config.mjs eslint.ignoreDuringBuilds: true`)
  because the legacy codebase has pre-existing lint problems (mostly
  `@typescript-eslint/no-explicit-any` in on-chain/UI code + a few
  `react/no-unescaped-entities`). Burn-down is real (no rule mass-disabling).
  *Verify exact count:* `pnpm lint`. **Loop 6 took the error count 20 → 4** by
  hardening `app/battlearena/new/page.tsx` (2) and `app/utils/methods.tsx` (17 → 3,
  the bulk). The skill is now formalised: `.agent-system/skills/lint-burndown.md`.
  The **4 remaining errors**: 3 in `methods.tsx` are container `any`s
  (`BoughtToken.tokenData`, the two `getAllBattles`/`getUserBattles` `data` arrays)
  that CANNOT be tightened to the precise Anchor-decoded IDL type without cascading
  type errors into UI consumers (`app/battlearena/*`, `app/portfolio/battle/*`,
  `app/portfolio/token/*`) whose hand-written `BattleData`/token shapes diverge
  from the IDL (`PublicKey` vs `string`, `null` vs `undefined`) — see Loop 7 backlog;
  the 4th is `contracts/quantum_wager/tests/quantum_wager.ts:51` (a test-scaffold
  `any`, out of the product burn-down scope). NOTE: `methods.tsx` is still the
  build-fragile on-chain composer — type it in small batches with `pnpm typecheck`
  + `pnpm build` after EACH batch (Loop 6 confirmed catch-narrowing + Anchor enum
  types are safe; tightening the container account types is NOT, until UI types align).
- **Prisma config moved to `prisma.config.ts` (Loop 5, Prisma 7 prep).** The
  deprecated `package.json#prisma` block was removed and replaced by
  `prisma.config.ts` (`migrations.seed`). TRAP: with a Prisma config file present,
  the CLI/`prisma db push` STOPS auto-loading `.env` ("Prisma config detected,
  skipping environment variable loading"). `prisma.config.ts` therefore loads
  `.env`/`.env.local` itself with a tiny zero-dep loader so DATABASE_URL /
  TEST_DATABASE_URL stay available to migrate/generate/db push (test setup) and
  `db:seed`. Do NOT delete that loader or the test DB connection + migrations break.
- **CI exists** (`.github/workflows/ci.yml`: generate → migrate deploy → typecheck
  → build → test against an ephemeral Postgres; lint non-blocking). NOTE: Loops 1–3
  product work ran under a **max-throughput directive that SKIPPED typecheck/test/
  build locally** — CI was the safety net, so a red CI run was expected until a
  catch-up pass. *Resolved (Loop 4):* the validation gate is back ON and GREEN —
  `pnpm typecheck` 0 errors, `pnpm test` 71/71, `pnpm build` exit 0 against the
  real `quantum_test` Supabase schema. The only accumulated breakage was one
  `never[]` inference in `app/api/fast-bets/generate/route.ts` (fixed).

## Chain / program

- **Deployed program ≠ in-repo reference contract.** The deployed devnet program
  `C8SAQXW3…toSc` (IDL: 18 instructions — markets, battles, tokens, bonding
  curves, reputation) is far richer than `contracts/quantum_wager/` (minimal
  escrow scaffold, placeholder id). **The full deployed program's Rust source is
  NOT in this repo** — only `idl/prediction_market.json`. Do not assume the
  reference Rust matches the deployed IDL feature-for-feature.
- **On-chain flows unproven E2E in-repo.** No automated evidence that
  `methods.tsx` flows succeed against devnet today (open question).

## Documentation / process

- **`docs/ARCHITECTURE.md` was stale** (described an external Render backend). A
  banner + minimal in-place correction were added pointing to
  `docs/wiki/01-architecture.md`; the rest of that file may still drift — prefer
  the wiki.
- **The wiki was not merged to `main`.** It lives on `origin/docs/repo-wiki` and
  was **restored onto this branch** into `docs/wiki/`. `WIKI.md` at root was a
  dangling pointer until this restore. Until a merge lands, `main` lacks the wiki.

## Scheduler / oracle (Loop 3)

- **Auto-resolve settlement price (IMPROVED Loop 4; residual risk noted).** Loop 3
  settled `YES` iff `currentPrice > startPrice` using the SPOT price at the jittery
  cron tick. Loop 4 now settles on the price AS OF the round's `endTime` via the
  Pyth Benchmarks endpoint (`GET /v2/updates/price/{unixSeconds}`, verified live)
  through `PriceFeedProvider.getPriceAt` — see `server/fastbetAutoResolve.ts`
  `captureSettlementPrice`. The method is recorded honestly in the audit-log meta
  (`asof` | `spot-fallback` when Benchmarks throws | `spot` when the provider has
  no history capability), alongside `settlePrice`/`publishTime`/`driftSec`.
  *Residual:* it is still a single point read (no TWAP — the Hermes TWAP endpoint
  is DEPRECATED), and a `spot-fallback` reintroduces cron-tick jitter for that
  round. A round whose price can't be fetched is still SKIPPED (left unresolved),
  never invented — honest, but it can linger until a later run.
  *Loop 5:* the settle price + capture method are now FIRST-CLASS FastBet columns
  (`settlePrice Float?`, `settleMethod String?`), promoted out of the audit-log
  meta by `settleFastBet` (derived from the same settlement `context`) and
  surfaced on resolved fast-bet cards (honest: only a real recorded number/string;
  null on the admin path). Migration `20260629070918_fastbet_settle_price_and_method`.
- **`profile.wins` undercount on the FIRST fast-bet win — RESOLVED (Loop 5).**
  Was: `server/fastbetSettlement.ts` `priorWins === 0` branch granted the
  win-fast-bet milestone via `completeLevelServer` WITHOUT `win:true`, so a
  player's first win never incremented `profile.wins` nor the season leaderboard.
  Fix: `completeLevelServer` now takes an optional `win?: boolean` forwarded to
  `awardXp`, and the first-win branch passes `win: true`. Because `awardXp`
  sets the season `LeaderboardEntry.wins` to the authoritative `profile.wins`,
  the leaderboard reconciles automatically. The Loop-4 test that pinned the buggy
  behavior was flipped, and a leaderboard-reconciliation test added
  (`test/integration/fastbet-settlement.test.ts`). NOTE: this fix is forward-only
  — historical rows that under-counted before Loop 5 are NOT backfilled (Loop 6
  backlog: a one-shot reconcile if pre-Loop-5 wins matter).
- **`CRON_SECRET` must be set on the deployment** for any cron path to authorize
  (Vercel injects `Authorization: Bearer ${CRON_SECRET}`; the GitHub workflow needs
  repo secrets `CRON_SECRET` + `APP_BASE_URL`). When unset, cron silently 403s and
  the feed stops refreshing/settling — admin POST still works. Not committed (env).
- **Price cache is per-process/per-lambda** (`CachingPriceFeedProvider`, 5s TTL,
  module-level Map). It is a hot-path round-trip reducer, NOT a correctness or
  cross-instance consistency mechanism; two lambdas can hold prices up to 5s apart.
  Failures are never cached (loud-failure honesty preserved).
- **Vercel Cron is GET-only**, so `/api/fast-bets/generate` has a cron GET handler
  that creates rounds from validator DEFAULTS (SOL/USD). Its admin POST (JWT +
  `ADMIN_RESOLUTION_KEY`) is unchanged. Don't remove the GET path or the scheduler
  breaks.

## Security boundary (must not regress)

- The **honesty boundary** (`lib/game/config.ts`, `server/xp.ts`,
  `server/oracle.ts`, `lib/useMarkets.ts`) is load-bearing: progression is local +
  labelled, demo is fallback-only + badged, value (XP/wins/settlement) is
  server-only, outcomes come from resolver adapters never invented. Any change
  that lets mock data render as live, or grants XP/wins client-side, is a
  regression. See `docs/SECURITY_NOTES.md`.
- **Devnet-only & unaudited.** No mainnet without audit + economic + legal review.
