# Quantum Wager — Architecture

> ⚠️ **PARTLY STALE — READ THIS FIRST.** This document predates the backend
> migration and describes the backend as an **external Render service**. That is
> no longer true: the backend now lives **in-repo** as Next.js Route Handlers
> under `app/api/*` (e.g. `app/api/markets/route.ts`) delegating to `server/*.ts`,
> backed by **Prisma + SQLite** (`prisma/schema.prisma`). The external backend is
> still *optional* (set `NEXT_PUBLIC_API_URL` to override origin), but the default
> is the same-origin in-repo API. The diagram below is kept for history only.
>
> **Current source of truth:** [`docs/wiki/01-architecture.md`](./wiki/01-architecture.md)
> and the root `README.md`. The factual correction below has been applied in
> place; the rest of this file may also drift — prefer the wiki.

## What lives where

Quantum Wager is a **hybrid** system. This repository contains the **frontend
and the in-repo backend** (Next.js Route Handlers under `app/api/*` →
`server/*.ts` → Prisma/SQLite). The smart contract is a separately-deployed
devnet program consumed via the IDL in `idl/`.

```
┌────────────────────────────────────────────────────────────┐
│  buzz-frontend  (THIS REPO — Next.js 14 App Router)         │
│                                                            │
│  app/            routes (markets, fastbet, battlearena,    │
│                  token, leaderboard, portfolio, admin)     │
│  components/game game shell: PlayerHUD, MissionMap,        │
│                  DailyQuests, LiveArenaStats, StatusPill,  │
│                  RankBadge, XPProgress, XPToast, WalletGate│
│  lib/game/       gamification source-of-truth (levels,    │
│                  ranks, quests, xp, config/DEMO_MODE)     │
│  lib/api.ts      typed client → live REST backend         │
│  lib/demo/       clearly-isolated seed data (badged)      │
│  store/          zustand: useGameStore (persisted),       │
│                  userInfo, positions, markets             │
│  idl/            Anchor IDL for the on-chain program      │
└───────────────┬───────────────────────┬────────────────────┘
                │ REST (JWT)             │ web3.js / Anchor
                ▼                        ▼
   ┌──────────────────────┐   ┌──────────────────────────────┐
   │ In-repo API (default)│   │ Solana devnet program        │
   │ app/api/* → server/* │   │ C8SAQXW3...toSc              │
   │ Prisma + SQLite      │   │ markets, battles, tokens,    │
   │ /api/auth /api/markets│   │ bonding curves, reputation   │
   │ (external override via│   │                              │
   │  NEXT_PUBLIC_API_URL) │   │                              │
   └──────────────────────┘   └──────────────────────────────┘
```

## Stack

- **Framework:** Next.js 14.2 (App Router), React 18, TypeScript 5.6
- **Styling:** Tailwind v4 + shadcn/ui; neon design tokens in `app/globals.css`
  (`.qw-*` utilities) and `lib/game` colour constants
- **State:** Zustand (`useGameStore` persisted to localStorage)
- **Wallet:** `@solana/wallet-adapter-*` (devnet), signed-message auth
- **Chain:** `@coral-xyz/anchor` + `@solana/web3.js`, IDL in `idl/`
- **Animation:** framer-motion; toasts via react-hot-toast

## Data flow & honesty boundaries

1. **Auth** — `app/utils/walletAuth.tsx`: nonce → `signMessage` → verify → JWT
   in `localStorage`. `lib/api.ts` injects the JWT on every request.
2. **Markets** — `lib/useMarkets.ts` is the one loader. It returns a `source`
   of `live | demo | empty`. Demo is only used when `DEMO_MODE` is on and the
   backend returned nothing, and is always badged.
3. **Progression** — `GameSync` reconciles real signals (wallet connected,
   backend prediction count) into `useGameStore`. XP is local and labelled.
4. **On-chain actions** — battles/tokens/fast bets go through the Anchor program
   via the hooks in `app/utils/*`.

## Key files

| Concern              | File                                  |
| -------------------- | ------------------------------------- |
| Levels / journey     | `lib/game/levels.ts`                  |
| Ranks (XP ladder)    | `lib/game/ranks.ts`                   |
| Daily quests         | `lib/game/quests.ts`                  |
| Runtime/DEMO config  | `lib/game/config.ts`                  |
| Progression store    | `store/useGameStore.ts`               |
| Real ↔ game bridge   | `components/game/GameSync.tsx`        |
| HTTP client          | `lib/api.ts`                          |
| Demo seed (isolated) | `lib/demo/markets.ts`                 |

See [`GAME_LOOP.md`](./GAME_LOOP.md) for product mechanics and
[`SECURITY_NOTES.md`](./SECURITY_NOTES.md) for trust boundaries.
