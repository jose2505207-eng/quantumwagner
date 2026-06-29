# 05 · Configuration

All configuration is environment variables (`.env`) plus a small set of on-chain
constants in `config.ts`. The canonical template is `.env.example` — copy it to
`.env`. Never commit real secrets (`.env*` is gitignored except `.env.example`).
`Source: .env.example`, `Source: .gitignore`.

## Environment variables

### Frontend (`NEXT_PUBLIC_*` — exposed to the browser)

| Var | Default | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `""` (same-origin) | REST backend base URL; empty = in-repo API |
| `NEXT_PUBLIC_APP_MODE` | `development` | `development`/`demo` allow badged demo data; `production` disables it |
| `NEXT_PUBLIC_DEMO_MODE` | unset | `"true"` forces demo fallbacks on even in production |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Solana network (devnet only) |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Devnet RPC endpoint |
| `NEXT_PUBLIC_PROGRAM_ID` | (commented) | On-chain program id override |

`Source: .env.example`, `Source: lib/game/config.ts`, `Source: config.ts`.

How these are read: `lib/game/config.ts` derives `APP_MODE`, `DEMO_MODE`,
`API_URL`, `SOLANA_NETWORK`, `SOLANA_RPC_URL`. `DEMO_MODE` is the load-bearing
one:

```
DEMO_MODE = NEXT_PUBLIC_DEMO_MODE === "true" || APP_MODE !== "production"
```

So demo data is **on by default** and only fully off when
`NEXT_PUBLIC_APP_MODE=production` (and the force-flag is unset).
`Source: lib/game/config.ts`.

### Backend (server-only — NOT exposed to the browser)

| Var | Default | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | Prisma datasource (SQLite locally; Postgres in prod) |
| `JWT_SECRET` | `dev-only-insecure-secret-change-me` | Session JWT signing key; **must** be strong in prod |
| `WALLET_AUTH_MESSAGE` | `Sign this message to login to Quantum: ` | Prefix of the message wallets sign |
| `ORACLE_MODE` | `admin` | `dev` \| `admin` \| `provider` resolution mode |
| `ADMIN_RESOLUTION_KEY` | `dev-admin-key-change-me` | Required to resolve markets/fast-bets/battles + oracle webhook |
| `RATE_LIMIT_ENABLED` | `false` | Optional rate limiting toggle (`"true"` enables) |
| `RATE_LIMIT_REDIS_URL` | unset | Optional Upstash Redis REST URL — distributed limiter backend |
| `RATE_LIMIT_REDIS_TOKEN` | unset | Optional Upstash REST token (paired with the URL) |
| `MONITORING_DSN` | unset | Optional error-monitoring endpoint; unset = no-op |
| `MONITORING_ENABLED` | unset | `"false"` forces monitoring off even if a DSN is set |
| `SOLANA_NETWORK` | `devnet` | Backend Solana network |
| `SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Backend Solana RPC |

`Source: .env.example`, `Source: server/env.ts`.

**Rate-limit backend (opt-in).** `RATE_LIMIT_ENABLED="true"` turns on a
fixed-window limiter (used by the auth routes). By default it counts in-memory
(`MemoryStore`, single-node). Set **both** `RATE_LIMIT_REDIS_URL` and
`RATE_LIMIT_REDIS_TOKEN` to switch to a shared `RedisStore` (Upstash REST via
plain `fetch`, no SDK) so the window spans serverless instances. If the Redis
backend is unreachable the limiter **fails open** (logs + allows) — a down
limiter never hard-fails a request. The active backend is reported by
`GET /api/health` as `"disabled" | "memory" | "redis"`. `Source: server/rateLimit.ts`,
`Source: app/api/health/route.ts`.

**Monitoring (opt-in, no-op by default).** Leave `MONITORING_DSN` unset and the
app behaves exactly as before — nothing is sent. When set (and not forced off by
`MONITORING_ENABLED="false"`), unhandled 5xx errors are POSTed as a minimal JSON
event to that endpoint via `fetch` (provider-agnostic, no npm dependency).
Capturing is fire-and-forget and never alters a response. `Source: server/monitoring.ts`,
`Source: server/http.ts`.

**Validation & fail-fast:** `server/env.ts` parses these with Zod and:
- provides safe (clearly-insecure) defaults in development;
- in real production runtime (`NODE_ENV=production`, not the build phase) it
  **throws** on invalid config, and **throws** if `JWT_SECRET` is still the dev
  default. The `NEXT_PHASE` check prevents `next build` from failing while only
  collecting routes. `Source: server/env.ts`.

### Contracts (Anchor)

| Var | Meaning |
| --- | --- |
| `ANCHOR_PROVIDER_URL` | Devnet RPC for the program |
| `ANCHOR_WALLET` | Path to the deploy keypair |
| `PROGRAM_ID` | Your devnet program id after `anchor keys sync` |

`Source: .env.example` (commented), `Source: docs/DEVNET_DEPLOYMENT.md`.

## On-chain constants (`config.ts`)

Not env vars — these are compiled constants that shape on-chain instruction
parameters. `Source: config.ts`:

- **Identity:** `PROGRAM_ID = C8SAQXW3…toSc`, `treasury`, `royaltyVault`,
  `emergencyAdmin`, `battlePoolVault` (pubkeys).
- **Platform fees:** `PLATFORM_FEE_BPS = 300` (3%), `TOKEN_TRADING_FEE_BPS = 100`
  (1%), `BATTLE_FEE_BPS = 200` (2%), `CREATOR_ROYALTY_BPS = 150` (1.5%),
  `BATTLE_CONTRIBUTION_BPS = 1000` (10%).
- **Bet bounds:** `MIN_BET_AMOUNT` 0.01 SOL, `MAX_BET_AMOUNT` 100 SOL,
  `MARKET_CREATION_FEE` 0.1 SOL.
- **Token launch:** supply bounds (1M–1T), `MIN_INITIAL_PRICE`,
  `CREATOR_ALLOCATION_BPS = 1000`, bonding curve (`DEFAULT_CURVE_TYPE` exponential,
  `CURVE_STEEPNESS = 1000`).
- **Migration:** `MIGRATION_THRESHOLD`, `DEX_MIGRATION_FEE` 0.5 SOL,
  `MIN_LIQUIDITY_PERCENTAGE = 8000` (80%).
- **Battles:** eligibility threshold, duration bounds, `MIN_BATTLE_POOL` 1 SOL,
  `MAX_TOKENS_PER_BATTLE_SIDE = 10`.
- **Reputation gates:** `MARKET_CREATION_REPUTATION = 7500`,
  `BATTLE_CREATION_REPUTATION = 10000`.

These values describe the **deployed** program's economic surface; the reference
scaffold in `contracts/` does not implement all of them.

## RPC endpoint: one source of truth

`lib/solana.ts` exports `SOLANA_RPC_URL` (`NEXT_PUBLIC_SOLANA_RPC_URL`, devnet
fallback) as the single RPC source. Both the wallet `ConnectionProvider`
(`SolanaProvider`) and the Anchor program (`useProgram()`) now read that same
constant, so switching RPCs is a one-line/one-env change and the two can no
longer drift onto different endpoints. `Source: lib/solana.ts`,
`Source: app/utils/SolanaProvider.tsx`, `Source: app/utils/useProgram.ts`.
(Loop 7 removed the previously-hardcoded RPC in `useProgram.ts`.)

## Local vs production

| | Local (default) | Production |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_MODE` | `development` | `production` |
| Demo fallbacks | on, badged | off (unless forced) |
| `DATABASE_URL` | SQLite file | managed Postgres (change Prisma `provider`) |
| `JWT_SECRET` | dev default ok | must be strong (boot refuses otherwise) |
| `ADMIN_RESOLUTION_KEY` | dev default | change for any shared env |

`Source: README.md`, `Source: .env.example`, `Source: server/env.ts`.
