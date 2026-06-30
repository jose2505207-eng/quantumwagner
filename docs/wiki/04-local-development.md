# 04 · Local Development

Every command here is traced to a real script or file. Don't run a command this
page can't cite.

## Prerequisites

- **Node 20+** (`@types/node` pinned to 20.x; README says Node 20+).
  `Source: README.md`, `Source: package.json`.
- A package manager. The README uses **npm with legacy peers**; the repo also
  ships a `pnpm-lock.yaml`. Pick one and stay consistent.
  `Source: README.md`, `Source: pnpm-lock.yaml`.

## First run (in-repo full stack)

```bash
# 1. Install dependencies
pnpm install                       # postinstall runs `prisma generate`

# 2. Configure environment
cp .env.example .env               # defaults work for local dev (SQLite + same-origin)

# 3. Set up the database (Prisma + SQLite)
pnpm db:migrate                    # prisma migrate dev — creates dev.db + applies migrations
pnpm db:seed                       # load clearly-marked DEMO data (isDemo=true)

# 4. Run the whole stack (frontend + in-repo API, one process)
pnpm dev                           # http://localhost:3000
```

`Source: README.md`, `Source: package.json` (scripts + `postinstall`),
`Source: prisma/schema.prisma` (SQLite datasource), `Source: prisma/seed.ts`.

Why one process? The API is Next.js Route Handlers under `app/api/*`, so
`next dev` serves UI and API together on port 3000. `Source: README.md`.

## Verify it's alive

```bash
curl localhost:3000/api/health        # { status, db, limiter, monitoring, time }
curl localhost:3000/api/leaderboard   # seeded season standings
```

`/api/health` now also reports the rate-limiter backend
(`disabled`/`memory`/`redis`) and whether monitoring is `on`/`off`.
`Source: app/api/health/route.ts`.

`Source: README.md`, `Source: app/api/health/route.ts`,
`Source: app/api/leaderboard/route.ts`.

## All pnpm scripts

`Source: package.json`:

| Script | Command | Use |
| --- | --- | --- |
| `pnpm dev` | `next dev` | Local dev server |
| `pnpm build` | `next build` | Production build |
| `pnpm start` | `next start` | Serve the build (needs a strong `JWT_SECRET`) |
| `pnpm lint` | `eslint` | Lint (config: `eslint.config.mjs`) |
| `pnpm typecheck` | `tsc --noEmit` | Type-check only |
| `pnpm test` | `vitest run` | Both Vitest projects: node authority (real Postgres) + jsdom components |
| `pnpm test:watch` | `vitest` | Watch mode |
| `pnpm e2e` | `tsx test/e2e/devnet-e2e.ts` | Live devnet on-chain harness (needs a funded wallet; not in CI) |
| `pnpm db:generate` | `prisma generate` | Regenerate Prisma client |
| `pnpm db:migrate` | `prisma migrate dev` | Create/apply a dev migration |
| `pnpm db:migrate:deploy` | `prisma migrate deploy` | Apply migrations in CI/prod |
| `pnpm db:seed` | `tsx prisma/seed.ts` | Seed DEMO data |
| `pnpm db:reset` | `prisma migrate reset --force` | **Destructive** drop+recreate+reseed |
| `pnpm db:studio` | `prisma studio` | Browse data in a GUI |

## Production build locally

```bash
pnpm build
pnpm start             # refuses to boot in prod with the insecure default JWT_SECRET
```

`server/env.ts` throws if `NODE_ENV=production` and `JWT_SECRET` is still the dev
default — so set a strong secret first. `Source: server/env.ts`, `Source: README.md`.

## Contracts (optional, separate workspace)

```bash
cd contracts/quantum_wager
anchor build && anchor keys sync
anchor test                                  # ts-mocha against the program
anchor deploy --provider.cluster devnet
```

`Source: README.md`, `Source: contracts/quantum_wager/Anchor.toml` (test script),
`Source: contracts/quantum_wager/package.json`. Toolchain (Rust/Solana CLI/Anchor)
is **not** vendored — install it yourself. See [09-deployment](./09-deployment.md).

## Common failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `npm install` peer-dep errors | Solana/Anchor peer ranges | use `--legacy-peer-deps` (`Source: README.md`) |
| `prisma` client missing at runtime | client not generated | `pnpm db:migrate` or `pnpm db:generate` (postinstall normally handles it) |
| `pnpm start` throws on boot | prod + insecure `JWT_SECRET` | set a strong `JWT_SECRET` (`Source: server/env.ts`) |
| API 401 on writes | missing/expired JWT | reconnect wallet to re-run sign-in (`Source: app/utils/walletAuth.tsx`) |
| Data is empty but badged "DEMO" | live source empty + `DEMO_MODE` on | expected; seed data or point at a live backend (`Source: lib/useMarkets.ts`) |
| SQLite data lost on serverless | local file not durable | use Postgres in prod (`Source: README.md`) |

More in [11-troubleshooting](./11-troubleshooting.md).
