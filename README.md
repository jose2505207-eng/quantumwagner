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
cp .env.example .env
#   defaults work out of the box for local dev (SQLite + same-origin API)

# 3. Set up the database (Prisma + SQLite)
npm run db:migrate       # create the SQLite db + apply migrations
npm run db:seed          # load clearly-marked DEMO data (isDemo=true)

# 4. Run the app (frontend + in-repo API together, one process)
npm run dev              # http://localhost:3000

# 5. Production build / serve
npm run build
npm run start            # requires a strong JWT_SECRET in the environment
```

The **backend lives in this repo** as Next.js Route Handlers under `app/api/*`
(see [`docs/API.md`](docs/API.md)), backed by Prisma + SQLite — so `npm run dev`
runs the whole stack on one port. `NEXT_PUBLIC_API_URL` defaults to same-origin;
set it to point at an external backend instead.

Verify the API quickly:

```bash
curl localhost:3000/api/health          # { success, data: { status: "healthy" } }
curl localhost:3000/api/leaderboard     # seeded season standings
```

With `NEXT_PUBLIC_APP_MODE=development` (default) the UI also falls back to
badged demo data when an endpoint is empty/unreachable, so the whole journey is
explorable offline.

### Database commands

```bash
npm run db:migrate        # dev migration (prisma migrate dev)
npm run db:migrate:deploy # apply migrations in CI/prod (prisma migrate deploy)
npm run db:seed           # seed DEMO data
npm run db:reset          # drop + recreate + reseed (destructive)
npm run db:studio         # browse data in Prisma Studio
```

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

The backend ships **inside this app** (Next.js Route Handlers), so deploying the
frontend deploys the backend. For a Node host:

```bash
npm run build
npm run db:migrate:deploy   # apply migrations to the production database
npm run db:seed             # optional: demo data
npm run start
```

Required server env (see `.env.example`): `DATABASE_URL` (use Postgres in prod —
change the Prisma datasource `provider` to `postgresql`), a strong `JWT_SECRET`,
`WALLET_AUTH_MESSAGE`, `ADMIN_RESOLUTION_KEY`, `ORACLE_MODE`. Full endpoint list:
[`docs/API.md`](docs/API.md).

> On serverless hosts (e.g. Vercel) SQLite's local file is not durable — point
> `DATABASE_URL` at a managed Postgres and switch the Prisma provider.

An external backend can still be used instead by setting `NEXT_PUBLIC_API_URL`.

## Deploy Contracts to Devnet

A full Anchor program is already deployed to devnet
(`C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`); its IDL lives in [`idl/`](idl/).
A clean, minimal, auditable reference program (escrow + resolution + tests) is
scaffolded in [`contracts/quantum_wager/`](contracts/quantum_wager/README.md).

```bash
cd contracts/quantum_wager
anchor build && anchor keys sync
anchor test
anchor deploy --provider.cluster devnet
```

See [`docs/DEVNET_DEPLOYMENT.md`](docs/DEVNET_DEPLOYMENT.md) and the workspace
README. **Devnet only — mainnet requires an audit, economic, and legal review.**

## Documentation

| Doc | Contents |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)       | System topology, stack, data flow |
| [API.md](docs/API.md)                         | Full REST endpoint reference |
| [GAME_LOOP.md](docs/GAME_LOOP.md)             | Levels, XP, ranks, quests, core loop |
| [SECURITY_NOTES.md](docs/SECURITY_NOTES.md)   | Trust boundaries, prod/mainnet checklist |
| [DEVNET_DEPLOYMENT.md](docs/DEVNET_DEPLOYMENT.md) | Anchor devnet deployment |
| [BUILD_PROGRESS.md](docs/BUILD_PROGRESS.md)   | Build log (loop-by-loop) |
