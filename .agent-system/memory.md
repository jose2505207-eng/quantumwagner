# Memory — Durable Facts

Stable facts about QuantumWagner, verified against the repo. Update only when the
underlying code/config changes.

## Build / run / test

- **Build:** `pnpm build` (`next build`). **TypeScript errors FAIL the build**;
  **ESLint does NOT** block the build (`next.config.mjs`:
  `eslint.ignoreDuringBuilds: true`). Run `pnpm lint` separately.
- **Typecheck:** `pnpm typecheck` (`tsc --noEmit`).
- **Dev:** `pnpm dev`; health probe `curl localhost:3000/api/health`.
- **Test:** `pnpm test` (`vitest run`) runs **two Vitest projects** via
  `vitest.workspace.ts` (Loop 7): (1) the **server authority layer** —
  `vitest.config.ts`, `environment:"node"`, single fork, `test/setup.ts`
  (provisions a real Postgres `quantum_test` schema); (2) the **client component
  layer** — `vitest.component.config.ts`, `jsdom` + `@testing-library/react`,
  DB-free `test/component/setup.ts`, specs in `test/component/**`. The node project
  `exclude`s `test/component/**` and `test/e2e/**`. 106 tests as of Loop 7.
  `pnpm test:watch` to iterate. Live on-chain proof is separate: `pnpm e2e`
  (`test/e2e/devnet-e2e.ts`) — needs a funded devnet wallet, never gates CI.

## Database

- **SQLite via Prisma.** `DATABASE_URL="file:./dev.db"` by default;
  `prisma/schema.prisma` defines 21 models; client singleton in `server/db.ts`.
- Scripts: `pnpm db:generate`, `pnpm db:migrate` (dev, creates committed
  migration), `pnpm db:migrate:deploy` (apply existing), `pnpm db:seed`
  (`tsx prisma/seed.ts`), `pnpm db:reset` (destructive), `pnpm db:studio`.
- `PlayerProfile.completedLevels` is a JSON **string**. SQLite statuses are plain
  strings (no native enums). `XPEvent` + `AuditLog` are append-only.

## Architecture / authority

- Backend is **in-repo**: `app/api/**/route.ts` (thin, `handler()`-wrapped,
  `runtime="nodejs"` + `dynamic="force-dynamic"`) → `server/*.ts` → Prisma. Not an
  external Render service (that claim in `docs/ARCHITECTURE.md` is stale).
- **Honesty boundary (design rule):** progression is local + labelled
  (`lib/game/config.ts`, `store/useGameStore.ts`); demo data is fallback-only +
  badged (`lib/useMarkets.ts`, `lib/demo/markets.ts`, `<DemoBadge/>`); value
  (XP/wins/settlement) is server-only — `awardXp` (`server/xp.ts`) is the ONLY XP
  path, `applyResolution` (`server/oracle.ts`) the ONLY settlement path; outcomes
  come from resolver adapters (`dev` trusts caller, `admin` requires
  `ADMIN_RESOLUTION_KEY`), never invented.

## Chain

- Deployed devnet program: `C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`,
  consumed in-browser via `idl/prediction_market.json` (18 instructions) +
  `app/utils/{useProgram.ts,methods.tsx}` + `config.ts`.
- `contracts/quantum_wager/` is a **minimal reference scaffold** (placeholder id,
  escrow only) — NOT the deployed source. **The full deployed program's Rust
  source is not in this repo.**

## Known situations

- **Package manager = pnpm (canonical).** `package-lock.json` is no longer tracked;
  only `pnpm-lock.yaml`. Use `pnpm <script>` (not `npm run`).
- **Supabase migrations:** `pnpm prisma migrate dev` FAILS (`app_user` can't create
  the shadow DB, `P3014`). Use `migrate diff` → write `migration.sql` → `db execute`
  → `migrate resolve --applied` → `generate`. See
  `.agent-system/skills/database-migration-safety.md`.
- The wiki lives on `origin/docs/repo-wiki` and was **restored onto this branch**
  into `docs/wiki/`; it is NOT on `main`. Keep it current with
  `node scripts/update-wiki.mjs`.
- **Prisma config = `prisma.config.ts`** (Loop 5; the `package.json#prisma` block
  was removed for Prisma 7). A config file makes Prisma SKIP `.env` auto-loading
  ("Prisma config detected, skipping environment variable loading"), so
  `prisma.config.ts` loads `.env`/`.env.local` itself — don't delete that loader or
  `prisma db push`/migrate/generate lose DATABASE_URL / TEST_DATABASE_URL.
- **Rate limiter + monitoring (Loop 7, both env-gated, no-op by default):**
  `server/rateLimit.ts` puts the fixed-window counter behind a `RateLimitStore`
  interface — `MemoryStore` (default) or `RedisStore` (Upstash REST via `fetch`,
  opt-in via `RATE_LIMIT_REDIS_URL`+`RATE_LIMIT_REDIS_TOKEN`). `rateLimit()` is
  **async** (call sites `await`) and **fails open** if the backend errors.
  `server/monitoring.ts` (`captureException`/`captureMessage`) no-ops unless
  `MONITORING_DSN` is set; wired fire-and-forget into `server/http.ts`'s 500 path
  (response never changes). `GET /api/health` reports `limiter`/`monitoring` status.
- **wins backfill (Loop 7):** `scripts/backfill-wins.ts` (idempotent; `--dry-run`
  default, `--apply`) recomputes `profile.wins` + active-season
  `LeaderboardEntry.wins` from settled `FastBetEntry`/`Prediction`/`MemeBattleEntry`
  records — the forward-only Loop-5 first-win fix is not retroactive, so this
  reconciles pre-fix under-counts. No schema change.
- **Fast-bet settlement value path (`server/fastbetSettlement.ts`):** first win
  grants the Level-3 milestone AND counts the win (Loop 5 fix — `completeLevelServer`
  takes `win?:boolean`); `awardXp` sets season `LeaderboardEntry.wins` to the
  authoritative `profile.wins`, so wins + leaderboard stay reconciled from one
  write. Settle price/method are first-class `FastBet.settlePrice`/`settleMethod`
  columns, derived from the settlement `context` (null on the admin path).
