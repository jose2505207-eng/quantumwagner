# 00 · Overview

## What this is

**Quantum Wager** (the npm package is named `buzz-frontend`) is a gamified
**Solana devnet** prediction *arena*. Players connect a wallet and move through
five game surfaces:

- **Prediction markets** — binary YES/NO bets on questions.
- **Fast bets** — short, timed speed rounds.
- **Meme battles** — back side A vs side B.
- **Token launchpad** — launch SPL tokens with bonding-curve parameters.
- **Leaderboard** — seasonal standings driven by real XP/wins.

All of it sits inside a **level / XP / quest / streak progression loop** so every
screen answers: *What can I do? What can I win? What level am I? What's next?*

`Source: README.md`, `Source: docs/GAME_LOOP.md`

## Who it's for

Two audiences:

1. **Players** — devnet users exploring a gamified prediction product.
2. **Engineers / agents** — this repo is the whole runnable stack (frontend +
   API + DB), plus an auditable reference smart contract. It is explicitly a
   **devnet teaching/demo build**, not a production financial product.

> ⚠️ **Devnet only. No mainnet claims.** A real launch requires a smart-contract
> audit, an economic review, and a legal review.
> `Source: README.md`, `Source: docs/SECURITY_NOTES.md`,
> `Source: contracts/quantum_wager/programs/quantum_wager/src/lib.rs` (header)

## The shortest true mental model

Despite the README/ARCHITECTURE wording about a "frontend" talking to external
services, the code in this repo is actually a **single full-stack Next.js app
with a thin on-chain extension**. Three layers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UI (React Server/Client Components)                       │
│    app/<feature>/page.tsx + components/*  + Zustand stores    │
└───────────────┬─────────────────────────┬───────────────────┘
                │ same-origin REST          │ @coral-xyz/anchor
                ▼                           ▼
┌───────────────────────────────┐  ┌───────────────────────────┐
│ 2. In-repo API (Route Handlers)│  │ 3. Solana devnet program  │
│    app/api/* → server/*.ts     │  │    idl/prediction_market   │
│    Prisma + SQLite (dev)       │  │    C8SAQXW3…toSc           │
│  SOURCE OF TRUTH for XP/wins/   │  │  escrow + resolution      │
│  resolution                    │  │                           │
└───────────────────────────────┘  └───────────────────────────┘
```

`Relevant files: app/layout.tsx, app/api/markets/route.ts, server/oracle.ts,
app/utils/useProgram.ts, idl/prediction_market.json, prisma/schema.prisma`

### Three ideas that explain almost everything

1. **The server is the authority.** XP, wins, and outcome resolution are
   computed server-side only — the browser can never set them.
   `Source: server/xp.ts` (`awardXp` is "the ONLY way XP is granted"),
   `Source: server/oracle.ts` (`applyResolution`).

2. **The "game" is honest about being local.** The XP/level/quest/streak loop
   shown in the HUD is a *client-side* progression layer persisted in
   `localStorage`. It is seeded from real signals (wallet connected, backend
   prediction count) but the points themselves are local and always labelled.
   `Source: lib/game/config.ts` (`PROGRESSION_IS_LOCAL`),
   `Source: store/useGameStore.ts`.

3. **Demo data never lies.** `DEMO_MODE` is on unless
   `NEXT_PUBLIC_APP_MODE=production`. Seed/demo data appears *only* as a fallback
   when a live source returns nothing, and *always* wears a `<DemoBadge/>`.
   `Source: lib/game/config.ts`, `Source: docs/SECURITY_NOTES.md`.

## Why it exists this way

The product goal is a *gamified* prediction experience that could ship and feel
complete against an existing backend, **without inventing fake on-chain value**.
So the team drew a hard "honesty boundary": anything not backed by a real service
is gated behind `DEMO_MODE` and badged, and anything of value (XP, wins,
resolution) is forced server-side. That single design rule is the reason for the
split between `lib/game/*` (local), `server/*` (authoritative), and the on-chain
program (real escrow). `Source: lib/game/config.ts` (module header comment).

## Where to go next

- The full topology and diagrams: **[01-architecture](./01-architecture.md)**.
- A directory-by-directory tour: **[02-repo-map](./02-repo-map.md)**.
- Run it locally: **[04-local-development](./04-local-development.md)**.
