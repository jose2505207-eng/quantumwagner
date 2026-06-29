# Memory — Durable Facts

Stable facts about QuantumWagner, verified against the repo. Update only when the
underlying code/config changes.

## Build / run / test

- **Build:** `pnpm build` (`next build`). **TypeScript errors FAIL the build**;
  **ESLint does NOT** block the build (`next.config.mjs`:
  `eslint.ignoreDuringBuilds: true`). Run `pnpm lint` separately.
- **Typecheck:** `pnpm typecheck` (`tsc --noEmit`).
- **Dev:** `pnpm dev`; health probe `curl localhost:3000/api/health`.
- **Test:** `pnpm test` (`vitest run`) — targets the **server authority layer**;
  `vitest.config.ts` forces a **single fork** (one process drives the SQLite file)
  and uses `test/setup.ts`. `pnpm test:watch` to iterate.

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
