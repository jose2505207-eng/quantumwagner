# Lessons Learned

Durable lessons for agents working on QuantumWagner. Append as new ones emerge.

## Trust the README + wiki over `docs/ARCHITECTURE.md`
`docs/ARCHITECTURE.md` predates the backend migration and described an external
Render backend. The backend is in-repo (`app/api/*` → `server/*` → Prisma). When
docs disagree, the real code + `docs/wiki/01-architecture.md` + README win. A
banner + minimal correction were added to that file; the rest may still drift.

## The honesty boundary is the product's spine
Most "bugs" that matter here are boundary violations: demo data leaking into live,
or XP/wins set client-side. Always route demo through the badged fallback
(`lib/useMarkets.ts`) and grant value only via `awardXp`/`applyResolution`. Run
the `security-review.md` skill before merging anything in that zone.

## Build vs lint gates are asymmetric
`pnpm build` fails on TS errors but ignores ESLint (`next.config.mjs`). Don't
assume a green build means clean lint — the repo carries pre-existing lint debt
(verify count with `pnpm lint`). Conversely, a stray `any`/type error WILL block
the build (this is the live `methods.tsx` risk).

## SQLite + Prisma want one process
Tests must use the single-fork Vitest config — parallel forks contend on the
SQLite file and flake. Same idea applies to local migrate/seed: one driver.

## Two lockfiles cause silent drift
`package-lock.json` and `pnpm-lock.yaml` both exist. Pick the one CI installs
from and delete the other; until then, prefer pnpm (recent commits use it) and
don't regenerate the npm lockfile by accident.

## Deployed program ≠ reference contract
The deployed devnet program (18 instructions) is consumed via the IDL only; the
Rust in `contracts/quantum_wager/` is a minimal escrow scaffold with a
placeholder id. Never reason about deployed behaviour from the reference Rust —
read `idl/prediction_market.json`.

## Two RPC sources can drift
`app/utils/useProgram.ts` and `app/utils/SolanaProvider.tsx` derive the RPC
independently. If you change RPC/network, change both (or centralise on the
env-driven value).

## Keep the auth aliases alive
`app/api/auth/verify` and `app/api/auth/profile` are legacy aliases re-exporting
the canonical `verify-wallet`/`me` handlers — the existing frontend calls the
aliases. Don't remove them when refactoring auth.

## Update the wiki where it lives
The wiki is on `origin/docs/repo-wiki`, restored onto this branch — not on
`main`. After code changes, run `node scripts/update-wiki.mjs` and edit only the
impacted pages; re-cite real files.
