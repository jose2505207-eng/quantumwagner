# 11 · Troubleshooting

Known failure modes, their likely cause, and the fix. Each is grounded in the
code that produces the behaviour.

## Install & build

| Symptom | Cause | Fix |
| --- | --- | --- |
| `npm install` ERESOLVE peer conflicts | `react-native`/Solana peers pull React 19; project is React 18 | `npm install --legacy-peer-deps` (`Source: README.md`, `docs/BUILD_PROGRESS.md`) |
| `@prisma/client` not found at runtime | Prisma client not generated | `pnpm db:generate` (normally `postinstall` runs it) (`Source: package.json`) |
| `next build` fails on env | Confused build vs runtime env validation | `server/env.ts` already guards this via `NEXT_PHASE`; ensure you didn't remove it (`Source: server/env.ts`) |

## Runtime / API

| Symptom | Cause | Fix |
| --- | --- | --- |
| `pnpm start` throws on boot in prod | `JWT_SECRET` still the insecure dev default | set a strong `JWT_SECRET` (`Source: server/env.ts`) |
| `401 Unauthorized` on writes | missing/expired/invalid Bearer JWT | reconnect wallet to re-run sign-in (7-day TTL) (`Source: server/auth.ts`, `app/utils/walletAuth.tsx`) |
| `422 Validation failed` | request body fails a Zod schema | check `server/validators.ts` for the exact shape (`Source: server/http.ts`) |
| Sign-in loops / "Wallet login failed" | nonce expired (5-min TTL), already used, or wallet mismatch | retry; `verifySignedMessage` requires a fresh, unused nonce for that wallet (`Source: server/auth.ts`) |
| `/api/health` not healthy | DB unreachable / migrations not applied | run `pnpm db:migrate` (`Source: app/api/health/route.ts`, `README.md`) |
| `market already resolved` error on resolve | resolving a `RESOLVED` market | expected guard; markets resolve once (`Source: server/oracle.ts`) |
| `invalid admin resolution key` | wrong/missing `adminKey` for the admin resolver | pass the configured `ADMIN_RESOLUTION_KEY` (`Source: server/oracle.ts`) |

## Data & honesty

| Symptom | Cause | Fix |
| --- | --- | --- |
| UI shows data wearing a "DEMO" badge | live source empty + `DEMO_MODE` on | expected fallback; seed real data or set `NEXT_PUBLIC_APP_MODE=production` (`Source: lib/useMarkets.ts`, `lib/game/config.ts`) |
| Production shows demo data | `NEXT_PUBLIC_DEMO_MODE=true` or `APP_MODE` not `production` | set `NEXT_PUBLIC_APP_MODE=production`, unset the force flag (`Source: lib/game/config.ts`) |
| HUD XP ≠ leaderboard XP | HUD is local; leaderboard is server-authoritative | expected; `hydrateServer` reconciles when authenticated, server value wins (`Source: store/useGameStore.ts`, `server/xp.ts`) |
| Progress lost / reset | local progression is per-device in `localStorage` (`qw-progress-v1`) | by design; authoritative progress comes from `GET /api/player/progress` (`Source: store/useGameStore.ts`, `GameSync.tsx`) |
| SQLite data vanishes on Vercel | local file not durable on serverless | use managed Postgres + switch Prisma provider (`Source: README.md`, `prisma/schema.prisma`) |

## On-chain (devnet)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `useProgram()` returns `null` | no connected Anchor wallet | connect a wallet first (`Source: app/utils/useProgram.ts`) |
| Tx fails / wrong cluster after RPC change | `useProgram.ts` hardcodes the devnet RPC | update the hardcoded URL too, not just env (`Source: app/utils/useProgram.ts`) |
| `anchor test`/`deploy` fails | Solana/Anchor toolchain missing | install Rust + Solana CLI + Anchor (avm); not vendored (`Source: docs/DEVNET_DEPLOYMENT.md`) |
| Program id mismatch | reference scaffold uses placeholder `Quantum111…` | `anchor keys sync` after build; update `config.ts` + `NEXT_PUBLIC_PROGRAM_ID` (`Source: contracts/quantum_wager/Anchor.toml`) |

## Escalation

If a fix isn't here, trace the request: `lib/api.ts` → `app/api/**/route.ts` →
`server/*.ts`. The `handler()` wrapper logs unexpected errors as
`"API error:"` and returns a `500` — check server logs. `Source: server/http.ts`.
