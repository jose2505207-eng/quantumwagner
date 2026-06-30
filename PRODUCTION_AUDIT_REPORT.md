# Production Audit Report — Quantum Wager

**Date:** 2026-06-23 · **Verdict: BETA / DEMO-READY (devnet). NOT production/mainnet-ready.**

## Executive summary

Quantum Wager is a coherent, server-authoritative full-stack app on devnet: a
gamified prediction arena with a real Next.js backend, Prisma persistence,
signed-message wallet auth, an oracle resolution flow, and unit tests. The core
Level 1→6 journey works end-to-end and is **not** powered by hidden mock data —
demo data is gated behind `DEMO_MODE` and visibly badged. It is **not** ready
for real money or mainnet: on-chain settlement is not wired, the DB is SQLite,
and no security/economic/legal review has occurred.

## What is now production-ready (or close)

- **Wallet auth** — nonce + ed25519 signed-message verification + JWT; replay-protected (single-use, expiring nonces). Unit-tested.
- **Server-authoritative state** — XP, wins, payouts, leaderboard, and resolution are all server-side. Client cannot set XP/outcome/payout.
- **Validation** — all endpoints zod-validated. Unit-tested.
- **Oracle/resolution** — adapter + dev/admin resolver + webhook; outcomes recorded with source/confidence/status + audit log. Pari-mutuel payout math unit-tested.
- **Audit logs** — sensitive actions recorded.
- **DB** — 20-model schema, migration, seed (DEMO-flagged).
- **Build/typecheck/tests** — all green (see Test results).
- **UI** — navbar three-zone flex fix removes the Portfolio/XP overlap; loading/empty/error states on core screens; honest demo badges.

## What is still NOT production-ready

| Area | Gap |
| ---- | --- |
| On-chain | Predictions/payouts are recorded **off-chain**; the Anchor program is a scaffold, not compiled/deployed from here. Tx signatures are stored but not verified on-chain. |
| Database | **Postgres-ready** (provider `postgresql`, baseline migration committed). Needs a provisioned managed instance + `DATABASE_URL`; not yet connected to a live prod DB here. |
| Fast bets | Backend is real; the **UI feed is still demo** data (badged). |
| Token launch | Metadata persisted; **SPL deployment not wired**. |
| Rate limiting | Distributed-capable (Loop 7): in-memory default, **opt-in Redis/Upstash** backend via env. Default deploy is still single-instance until the Redis env is set. |
| Tests | Server-authority integration suite + **client component tests** (jsdom/RTL, Loop 7) run in CI (106 tests). A **devnet on-chain E2E harness** exists (`pnpm e2e`) but is excluded from CI and not yet run green (needs funded creds). |
| Monitoring | Env-gated hooks **wired** (Loop 7): `captureException` on the 500 path + `/api/health` status. No-op until `MONITORING_DSN` is set; no managed collector provisioned yet. |

## Risk register

- **Security:** rate limiter is now distributed-capable (opt-in Redis, Loop 7) — but defaults to in-memory until the env is set, so multi-instance prod must configure `RATE_LIMIT_REDIS_URL`/`_TOKEN`; no dependency scanning in CI; admin key is a shared secret (rotate + scope before prod). No critical client-trust issues found (Loop 7 security-review of the limiter/monitoring/auth-route changes: no findings).
- **Legal/compliance:** prediction markets + token launches are regulated. **Blocker** — KYC/AML, geofencing, age gating, Terms, and counsel review required before real money. The app must stay devnet/demo until then.
- **Smart contract:** UNAUDITED scaffold. Reentrancy/arithmetic/PDA/rent correctness unreviewed. Do not deploy to mainnet.
- **Data integrity:** off-chain payouts mean the ledger is only as trustworthy as the DB; add reconciliation against chain once on-chain settlement lands. XP is event-sourced (`XPEvent`) and reconstructable.
- **UX/mobile:** navbar overlap fixed; broader pixel QA at 320–1440px still recommended via screenshots.
- **Performance:** fine for demo scale; no load testing performed.
- **Deployment:** Now Postgres + pnpm (frozen lockfile passes; `onlyBuiltDependencies` set). Remaining footgun: a managed Postgres must be provisioned and `DATABASE_URL` set + migrated, or the API fails at runtime (build still succeeds).

## Required env vars

`DATABASE_URL`, `JWT_SECRET` (strong; server refuses dev default in prod),
`WALLET_AUTH_MESSAGE`, `ADMIN_RESOLUTION_KEY`, `ORACLE_MODE`,
`RATE_LIMIT_ENABLED`, `SOLANA_NETWORK`, `SOLANA_RPC_URL`, and the
`NEXT_PUBLIC_*` frontend vars. Full list in `.env.example`.

## Test results

- `pnpm test` (vitest): **106 passed / 106** (Loop 7) across two projects — the
  node server-authority suite (settlement math, ed25519 auth, ranks/levels,
  validators, oracle, fast-bet, rate limiter, wins backfill) and the jsdom
  component suite (battlearena selector, OracleSettleStats).
- `pnpm typecheck`: **0 errors**.
- `pnpm lint`: **0 errors** (Loop 7); ~143 pre-existing warnings remain as known
  debt (unused imports, `<img>`→`<Image>`, exhaustive-deps).
- `pnpm build`: **passes** (all routes + 30+ API handlers).
- DB: `prisma migrate deploy` + `db:seed` succeed.
- Manual E2E (script): nonce → sign → verify (L1) → create market → first prediction (L2) → admin resolve → win settled → leaderboard updated. ✅

## Remaining blockers (to production)

1. Wire on-chain settlement (compile/deploy Anchor program; verify tx signatures).
2. Provision managed Postgres + set `DATABASE_URL` + run `prisma migrate deploy`; for multi-instance, set `RATE_LIMIT_REDIS_URL`/`_TOKEN` to activate the distributed limiter (Loop 7 made it opt-in-ready).
3. Run the devnet E2E harness green (funded keypair + RPC) and add money-flow E2E in CI.
4. Security audit + economic review + **legal/compliance review**.
5. Monitoring/alerting + analytics.

## Recommended next steps

1. Provision managed Postgres, set `DATABASE_URL`, run `pnpm db:migrate:deploy`, deploy to Vercel/Render with real secrets.
2. Compile + devnet-deploy `contracts/quantum_wager`; replace off-chain payout with on-chain settlement + reconciliation.
3. Add Playwright E2E covering Level 1→6 and failure paths.
4. Engage auditors + counsel before any real-money/mainnet step.
