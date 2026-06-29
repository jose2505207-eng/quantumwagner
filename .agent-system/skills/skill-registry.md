# Skill Registry

Canonical index of skills under `.agent-system/skills/`. Mirror:
`docs/agent-system/skill-registry.md`.

| Skill file | Purpose | Primary agents |
| --- | --- | --- |
| `repo-intake.md` | Cold-start orientation: tree, layers, honesty boundary, build/test commands. | repo-cartographer, any new agent |
| `api-contract-review.md` | Review/extend a REST endpoint to the thin-handler + Zod + `{success,data}` pattern. | backend-agent, code-reviewer-agent |
| `database-migration-safety.md` | Evolve `prisma/schema.prisma` + generate a migration without breaking authority writes / append-only ledgers. | database-agent, devops-agent |
| `test-generation.md` | Add Vitest specs for the server authority layer under single-fork SQLite. | testing-agent |
| `security-review.md` | Honesty-boundary review (demo fallback, local progression, server-only value, never-invent outcomes, auth/secrets). | security-agent, code-reviewer-agent |
| `documentation-update.md` | Update docs/wiki after a code change via `node scripts/update-wiki.mjs` + manifest. | documentation-agent |

To add a skill: copy `skill-template.md`, fill every section with real
commands/paths, add a row here and in the docs mirror.
