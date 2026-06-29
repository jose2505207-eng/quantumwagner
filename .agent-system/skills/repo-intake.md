# Repo Intake

## Purpose
Get a cold-started agent oriented on QuantumWagner fast and accurately, with the
honesty boundary front of mind.

## When To Use
- First task in a session, or onboarding a new agent.
- Before planning any change that spans layers.

## Required Inputs
- Repo at HEAD on the working branch. Nothing else.

## Steps
1. Read the map: `docs/agent-system/repo-map.md`, `architecture.md`, and
   `docs/wiki/01-architecture.md`.
2. Read the invariants: `docs/wiki/10-agent-guide.md` + `docs/SECURITY_NOTES.md`
   (server-is-authority, honesty boundary, append-only ledgers, devnet only).
3. Skim the load-bearing files: `app/layout.tsx`, `lib/game/config.ts`,
   `server/http.ts`, `server/validators.ts`, `server/xp.ts`, `server/oracle.ts`,
   `prisma/schema.prisma`, `store/useGameStore.ts`.
4. Enumerate the API: `find app/api -name route.ts`; cross-check
   `docs/agent-system/backend-map.md`.
5. Note the open risks: `docs/agent-system/known-risks.md` +
   `open-questions.md` (two lockfiles, deployed≠reference program, RPC drift).

## Commands To Run
```bash
git status
find app/api -name route.ts
pnpm typecheck      # baseline must be clean (TS errors fail the build)
pnpm lint           # baseline (NOT build-enforced)
pnpm test           # vitest authority layer (verify it runs)
```

## Files To Inspect
`docs/agent-system/*`, `docs/wiki/01-architecture.md`,
`docs/wiki/10-agent-guide.md`, `app/layout.tsx`, `lib/game/config.ts`,
`server/{http,validators,xp,oracle,auth,env}.ts`, `prisma/schema.prisma`.

## Expected Output
A short situational summary: which layer the task touches, which agents own it,
and which invariants apply.

## Failure Signals
- `pnpm typecheck` is already red on a clean tree (pre-existing build break — see
  `known-risks.md`, methods.tsx).
- `pnpm test` cannot find `test/setup.ts` (tests still being bootstrapped).

## Definition Of Done
- You can state the 3 layers, the honesty boundary, the build/test commands, and
  the top 3 risks without re-reading.
