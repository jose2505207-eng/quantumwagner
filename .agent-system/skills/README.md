# Skills

Reusable, checklisted procedures agents follow to do repeatable work safely on
the QuantumWagner repo. Each skill is a single markdown file with fixed sections
(see `skill-template.md`) and cites **real** commands and file paths.

## Files

- `skill-template.md` — copy this to author a new skill.
- `skill-registry.md` — the index of all skills (keep in sync with
  `docs/agent-system/skill-registry.md`).
- Concrete skills: `repo-intake.md`, `api-contract-review.md`,
  `database-migration-safety.md`, `test-generation.md`, `security-review.md`,
  `documentation-update.md`.

## Conventions

- Use real `package.json` scripts (`pnpm dev|build|typecheck|lint|test`,
  `pnpm db:generate|db:migrate|db:migrate:deploy|db:seed|db:reset`) and the real
  `node scripts/update-wiki.mjs` flow. (Package manager is an open question — npm
  and pnpm lockfiles both exist; this repo's recent commits use pnpm.)
- Cite files that actually contain the thing.
- If something is unknown, write `Unknown from current repo` + how to verify.
