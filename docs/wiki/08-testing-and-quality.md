# 08 · Testing & Quality

An honest picture: quality rests on **static gates** (TypeScript, lint) plus a
**real Vitest test suite** that runs in CI against a live Postgres, and an
on-chain devnet harness that is run by hand.

## What exists

### Static quality gates
- **TypeScript** — `pnpm typecheck` (`tsc --noEmit`). The build log notes the
  app reached "0 tsc errors" with `ignoreBuildErrors` removed.
  `Source: package.json`, `Source: docs/BUILD_PROGRESS.md`.
- **ESLint** — `pnpm lint` (`eslint`), extending `next/core-web-vitals` and
  `next/typescript`. Lint is currently **non-blocking** in CI: ~143 warnings
  remain as documented tech debt, surfaced but not failing the pipeline.
  `Source: package.json`, `Source: eslint.config.mjs`, `Source: .github/workflows/ci.yml`.
- **Zod runtime validation** — every API request body is validated server-side;
  invalid input returns `422`. This is the de-facto contract test for the API
  boundary. `Source: server/validators.ts`, `Source: server/http.ts`.
- **Env validation** — `server/env.ts` fails fast on bad prod config.

### The Vitest suite — two projects under one `pnpm test`

`pnpm test` (`vitest run`) runs **two Vitest projects** stitched together by
`vitest.workspace.ts` — 106 tests total. `Source: package.json`,
`Source: vitest.workspace.ts`.

| Project | Config | Env | Scope | DB |
| --- | --- | --- | --- | --- |
| Node authority layer | `vitest.config.ts` | `node` | `test/unit/**`, `test/integration/**` | Real Postgres (`quantum_test` schema) |
| Client component layer | `vitest.component.config.ts` | `jsdom` | `test/component/**` | None (DB-free) |

**Node authority layer** — the highest-value tests. They run against a **real
Postgres** (the app's Supabase project), in a dedicated `quantum_test` schema so
they never touch dev/prod rows, single-fork to avoid Prisma lock contention.
Mocking Prisma is deliberately avoided — these tests exist to catch
migration/query/schema-drift bugs. `Source: vitest.config.ts`,
`Source: test/setup.ts`. Coverage includes `test/unit/{auth,http,validators,ranks,pythProvider,rateLimit}.test.ts`
and `test/integration/{oracle,oracle-provider,xp,levels,fastbet*,settle-stats,backfill-wins}.test.ts`.

**Client component layer** (added in Loop 7) — React Testing Library + jsdom,
the project's first component tests. It is a separate project because components
need a jsdom DOM and the React plugin, and it must **not** load `test/setup.ts`
(no Postgres) — component specs are deliberately DB-free, fast, and offline.
First specs: `test/component/battlearena-new.test.tsx`,
`test/component/OracleSettleStats.test.tsx`, wired via `test/component/setup.ts`
(@testing-library/jest-dom matchers + auto-unmount). `Source: vitest.component.config.ts`,
`Source: test/component/setup.ts`. The node project explicitly excludes
`test/component/**` so the two never cross-collect. `Source: vitest.config.ts`.

```bash
pnpm test          # both projects (node authority + jsdom components)
pnpm test:watch    # watch mode (vitest)
```

### Devnet on-chain E2E harness (`pnpm e2e`, not in CI)
`test/e2e/devnet-e2e.ts` is a **live on-chain** harness: it confirms the deployed
program (`idl/prediction_market.json`, 18 instructions) is reachable on devnet,
performs real read-only account reads (`PlatformConfig` PDA + `getProgramAccounts`
inventory), and proves signing-liveness with a 0-lamport self-transfer that yields
a **real** transaction signature. `Source: test/e2e/devnet-e2e.ts`,
`Source: test/e2e/README.md`.

```bash
pnpm e2e           # tsx test/e2e/devnet-e2e.ts
```

It is **excluded from `pnpm test` and CI** (`test/e2e/**` is in the node config's
`exclude`) because it needs a funded devnet keypair + live RPC. It **fails loud
at 0 SOL** — it never skip-as-passes and never prints a fake signature.
`Source: vitest.config.ts`, `Source: test/e2e/README.md`. See
[09-deployment](./09-deployment.md) and
[12-roadmap](./12-roadmap-and-open-questions.md) (funding still pending).

### Contract tests (reference Anchor program)
`contracts/quantum_wager/tests/quantum_wager.ts` runs via `anchor test`
(ts-mocha) and exercises the reference escrow flow
(initialize → bet → resolve → claim). Requires the Anchor/Solana toolchain.
`Source: contracts/quantum_wager/Anchor.toml`,
`Source: contracts/quantum_wager/tests/quantum_wager.ts`.

```bash
cd contracts/quantum_wager
anchor test
```

### CI pipeline
`.github/workflows/ci.yml` runs on every push/PR. The **blocking** job spins up
an ephemeral Postgres 16 service container, then runs
`prisma generate → migrate deploy → typecheck → build → test`. A separate
**non-blocking** `lint` job surfaces eslint debt without failing the build.
`Source: .github/workflows/ci.yml`. A second workflow,
`.github/workflows/cron-fastbets.yml`, exists for scheduled fast-bet handling.

## Confirmed gaps

- **Component coverage is nascent.** Only two component specs exist
  (`test/component/**`); the bulk of the React UI is still untested.
- **Lint debt.** ~143 warnings remain and lint is non-blocking in CI.
  `Source: .github/workflows/ci.yml`.
- **On-chain E2E is not yet green.** `pnpm e2e` is wired but the devnet wallet
  funding is pending, so the live proof has not run green. `Source: test/e2e/README.md`.

## Where new tests would pay off most (priority order)

1. More `server/oracle.ts` / settlement edge cases (already partially covered).
2. `store/useGameStore.ts` — daily rollover, idempotent claims, `hydrateServer`
   "server wins" logic (component/node-testable).
3. Expanding `test/component/**` to cover the core market/battle screens.

## Manual verification you can run today

```bash
pnpm typecheck                          # type safety
pnpm lint                               # lint (non-blocking debt)
pnpm test                               # both Vitest projects
pnpm dev                                # then:
curl localhost:3000/api/health          # DB + limiter + monitoring status
curl localhost:3000/api/leaderboard     # seeded standings
```

`Source: README.md`, `Source: package.json`. See
[04-local-development](./04-local-development.md) for the full loop and
[10-agent-guide](./10-agent-guide.md) for the pre/post-change checklist.
</content>
</invoke>
