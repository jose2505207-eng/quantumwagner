# Testing Strategy

## Current state (transitional — tests are being added now)

App-level automated tests are **being introduced** with Vitest, targeting the
**server authority layer** first (the highest-value, value-granting code). The
tooling is in place:

- `vitest` + `@vitest` in `devDependencies` (`package.json`).
- `vitest.config.ts`: node environment, `globals: true`,
  `setupFiles: ["./test/setup.ts"]`, **single-fork pool** (Prisma + one SQLite
  file must be driven by one process or the file lock flakes), `testTimeout 20000`,
  `@` alias mirroring tsconfig.
- Scripts: `pnpm test` (`vitest run`), `pnpm test:watch` (`vitest`).

> Note: `vitest.config.ts` references `./test/setup.ts`. If `test/` does not yet
> exist, the setup file and the first specs are part of the in-progress test work.
> Verify with `ls test/` and `pnpm test`.

## Priority targets (the authority layer)

1. **`server/oracle.ts` `applyResolution`** — pari-mutuel payout math
   (`payout = stake/winnersStake * totalPool`, losers 0), RESOLVED-market guard,
   `OracleResolution` + audit side-effects.
2. **`server/xp.ts` `awardXp`** — XPEvent append, `PlayerProfile` recompute, rank
   via `getRank`, win/loss counts, active-season `LeaderboardEntry` upsert.
3. **`server/validators.ts`** — Zod schemas accept valid / reject invalid bodies
   (e.g. `placePredictionSchema` amount bounds, `side` enum).
4. **`server/auth.ts`** — `verifySignedMessage` replay/expiry/wrong-wallet
   rejection, nonce single-use, JWT issue/verify round-trip.

## Reference contract

`contracts/quantum_wager/` ships TS tests (`tests/quantum_wager.ts`) runnable
with `anchor test` against the minimal escrow scaffold. This does NOT exercise
the deployed 18-instruction program.

## CI

CI is **being added**. As of this branch there is no `.github/` workflow. The
intended minimal gate (per wiki 12): `pnpm typecheck` + `pnpm lint` + `pnpm test`
+ `anchor test`. Verify with `ls .github/workflows`.

## Quality gates that already exist

- `pnpm typecheck` (`tsc --noEmit`) — and TS errors **fail the build**
  (`next.config.mjs` no longer ignores them).
- `pnpm lint` (`eslint`) — not enforced at build time
  (`next.config.mjs eslint.ignoreDuringBuilds: true`); run separately.

## How agents should test a change

- Server logic: add/extend a Vitest spec next to the authority module; run
  `pnpm test`.
- API/UI smoke: `pnpm dev` then `curl localhost:3000/api/health` and exercise the
  touched flow.
- DB change: `pnpm db:migrate` (creates a committed migration), then re-run tests.
