# Test Generation (server authority layer)

## Purpose
Add Vitest specs for the value-granting server code so regressions in payout/XP
math are caught.

## When To Use
- New/changed logic in `server/oracle.ts`, `server/xp.ts`, `server/validators.ts`,
  `server/auth.ts`.
- Backfilling coverage for the authority layer.

## Required Inputs
- The behaviour under test and concrete input/output expectations.

## Steps
1. Read `vitest.config.ts`: node env, `globals: true`,
   `setupFiles: ["./test/setup.ts"]`, **single fork** (Prisma + one SQLite file),
   `@` alias → repo root.
2. If `test/setup.ts` is missing, create the setup (DB reset/seed for the test
   SQLite file) — coordinate with testing-agent/devops-agent.
3. Write specs for:
   - `applyResolution`: pari-mutuel `payout = stake/winnersStake * totalPool`,
     losers get 0, re-resolving a RESOLVED market throws, `OracleResolution` +
     audit rows written.
   - `awardXp`: `XPEvent` appended, `PlayerProfile` xp/rank (`getRank`)/win-loss
     recomputed, active-season `LeaderboardEntry` upserted.
   - `validators`: accept valid bodies, reject invalid (e.g.
     `placePredictionSchema` amount bounds and `side` enum).
   - `auth`: nonce single-use + expiry, ed25519 verify, JWT round-trip.
4. Run `pnpm test`.

## Commands To Run
```bash
pnpm test            # vitest run (single fork)
pnpm test:watch      # iterate
# contract:
cd contracts/quantum_wager && anchor test
```

## Files To Inspect
`vitest.config.ts`, `test/**`, `server/{oracle,xp,validators,auth,db}.ts`,
`prisma/schema.prisma`, `prisma/seed.ts`.

## Expected Output
New specs under `test/**`, `pnpm test` green, a coverage note.

## Failure Signals
- Flaky failures from parallel SQLite access (keep `singleFork: true`).
- Asserting on local-store XP instead of server `PlayerProfile`/`LeaderboardEntry`.
- Tests editing prod code or a shared DB.

## Definition Of Done
- `pnpm test` passes; new behaviour guarded; single-fork respected; testing-strategy
  doc updated if scope changed.
