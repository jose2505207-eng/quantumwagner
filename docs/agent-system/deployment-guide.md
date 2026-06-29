# Deployment Guide

Sources: `docs/DEVNET_DEPLOYMENT.md`, `README.md`, `.env.example`,
`package.json`. There are **two separately-deployable units**: the Next.js app
(UI + in-repo API + DB) and the Anchor program (separate workspace, already
deployed to devnet).

## 1. The Next.js app (UI + in-repo API)

Environment (copy `.env.example` → `.env` / `.env.local`):
- `NEXT_PUBLIC_API_URL` — leave EMPTY for same-origin in-repo API (recommended).
- `NEXT_PUBLIC_APP_MODE` — `development` | `demo` | `production` (controls demo
  fallbacks).
- `NEXT_PUBLIC_SOLANA_NETWORK=devnet`, `NEXT_PUBLIC_SOLANA_RPC_URL`.
- `DATABASE_URL` — defaults to `file:./dev.db` (SQLite). For Postgres change the
  URL **and** the Prisma datasource provider.
- `JWT_SECRET` — MUST be strong in production; `server/env.ts` refuses to boot in
  prod with the insecure default.
- `WALLET_AUTH_MESSAGE`, `ORACLE_MODE` (dev|admin|provider),
  `ADMIN_RESOLUTION_KEY`, `RATE_LIMIT_ENABLED`.

Database (Prisma + SQLite):
```bash
pnpm db:generate        # prisma generate (also runs on postinstall)
pnpm db:migrate         # prisma migrate dev  (local, creates committed migration)
pnpm db:migrate:deploy  # prisma migrate deploy (CI/prod, applies existing migrations)
pnpm db:seed            # tsx prisma/seed.ts
pnpm db:reset           # prisma migrate reset --force (destructive)
```

Build & run:
```bash
pnpm install            # NOTE: two lockfiles exist — see known-risks.md
pnpm build              # next build (TS errors FAIL; ESLint does not)
pnpm start              # next start (production server)
# dev:
pnpm dev                # next dev
curl localhost:3000/api/health
```

> README historically documents npm with `--legacy-peer-deps`; recent commits use
> pnpm (e.g. "sync pnpm lockfile"). Canonical package manager is an open question
> — see `open-questions.md`.

## 2. The Anchor program (separate workspace)

The deployed devnet program is `C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`;
the app consumes it via `idl/prediction_market.json`. You normally do **not**
redeploy — just point the app at devnet.

`contracts/quantum_wager/` is a **reference scaffold** (not the deployed source).
To build/test it:
```bash
cd contracts/quantum_wager
anchor build
anchor test
```

To deploy your own fork (from `docs/DEVNET_DEPLOYMENT.md`):
```bash
solana config set --url https://api.devnet.solana.com
anchor build && anchor keys sync && anchor deploy --provider.cluster devnet
# then copy target/idl + target/types back into idl/ and update config.ts / NEXT_PUBLIC_PROGRAM_ID
```

## Constraints

- **Devnet only.** No mainnet ids/RPC/economic claims without audit + economic +
  legal review (`docs/SECURITY_NOTES.md`).
- The full deployed program's Rust source is **not in this repo** (only the IDL).
