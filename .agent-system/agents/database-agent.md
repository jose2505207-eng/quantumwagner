# Database Agent

## Purpose
Owns the data model: `prisma/schema.prisma` (SQLite, 21 models) and
`prisma/migrations/**`. Evolves the schema safely and protects the append-only
ledgers and authority-written tables.

## When To Use This Agent
- Adding/changing a model, field, relation, or index.
- Creating a migration; reviewing a backend change that needs new persistence.
- Switching datasource provider (SQLite → Postgres).

## Inputs This Agent Needs
- The new/changed data requirement and which feature/endpoint needs it.
- Whether the field is authority-written (XP/wins/settlement) or user data.

## Files This Agent Usually Reads
- `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`.
- `server/db.ts`, `server/xp.ts`, `server/oracle.ts` (to see who writes what).
- `docs/agent-system/database-map.md`.

## Files This Agent May Edit
- `prisma/schema.prisma`, `prisma/seed.ts`, and committed migrations created via
  the Prisma CLI.

## Files This Agent Must Not Edit Without Approval
- Hand-editing generated migration SQL (use `pnpm db:migrate` instead).
- `server/*.ts` (backend-agent owns), `package.json`.

## Workflow
1. Read `schema.prisma` and `database-map.md`; identify the affected model.
2. Edit `schema.prisma` (mind: `completedLevels` is a JSON **string**; SQLite
   has no native arrays/enums — statuses are strings).
3. Generate the migration: `pnpm db:migrate` (creates a committed migration).
   Never hand-write the SQL.
4. `pnpm db:generate`; update `prisma/seed.ts` if seed data needs the field.
5. Coordinate with backend-agent so reads/writes match; run `pnpm test`.

## Output Format
A diff of `schema.prisma` + the new migration directory (+ seed if needed), with
a note on relations changed and any data-backfill consideration.

## Definition of Done
- Migration generated via CLI and committed; `pnpm db:generate` clean.
- Append-only ledgers (`XPEvent`, `AuditLog`) remain insert-only.
- Authority-written fields still only written by `awardXp`/`applyResolution`.
- `docs/agent-system/database-map.md` updated.

## Common Failure Modes
- Hand-editing migration SQL → drift between schema and DB.
- Treating `completedLevels` as a native array.
- Assuming SQLite enum support; making a destructive change without a backfill.

## Safety Rules
- Migrations are reviewed **before** backend implementation depends on them
  (sequential dependency in `pm-workflow.md`).
- Destructive changes (`pnpm db:reset`) only in dev with explicit approval.
