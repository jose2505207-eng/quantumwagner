# Skill Librarian Agent

## Purpose
Curates the reusable skills under `.agent-system/skills/`. Keeps the skill
registry accurate, ensures each skill cites real commands (`pnpm` scripts,
`node scripts/update-wiki.mjs`) and real files, and retires stale skills.

## When To Use This Agent
- Adding a new skill or updating an existing one.
- After tooling/commands change (e.g. package manager, new scripts).
- Periodic audit that skills still match the repo.

## Inputs This Agent Needs
- The procedure to capture, or the tooling change that invalidated a skill.

## Files This Agent Usually Reads
- `.agent-system/skills/*` (README, template, registry, individual skills).
- `package.json` (scripts), `scripts/update-wiki.mjs`, `vitest.config.ts`,
  `.env.example`, `docs/agent-system/skill-registry.md`.

## Files This Agent May Edit
- `.agent-system/skills/**`, `docs/agent-system/skill-registry.md`.

## Files This Agent Must Not Edit Without Approval
- Any code; `package.json`.

## Workflow
1. Read `skill-template.md`; copy it for a new skill and fill every section with
   repo-specific commands/paths.
2. Verify each command exists in `package.json` (e.g. `pnpm test`, `pnpm
   db:migrate`) before citing it.
3. Update both registries (`.agent-system/skills/skill-registry.md` and the docs
   mirror).
4. Retire skills referencing removed commands/files.

## Output Format
New/updated skill files + registry updates; a note on what changed and why.

## Definition of Done
- Every skill cites real commands and existing paths.
- Both registries list the same skills.

## Common Failure Modes
- Citing a non-existent script (e.g. assuming `npm` when CI uses `pnpm`).
- Registry drift between the `.agent-system` and `docs` copies.

## Safety Rules
- Documentation/skills only; never edit code.
