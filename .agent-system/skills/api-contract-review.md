# API Contract Review

## Purpose
Add or review a REST endpoint so it matches the repo's thin-handler pattern and
never breaks the authority model.

## When To Use
- Creating/changing any `app/api/**/route.ts`.
- Reviewing a backend diff before merge.

## Required Inputs
- Method, path, auth requirement, request body shape, response shape.
- Which Prisma models / `server/*` helpers are involved.

## Steps
1. Open the canonical example `app/api/markets/route.ts` and mirror its shape.
2. Confirm the handler is `handler()`-wrapped and exports
   `runtime = "nodejs"` + `dynamic = "force-dynamic"`.
3. Confirm every external input is parsed by a Zod schema in
   `server/validators.ts` (add one if missing).
4. Confirm auth: `requireAuth()` for writes; `optionalAuth()` where reads vary.
5. Confirm value paths: XP only via `awardXp` (`server/xp.ts`); settlement only
   via `applyResolution` (`server/oracle.ts`); audit via `server/audit.ts`.
6. Confirm the response uses the `ok(...)`/`fail(...)` envelope.
7. If it's an auth route, keep the legacy aliases (`auth/verify`,
   `auth/profile`) working.
8. Update `docs/agent-system/backend-map.md` + `api-map.md`.

## Commands To Run
```bash
pnpm typecheck
pnpm test
pnpm dev
curl localhost:3000/api/health
# exercise the new endpoint with curl + a Bearer token
```

## Files To Inspect
`app/api/markets/route.ts`, the target `route.ts`, `server/http.ts`,
`server/validators.ts`, `server/auth.ts`, `server/xp.ts`, `server/oracle.ts`,
`server/audit.ts`, `docs/API.md`.

## Expected Output
A handler-thin, Zod-validated endpoint returning `{success,data|message}`, with
docs updated.

## Failure Signals
- Logic living in the route file instead of `server/*`.
- Missing Zod validation, or `runtime`/`dynamic` exports.
- Direct write to `PlayerProfile.xp`/`wins` or `Prediction` settlement fields.

## Definition Of Done
- Pattern matched; `pnpm typecheck` clean; tests green; docs updated; aliases
  intact.
