# Repo Map

Top-level directories and their responsibilities, derived from the real tree
(`ls` of repo root). Paths are relative to repo root.

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js 14 App Router. Two halves: **UI surfaces** (`app/<feature>/page.tsx` — markets, fastbet, battlearena, token, buytoken, leaderboard, portfolio, admin, how-it-works, info), and the **in-repo backend** under `app/api/**/route.ts` (thin Route Handlers). Also `app/layout.tsx` (root wiring), `app/utils/*` (Solana provider, wallet auth, Anchor hooks, `methods.tsx`), `app/types.ts`, `app/globals.css`. |
| `components/` | React components. Marketing/landing, feature components (`market/`, `battlearena/`, `fastbet/`, `buytoken/`, `portfolio/`, `leaderboard/`, `admin/`, `token-details/`), the cross-cutting **game layer** `components/game/*` (HUD, MissionMap, GameSync, XPToast, DemoBadge…), and `components/ui/*` (shadcn primitives). |
| `server/` | The API authority layer. `http.ts` (envelope + `handler()`), `auth.ts` (nonce/ed25519/JWT), `oracle.ts` (resolver adapters + `applyResolution`), `xp.ts` (`awardXp`), `validators.ts` (Zod), `db.ts` (Prisma client), `env.ts` (env + prod boot guard), `users.ts`, `quests.ts`, `markets.ts`, `audit.ts`. |
| `lib/` | Shared client logic. `api.ts` (axios + JWT interceptor), `useMarkets.ts` / `useLeaderboard.ts` (loaders with live/demo/empty source), `format.ts`, `utils.ts`, `useHydrated.ts`, `demo/markets.ts` (badged seed data), and **`lib/game/*`** — the gamification source-of-truth (`config.ts` honesty flags, `levels.ts`, `ranks.ts`, `quests.ts`, `xp.ts`, `types.ts`). |
| `store/` | Zustand stores: `useGameStore.ts` (persisted local progression, key `qw-progress-v1`), `userInfo.ts` (auth user), `usePositionStore.ts`, `adminMarketStore.ts`, plus `store/types/*`. |
| `prisma/` | `schema.prisma` (SQLite datasource, 21 models), `migrations/`, `seed.ts` (`tsx`-run seeder). |
| `idl/` | `prediction_market.json` (Anchor IDL of the **deployed** devnet program `C8SAQXW3…toSc`) + `types.ts` (generated TS types). This is how the browser talks to the chain. |
| `contracts/` | `contracts/quantum_wager/` — a **reference Anchor workspace** (minimal escrow scaffold with a placeholder program id). NOT the source of the deployed program. Has `Anchor.toml`, `Cargo.toml`, `tests/quantum_wager.ts`. |
| `config.ts` | Client-side on-chain constants: `PROGRAM_ID`, `treasury`/vault pubkeys, fees (`PLATFORM_FEE_BPS`…), bet/market/battle/token/bonding-curve parameters, reputation thresholds. `BACKEND_URL` defaults to `""` (same-origin). |
| `scripts/` | `update-wiki.mjs` — wiki staleness checker driven by `docs/wiki/wiki-manifest.json`. |
| `docs/` | `wiki/` (canonical narrative), this `agent-system/`, plus `ARCHITECTURE.md` (partly stale), `API.md`, `DEVNET_DEPLOYMENT.md`, `GAME_LOOP.md`, `SECURITY_NOTES.md`, `BUILD_PROGRESS.md`. |

Notable root files: `package.json` (scripts: `dev`/`build`/`lint`/`typecheck`/
`test`/`db:*`), `vitest.config.ts`, `next.config.mjs` (TS errors fail build,
ESLint does not), `.env.example`, two lockfiles (`package-lock.json` +
`pnpm-lock.yaml`).
