# Database Migration Safety

## Purpose
Evolve `prisma/schema.prisma` and produce a committed migration without breaking
the authority writes or the append-only ledgers.

## When To Use
- Adding/changing a model, field, relation, or index.
- Any persistence change a backend feature depends on.

## Required Inputs
- The exact data requirement and the feature/endpoint needing it.
- Whether the field is authority-written (XP/wins/settlement) or user data.

## Steps
1. Read `prisma/schema.prisma` and `docs/agent-system/database-map.md`.
2. Edit the schema. DB is **PostgreSQL on Supabase** (not SQLite): statuses are
   plain strings (no native enums), and `PlayerProfile.completedLevels` is a JSON
   **string**.
3. Generate + apply the migration. **`pnpm db:migrate` (migrate dev) FAILS on
   Supabase** — the `app_user` role can't create the shadow database (`P3014 /
   permission denied to create database`). Use the verified workaround instead
   (see Commands below): `migrate diff` → write `migration.sql` → `db execute`
   (applies to live DB) → `migrate resolve --applied` (records history).
4. Regenerate the client: `pnpm db:generate`.
5. Keep `XPEvent` and `AuditLog` insert-only; keep authority fields written only
   by `awardXp`/`applyResolution`.
6. Update `prisma/seed.ts` if seed data needs the field; update
   `docs/agent-system/database-map.md`.
7. Coordinate timing: this migration must be reviewed BEFORE backend impl depends
   on it (sequential dependency in `pm-workflow.md`).

## Commands To Run
```bash
# Supabase migration workflow (migrate dev fails — no shadow-DB permission):
pnpm prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel  prisma/schema.prisma --script    # -> the DDL
# Save the DDL to prisma/migrations/<UTC YYYYMMDDHHMMSS>_<name>/migration.sql, then:
pnpm prisma db execute --file prisma/migrations/<dir>/migration.sql \
  --schema prisma/schema.prisma                           # applies to LIVE DB
pnpm prisma migrate resolve --applied <migration_name>     # records in _prisma_migrations
pnpm prisma generate                                       # regen client
pnpm prisma migrate status                                 # expect "up to date!"
pnpm db:seed             # if seed changed
# deploy environments / CI (ephemeral Postgres has shadow-DB perms):
pnpm db:migrate:deploy   # replays committed migrations (no new migration)
```

## Files To Inspect
`prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `server/db.ts`,
`server/xp.ts`, `server/oracle.ts`.

## Expected Output
A schema diff + a new committed migration directory, client regenerated, tests
green.

## Failure Signals
- Hand-edited migration SQL or drift between schema and applied migrations.
- A backend change started before the migration was reviewed.
- Destructive change without a backfill plan.

## Definition Of Done
- Migration generated via CLI and committed; `pnpm db:generate` clean; tests
  pass; ledgers still append-only; docs updated.
