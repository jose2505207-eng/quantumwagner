# Quantum Wager — Build Progress Log

Running log of the autonomous build. Newest entries at the bottom of each loop.

## Loop 0 — Repo Audit (DONE)

**Stack:** Next.js 14.2 App Router · React 18 · TypeScript 5.6 (strict, `noImplicitAny:false`) · Tailwind v4 + shadcn/ui · Zustand · framer-motion · react-hot-toast · `@solana/wallet-adapter-*` (devnet) · `@coral-xyz/anchor`.

**Package manager:** npm (both `package-lock.json` and `pnpm-lock.yaml` exist, but `pnpm` is not installed). Install requires `--legacy-peer-deps` (react-native peer pulls react 19; project is react 18).

**Routes (all preserved):** `/`, `markets`, `markets/[id]`, `markets/category/[category]`, `fastbet`, `fastbet/[id]`, `battlearena`, `battlearena/[pda]`, `battlearena/new`, `token`, `token/[id]`, `buytoken`, `leaderboard`, `portfolio` (+battle/token), `admin`, `how-it-works`, `info/*`.

**Pre-existing integrations:**
- External REST backend on Render (`config.ts` → `https://quantum-wager.onrender.com`): `auth/{nonce,verify,profile}`, `markets`, `markets/:id`, `positions`, `admin/*`.
- Deployed Anchor program on devnet (`C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`), full IDL in `idl/`.

**Already built (prior sessions):**
- `lib/game/*` gamification source of truth (levels, ranks, quests, xp, config/DEMO_MODE).
- `store/useGameStore.ts` persisted progression + `GameSync` bridge.
- `components/game/*` arena UI (PlayerHUD, NavbarHUD, MissionMap, DailyQuests, LiveArenaStats, XP/Rank/Status primitives, XPToast, WalletGate, EmptyState/ErrorState/LoadingSkeleton, DemoBadge).
- Neon design system in `app/globals.css` (`.qw-*`).
- Honest data layer: `lib/api.ts`, `lib/useMarkets.ts` (`source: live|demo|empty`), `lib/demo/markets.ts`; de-mocked home/markets/portfolio/fastbet.
- Milestone completion from real on-chain actions (placeBet/createTokenLaunch/enterBattle) + leaderboard visit.
- Type-clean (0 tsc errors); `ignoreBuildErrors` removed.
- Docs: README, ARCHITECTURE, GAME_LOOP, SECURITY_NOTES, DEVNET_DEPLOYMENT, `.env.example`.

**Decision for this build (adapt to repo, non-destructive):**
- Backend = **Next.js Route Handlers under `app/api/*` + Prisma + SQLite**. Rationale: the repo is a Next app; this runs with the same `npm` commands, needs no second server/port, no secrets, and migrations + seed work fully offline. The external Render API remains usable for legacy markets via `API_URL`; the new in-repo backend owns auth/player/XP/quests/leaderboard/oracle persistence.
- DB = SQLite via Prisma (zero external services). Swappable to Postgres by changing the datasource URL.
- Wallet auth = nonce + ed25519 signed-message verify (tweetnacl) → JWT.
- Server is authoritative for XP / wins / resolution. Frontend never grants XP server-side.

**Gaps to close (this run):** in-repo backend + DB + migrations + seed (Loops 4/5/6), oracle resolver (13), frontend→backend wiring (7-11), contracts workspace scaffold (12), verification + docs (17-20).
