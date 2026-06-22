# Quantum Wager

> Predict the future. Battle the crowd. Climb the chain.

A gamified Solana prediction **arena** — markets, meme battles, fast bets, token
launches and a leaderboard, wrapped in a level/XP/quest progression loop.

This repository is the **frontend** (Next.js 14). It talks to a live REST
backend and a deployed Solana **devnet** Anchor program. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full topology and
[`docs/GAME_LOOP.md`](docs/GAME_LOOP.md) for the product mechanics.

> ⚠️ **Devnet only.** No mainnet claims. A real launch requires a smart-contract
> audit, economic review and legal review — see
> [`docs/SECURITY_NOTES.md`](docs/SECURITY_NOTES.md).

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind v4 + shadcn/ui ·
Zustand · framer-motion · `@solana/wallet-adapter-*` · `@coral-xyz/anchor`.

## Honesty model

- `DEMO_MODE` is on unless `NEXT_PUBLIC_APP_MODE=production`.
- Demo/seed data is shown **only** as a fallback when the live source returns
  nothing, and **always** carries a `DEMO` badge.
- The XP/quest/streak progression is **local** (per device) and labelled as
  such. It is not on-chain value. No mock data is merged silently into live data.

---

## Run End-to-End Locally

Prerequisites: Node 20+, npm.

```bash
# 1. Install (the dependency tree needs legacy peer resolution)
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
#   edit .env.local — set NEXT_PUBLIC_API_URL and Solana RPC if needed

# 3. Run the dev server
npm run dev          # http://localhost:3000

# 4. Production build / serve
npm run build
npm run start
```

With `NEXT_PUBLIC_APP_MODE=development` (default) the app runs fully even if the
backend is unreachable — it falls back to badged demo data so you can explore
the whole journey offline.

To run against a local backend, set `NEXT_PUBLIC_API_URL=http://localhost:8000`.

## Deploy Frontend

The app is a standard Next.js project and deploys to Vercel (or any Node host):

```bash
# Vercel
vercel            # preview
vercel --prod     # production
```

Set these in the host's environment (see `.env.example` for the full list):

- `NEXT_PUBLIC_API_URL` — live backend URL
- `NEXT_PUBLIC_APP_MODE=production` — disables demo fallbacks
- `NEXT_PUBLIC_SOLANA_NETWORK=devnet`
- `NEXT_PUBLIC_SOLANA_RPC_URL` — a reliable devnet RPC

## Deploy Backend

The backend is a **separate service** (hosted at `quantum-wager.onrender.com`)
and is not part of this repo. The frontend only needs `NEXT_PUBLIC_API_URL`
pointed at it. The endpoints this app consumes:

```
POST /api/auth/nonce        GET  /api/markets
POST /api/auth/verify       GET  /api/markets/:id
GET  /api/auth/profile      GET  /api/positions
                            POST /api/positions
```

When standing up your own backend, keep these paths (or update `lib/api.ts`).

## Deploy Contracts to Devnet

The Anchor program is already deployed to devnet
(`C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`); its IDL lives in
[`idl/`](idl/). To deploy your own build, see
[`docs/DEVNET_DEPLOYMENT.md`](docs/DEVNET_DEPLOYMENT.md).

## Documentation

| Doc | Contents |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)       | System topology, stack, data flow |
| [GAME_LOOP.md](docs/GAME_LOOP.md)             | Levels, XP, ranks, quests, core loop |
| [SECURITY_NOTES.md](docs/SECURITY_NOTES.md)   | Trust boundaries, prod/mainnet checklist |
| [DEVNET_DEPLOYMENT.md](docs/DEVNET_DEPLOYMENT.md) | Anchor devnet deployment |
