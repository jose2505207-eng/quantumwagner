# Backend Map

Every `app/api/**/route.ts` (from `find app/api -name route.ts`) and the
`server/*.ts` modules it imports. Route handlers are thin; logic lives in
`server/*`. All handlers use the `handler()` wrapper from `server/http.ts` and
the `{ success, data | message }` envelope.

| Route file | Delegates to (`@/server/*`) |
| --- | --- |
| `app/api/health/route.ts` | `db`, `http` |
| `app/api/config/public/route.ts` | `env`, `http` |
| `app/api/auth/nonce/route.ts` | `auth`, `http`, `validators` |
| `app/api/auth/verify-wallet/route.ts` | `auth`, `users`, `xp`, `audit`, `http`, `validators` |
| `app/api/auth/verify/route.ts` | **alias** → re-exports `POST` from `verify-wallet/route.ts` |
| `app/api/auth/me/route.ts` | `auth`, `users`, `http` |
| `app/api/auth/profile/route.ts` | **alias** → re-exports `GET` from `me/route.ts` |
| `app/api/player/profile/route.ts` | `auth`, `users`, `http` |
| `app/api/player/progress/route.ts` | `auth`, `db`, `http` |
| `app/api/player/quests/route.ts` | `auth`, `db`, `quests`, `http` |
| `app/api/player/quests/[questId]/claim/route.ts` | `auth`, `db`, `quests`, `xp`, `http` |
| `app/api/markets/route.ts` | `auth`, `db`, `markets`, `validators`, `audit`, `http` |
| `app/api/markets/[id]/route.ts` | `db`, `markets`, `http` |
| `app/api/markets/[id]/predictions/route.ts` | `auth`, `db`, `validators`, `xp`, `audit`, `http` |
| `app/api/markets/[id]/resolve/route.ts` | `auth`, `oracle`, `validators`, `http` |
| `app/api/positions/route.ts` | `auth`, `db`, `http` |
| `app/api/fast-bets/route.ts` | `auth`, `db`, `validators`, `audit`, `http` |
| `app/api/fast-bets/[id]/enter/route.ts` | `auth`, `db`, `validators`, `xp`, `audit`, `http` |
| `app/api/fast-bets/[id]/resolve/route.ts` | `auth`, `db`, `env`, `xp`, `audit`, `http` |
| `app/api/battles/route.ts` | `auth`, `db`, `validators`, `audit`, `http` |
| `app/api/battles/[id]/join/route.ts` | `auth`, `db`, `validators`, `xp`, `audit`, `http` |
| `app/api/battles/[id]/vote/route.ts` | `auth`, `db`, `validators`, `xp`, `http` |
| `app/api/battles/[id]/resolve/route.ts` | `auth`, `db`, `env`, `validators`, `xp`, `audit`, `http` |
| `app/api/launchpad/tokens/route.ts` | `auth`, `db`, `validators`, `xp`, `audit`, `http` |
| `app/api/launchpad/tokens/[id]/route.ts` | `db`, `http` |
| `app/api/leaderboard/route.ts` | `auth`, `db`, `users`, `http` |
| `app/api/leaderboard/season/route.ts` | `db`, `users`, `http` |
| `app/api/oracle/webhook/route.ts` | `oracle`, `audit`, `http` |
| `app/api/oracle/resolutions/[id]/route.ts` | `db`, `http` |

## `server/*` module responsibilities

- **`http.ts`** — `ok()`/`fail()` envelope helpers, `handler()` wrapper that maps
  ZodError → `422` and `HttpError` → its status.
- **`auth.ts`** — `createNonce`, `buildAuthMessage`, `verifySignedMessage`
  (ed25519 via `tweetnacl`), `signToken` (JWT, 7d), `requireAuth`/`optionalAuth`.
- **`oracle.ts`** — `devResolver`, `adminResolver(adminKey)` adapters +
  `applyResolution(proposal)` (pari-mutuel settlement, XP via `awardXp`,
  OracleResolution + AuditLog rows). Resolving an already-RESOLVED market throws.
- **`xp.ts`** — `awardXp(...)` (the ONLY XP path: appends `XPEvent`, upserts
  `PlayerProfile`/rank/wins/losses, upserts active-season `LeaderboardEntry`,
  audit log) and `completeLevelServer(...)`.
- **`validators.ts`** — Zod schemas: `nonceSchema`, `verifyWalletSchema`,
  `createMarketSchema`, `placePredictionSchema`, `resolveMarketSchema`,
  `claimQuestSchema`, `createFastBetSchema`, `enterFastBetSchema`,
  `createBattleSchema`, `joinBattleSchema`, `voteBattleSchema`,
  `resolveBattleSchema`, `createTokenSchema`.
- **`db.ts`** — singleton Prisma client. `env.ts` — env parsing + prod boot guard
  (throws on insecure `JWT_SECRET` in prod, uses `NEXT_PHASE` to not break
  `next build`). `users.ts`, `quests.ts`, `markets.ts`, `audit.ts` — domain
  helpers.

Two route handlers are **legacy aliases** (`auth/verify`, `auth/profile`) that
re-export from the canonical handler — keep both working when touching auth.
