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
# 1. Install (dependency tree needs legacy peer resolution with npm)
npm install --legacy-peer-deps     # postinstall runs `prisma generate`

# 2. Configure environment
cp .env.example .env               # defaults work for local dev (SQLite + same-origin)

# 3. Set up the database (Prisma + SQLite)
npm run db:migrate                 # prisma migrate dev — creates dev.db + applies migrations
npm run db:seed                    # load clearly-marked DEMO data (isDemo=true)

# 4. Run the whole stack (frontend + in-repo API, one process)
npm run dev                        # http://localhost:3000
```

`Source: README.md`, `Source: package.json` (scripts + `postinstall`),
`Source: prisma/schema.prisma` (SQLite datasource), `Source: prisma/seed.ts`.

Why one process? The API is Next.js Route Handlers under `app/api/*`, so
`next dev` serves UI and API together on port 3000. `Source: README.md`.

## Verify it's alive

```bash
curl localhost:3000/api/health        # { success, data: { status: "healthy" } }
curl localhost:3000/api/leaderboard   # seeded season standings
```

`Source: README.md`, `Source: app/api/health/route.ts`,
`Source: app/api/leaderboard/route.ts`.

## All npm scripts

`Source: package.json`:

| Script | Command | Use |
| --- | --- | --- |
| `npm run dev` | `next dev` | Local dev server |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Serve the build (needs a strong `JWT_SECRET`) |
| `npm run lint` | `eslint` | Lint (config: `eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` | Type-check only |
| `npm run db:generate` | `prisma generate` | Regenerate Prisma client |
| `npm run db:migrate` | `prisma migrate dev` | Create/apply a dev migration |
| `npm run db:migrate:deploy` | `prisma migrate deploy` | Apply migrations in CI/prod |
| `npm run db:seed` | `tsx prisma/seed.ts` | Seed DEMO data |
| `npm run db:reset` | `prisma migrate reset --force` | **Destructive** drop+recreate+reseed |
| `npm run db:studio` | `prisma studio` | Browse data in a GUI |

## Production build locally

```bash
npm run build
npm run start          # refuses to boot in prod with the insecure default JWT_SECRET
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
| `prisma` client missing at runtime | client not generated | `npm run db:migrate` or `npm run db:generate` (postinstall normally handles it) |
| `npm run start` throws on boot | prod + insecure `JWT_SECRET` | set a strong `JWT_SECRET` (`Source: server/env.ts`) |
| API 401 on writes | missing/expired JWT | reconnect wallet to re-run sign-in (`Source: app/utils/walletAuth.tsx`) |
| Data is empty but badged "DEMO" | live source empty + `DEMO_MODE` on | expected; seed data or point at a live backend (`Source: lib/useMarkets.ts`) |
| SQLite data lost on serverless | local file not durable | use Postgres in prod (`Source: README.md`) |

More in [11-troubleshooting](./11-troubleshooting.md).
