# 08 · Testing & Quality

An honest picture: this repo leans on **type-checking, linting, and a single
on-chain test suite** rather than an application test pyramid.

## What exists

### Static quality gates
- **TypeScript** — `pnpm typecheck` (`tsc --noEmit`). The build log notes the
  app reached "0 tsc errors" with `ignoreBuildErrors` removed.
  `Source: package.json`, `Source: docs/BUILD_PROGRESS.md`.
- **ESLint** — `pnpm lint` (`eslint`), extending `next/core-web-vitals` and
  `next/typescript`. Ignores `node_modules`, `.next`, `out`, `build`,
  `next-env.d.ts`. `Source: package.json`, `Source: eslint.config.mjs`.
- **Zod runtime validation** — every API request body is validated server-side;
  invalid input returns `422`. This is the de-facto contract test for the API
  boundary. `Source: server/validators.ts`, `Source: server/http.ts`.
- **Env validation** — `server/env.ts` fails fast on bad prod config.

### Contract tests (the only executable test suite)
`contracts/quantum_wager/tests/quantum_wager.ts` (~68 lines) runs via
`anchor test` (ts-mocha). `Source: contracts/quantum_wager/Anchor.toml`,
`Source: contracts/quantum_wager/package.json`,
`Source: contracts/quantum_wager/tests/quantum_wager.ts`.

```bash
cd contracts/quantum_wager
anchor test
```

It exercises the reference escrow program's instruction flow
(initialize → bet → resolve → claim). Requires the Anchor/Solana toolchain.

## What's missing (confirmed gaps)

- **No JavaScript/TypeScript unit or integration tests** in the app. A search for
  `*.test.ts(x)` / `*.spec.ts` returns nothing outside `node_modules`.
  `Source: find . -name '*.test.*'` (empty).
- **No CI workflow** — there is no `.github/workflows` directory in the repo.
  `Source: repository root listing` (no `.github`).
- **No tests for the authority layer** (`server/oracle.ts` pari-mutuel math,
  `server/xp.ts` rank transitions, `server/auth.ts` nonce/replay rules) — the
  highest-value code to cover.

## Where tests would pay off most (priority order)

1. `server/oracle.ts::applyResolution` — pari-mutuel payout math + "already
   resolved" guard. Pure-ish, high value.
2. `server/xp.ts::awardXp` — XP→rank→leaderboard side-effects; ledger append.
3. `server/auth.ts::verifySignedMessage` — nonce single-use/expiry/replay.
4. `lib/game/ranks.ts` / `lib/game/levels.ts` — pure functions, trivial to test
   (`getRank`, `rankProgress`, `getActiveLevel`, `isLevelUnlocked`).
5. `store/useGameStore.ts` — daily rollover, idempotent claims, `hydrateServer`
   "server wins" logic.

## Manual verification you can run today

```bash
pnpm typecheck                          # type safety
pnpm lint                               # lint
pnpm dev                                # then:
curl localhost:3000/api/health          # DB ping
curl localhost:3000/api/leaderboard     # seeded standings
```

`Source: README.md`, `Source: package.json`. See
[04-local-development](./04-local-development.md) for the full loop and
[10-agent-guide](./10-agent-guide.md) for the pre/post-change checklist.
