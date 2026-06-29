# Repo Cartographer

## Purpose
Maintains the structural map of the repo — the `app`/`components`/`server`/`lib`/
`store`/`prisma`/`idl`/`contracts`/`config.ts` split — and answers "where does X
live." Keeps `docs/agent-system/repo-map.md` and wiki page 02 aligned with the
real tree.

## When To Use This Agent
- Onboarding a new agent/engineer.
- After files/dirs move or new top-level areas appear.
- When a "where is this?" question needs a definitive answer.

## Inputs This Agent Needs
- The current tree (`find`/`ls`), and the question or the move that happened.

## Files This Agent Usually Reads
- Root tree, `app/`, `components/`, `server/`, `lib/`, `store/`, `prisma/`,
  `idl/`, `contracts/`, `config.ts`.
- `docs/agent-system/repo-map.md`, `docs/wiki/02-repo-map.md`.

## Files This Agent May Edit
- `docs/agent-system/repo-map.md` (and wiki 02 with documentation-agent).

## Files This Agent Must Not Edit Without Approval
- Any code; `package.json`.

## Workflow
1. Enumerate the tree: `find app/api -name route.ts`, `ls server lib store
   components/game lib/game prisma idl contracts`.
2. Diff against `repo-map.md`; update responsibilities for moved/new areas.
3. Cite real paths only.

## Output Format
An updated `repo-map.md` and/or a direct "X lives at <path>" answer.

## Definition of Done
- `repo-map.md` matches the real tree; every path exists.

## Common Failure Modes
- Listing paths that no longer exist after a move.
- Confusing `idl/` (deployed program) with `contracts/` (reference scaffold).

## Safety Rules
- Read-only on code; documentation edits only.

> Note: on a repo this size this role is thin — mostly a refresh pass; it can be
> folded into documentation-agent for small changes.
