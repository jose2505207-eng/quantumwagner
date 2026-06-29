# Agent Team

The specialized subagent roster for QuantumWagner. Each agent's purpose is
grounded in a real domain of THIS repo. Full operational specs live in
`.agent-system/agents/<name>.md`.

| Agent | Primary domain (this repo) |
| --- | --- |
| `repo-cartographer` | Maps the tree, keeps `repo-map.md` / wiki 02 current |
| `documentation-agent` | Owns `docs/**`, runs `scripts/update-wiki.mjs` |
| `architect-agent` | Layering + the honesty boundary; cross-cutting design |
| `frontend-agent` | `app/*/page.tsx`, `components/*`, `lib/game/*`, stores |
| `backend-agent` | `app/api/**/route.ts` + `server/*.ts` |
| `database-agent` | `prisma/schema.prisma` + `prisma/migrations` |
| `testing-agent` | Vitest authority-layer specs + `anchor test` |
| `security-agent` | Honesty boundary, auth, secrets, value-granting paths |
| `devops-agent` | Build/run, env, lockfiles, DB migrate, deploy, CI |
| `code-reviewer-agent` | Diff review against invariants before merge |
| `skill-librarian-agent` | Curates `.agent-system/skills/*` |

## Purposes

- **repo-cartographer** — Builds and refreshes the structural map of the repo
  (the `app`/`components`/`server`/`lib`/`store`/`prisma`/`idl`/`contracts`
  split). Produces the "where does X live" answers; keeps `repo-map.md` and wiki
  page 02 in sync with the real tree after files move.

- **documentation-agent** — Owns everything under `docs/` (the narrative wiki and
  this agent-system KB). Runs `node scripts/update-wiki.mjs` after code changes to
  detect impacted wiki pages and updates only those, in the source-cited style.
  Must never edit code.

- **architect-agent** — Guards the system's shape: the three layers (UI/game →
  in-repo API → Prisma) and the **honesty boundary** (`lib/game/config.ts`,
  `server/xp.ts`, `server/oracle.ts`). Decides where new responsibilities belong
  and flags designs that would let mock data render as live or grant value
  client-side.

- **frontend-agent** — Owns the React surfaces: `app/<feature>/page.tsx`,
  `components/*` (incl. the `components/game/*` HUD layer), `lib/game/*`, and the
  Zustand stores. Integrates against a stable backend contract; must keep demo
  data badged and progression labelled local.

- **backend-agent** — Owns the in-repo API: thin `app/api/**/route.ts` handlers
  delegating to `server/*.ts`. Adds endpoints by mirroring
  `app/api/markets/route.ts` (handler-wrapped, Zod-validated, `ok`/`fail`
  envelope). Never writes XP/wins except through `awardXp`.

- **database-agent** — Owns `prisma/schema.prisma` and `prisma/migrations`.
  Reviews and evolves the 21-model SQLite schema, generates migrations via
  `pnpm db:migrate` (never hand-edits migration SQL), and protects the append-only
  ledgers (`XPEvent`, `AuditLog`).

- **testing-agent** — Writes Vitest specs for the server authority layer
  (`applyResolution` payout math, `awardXp` side-effects, `validators`, `auth`)
  under the single-fork SQLite config, and maintains `anchor test` for the
  reference contract. Drives the in-progress CI gate.

- **security-agent** — Guards the **honesty boundary** and all value/trust paths:
  `lib/game/config.ts` (demo/local flags), `server/xp.ts` + `server/oracle.ts`
  (server-only value), `server/auth.ts` (nonce/ed25519/JWT), `server/env.ts` (prod
  boot guard, secrets). Reviews any change touching those.

- **devops-agent** — Owns the run/build/deploy story: `package.json` scripts,
  `.env.example`, the **two-lockfile** situation, Prisma migrate/seed, the
  separate Anchor workspace, and the (in-progress) CI. Coordinates with
  database-agent on `db:migrate:deploy`.

- **code-reviewer-agent** — Reviews diffs before merge against the architectural
  invariants in `docs/wiki/10-agent-guide.md` (server-is-authority, honesty
  boundary, append-only ledgers, devnet-only) and the conventions (thin handlers,
  Zod everywhere, `{success,data}` envelope).

- **skill-librarian-agent** — Curates `.agent-system/skills/*`: keeps the skill
  registry accurate, ensures skills cite real commands (`pnpm` scripts,
  `node scripts/update-wiki.mjs`) and real files, retires stale skills.

## Thin / overlapping domains (flagged honestly)

- **architect-agent** overlaps heavily with security-agent on the honesty
  boundary; in practice security-agent enforces it and architect-agent designs
  with it. Keep them distinct only for larger changes.
- **repo-cartographer** is thin on a repo this size — its job is mostly a
  refresh pass after files move; it can be folded into documentation-agent for
  small changes.
- **devops-agent** is currently thin because CI does not yet exist on this branch;
  its near-term work is concentrated on the lockfile decision and bootstrapping CI.
