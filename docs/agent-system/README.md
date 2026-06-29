# Agent System — Knowledge Base

This folder is the **living operating manual for AI agents** working on the
QuantumWagner repo. It is optimized for fast, accurate machine reading: short,
factual, path-cited.

## What lives here

| File | Purpose |
| --- | --- |
| `repo-map.md` | Top-level directory responsibilities, from the real tree. |
| `architecture.md` | The 3 layers + the "honesty boundary". Points to wiki 01. |
| `backend-map.md` | Every `app/api/**/route.ts` → the `server/*.ts` it delegates to. |
| `frontend-map.md` | `app/<feature>/page.tsx`, `components/*`, game layer. |
| `database-map.md` | The Prisma models in `prisma/schema.prisma`. |
| `data-flow.md` | Core flows: auth, predict, resolve/settle, XP, on-chain bet. |
| `api-map.md` | REST routes table + on-chain instruction surface (`idl/`). |
| `testing-strategy.md` | Current test state (vitest authority layer + `anchor test`). |
| `deployment-guide.md` | App build/run, DB migrate, contract workspace. |
| `known-risks.md` | Verified risks and tech debt. |
| `open-questions.md` | Things the team must answer (not guesses). |
| `agent-team.md` | The specialized subagent roster. |
| `skill-registry.md` | Index of skills under `.agent-system/skills/`. |
| `workflow.md` | The PM decomposition / parallel-work loop. |

## Relationship to `docs/wiki/`

`docs/wiki/` is the **source-grounded narrative wiki** ("codebase as a book"):
deep, prose, Mermaid diagrams, restored on this branch from `origin/docs/repo-wiki`.
It is the canonical explanation of *how the system works*.

This folder is the **agent-facing operational index**: terser, action-oriented,
and tied to the executable agent/skill definitions under `.agent-system/`. When
the two disagree, the wiki + the real code win — open an issue and reconcile.

Keep both honest with `node scripts/update-wiki.mjs` after meaningful code
changes (see `docs/wiki/10-agent-guide.md`).
