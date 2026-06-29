# Skill Registry (index)

Index of the reusable skills defined under `.agent-system/skills/`. The canonical
machine-readable registry is `.agent-system/skills/skill-registry.md`; this page
is the docs-side mirror. Each skill is a checklisted procedure with real commands
and real file paths.

| Skill | Purpose | Primary agents |
| --- | --- | --- |
| `repo-intake.md` | Cold-start orientation of the repo (tree, layers, honesty boundary, build/test commands). | repo-cartographer, any new agent |
| `api-contract-review.md` | Review/extend a REST endpoint: handler-wrapped, Zod-validated, `{success,data}` envelope, server delegation. | backend-agent, code-reviewer-agent |
| `database-migration-safety.md` | Safely evolve `prisma/schema.prisma` and generate a migration without breaking the authority writes or append-only ledgers. | database-agent, devops-agent |
| `test-generation.md` | Add Vitest specs for the server authority layer under the single-fork SQLite config. | testing-agent |
| `security-review.md` | Honesty-boundary review: demo-only fallback, local-progression labelling, server-only value, never-invented outcomes, auth/secrets. | security-agent, code-reviewer-agent |
| `documentation-update.md` | Update docs/wiki after a code change via `node scripts/update-wiki.mjs` and the manifest. | documentation-agent |

To add a skill: copy `.agent-system/skills/skill-template.md`, fill every
section with repo-specific detail and real commands, then add a row here and in
`.agent-system/skills/skill-registry.md`.
