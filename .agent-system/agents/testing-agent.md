# Testing Agent

## Purpose
Writes and maintains the test suite. Priority is Vitest specs for the **server
authority layer** (where value is granted) and `anchor test` for the reference
contract. Drives the in-progress CI gate.

## When To Use This Agent
- Adding tests for new/changed server logic.
- Backfilling tests for `applyResolution`, `awardXp`, validators, auth.
- Bootstrapping/maintaining `test/setup.ts` and CI.

## Inputs This Agent Needs
- The behaviour under test and its inputs/outputs.
- The single-fork SQLite constraint (see below).

## Files This Agent Usually Reads
- `vitest.config.ts`, `package.json` (scripts), `test/setup.ts` (if present).
- `server/oracle.ts`, `server/xp.ts`, `server/validators.ts`, `server/auth.ts`,
  `server/db.ts`, `prisma/schema.prisma`, `prisma/seed.ts`.
- `contracts/quantum_wager/tests/quantum_wager.ts`.

## Files This Agent May Edit
- `test/**` (specs + setup), `vitest.config.ts` (with devops-agent),
  `contracts/quantum_wager/tests/*`. CI workflow files (with devops-agent).

## Files This Agent Must Not Edit Without Approval
- Production code under `server/*`, `app/*`, `prisma/schema.prisma` (fix the code
  via the owning agent, not the test).

## Workflow
1. Read `vitest.config.ts` — tests run node env, single fork (Prisma + one SQLite
   file), `setupFiles: ["./test/setup.ts"]`.
2. Write a spec next to the authority module behaviour: e.g. `applyResolution`
   pari-mutuel math (`payout = stake/winnersStake * totalPool`, losers 0,
   re-resolve throws); `awardXp` (XPEvent append, rank recompute, leaderboard
   upsert); validator accept/reject; auth nonce single-use + signature verify.
3. Run `pnpm test`. For contract: `cd contracts/quantum_wager && anchor test`.

## Output Format
New/updated specs under `test/**` and a short coverage note (what is now
guarded). PASS output of `pnpm test`.

## Definition of Done
- `pnpm test` passes; new behaviour has a spec.
- Tests use the single-fork config (no cross-process SQLite contention).
- `docs/agent-system/testing-strategy.md` updated if scope changed.

## Common Failure Modes
- Parallel forks contending on the SQLite file (flaky) — keep `singleFork`.
- Asserting on local-store XP instead of server `PlayerProfile`/`LeaderboardEntry`.
- Testing the deployed program via the reference scaffold (different surface).

## Safety Rules
- Never weaken a test to make a broken change pass — fix the code.
- Tests must not write to a shared/prod DB; use the local SQLite test file.
