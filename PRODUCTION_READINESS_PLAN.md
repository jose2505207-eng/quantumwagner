# Production Readiness Plan — Quantum Wager

Living plan tracking the path from demo to production. Status as of this commit.

## Loop 0 — Repo recon

- **Stack:** Next.js 14 (App Router) · React 18 · TS strict · Tailwind v4 · Zustand · Prisma + SQLite · `@solana/wallet-adapter-*` (devnet) · Anchor. Package manager: npm (`--legacy-peer-deps`).
- **Boundaries:** frontend (`app/`, `components/`, `lib/`), in-repo backend (`app/api/*` route handlers + `server/*`), DB (`prisma/`), contracts (`contracts/quantum_wager/`).
- **Mock data:** isolated behind `DEMO_MODE` and badged (`lib/demo/`, portfolio/fastbet fallbacks). No mock data silently powers a critical flow.

## Loop 1 — Product journey audit (Level 1–6)

| Lv | Flow | Status | Authority |
| -- | ---- | ------ | --------- |
| 1 | Connect Wallet | ✅ real | Server completes on verified signature |
| 2 | Place First Prediction | ✅ real | Persisted; server awards XP |
| 3 | Win a Fast Bet | ⚠️ backend real, UI feed demo | Server settles + XP on first win |
| 4 | Join Meme Battle | ✅ backend real | Server records join + XP |
| 5 | Launch Token | ⚠️ metadata real, SPL deploy not wired | Server records launch + XP |
| 6 | Enter Leaderboard | ✅ real | Derived from persisted XP/wins |

Acceptance criteria per level: a real persisted action triggers the milestone,
XP is server-authoritative, and the UI reflects it. Met for 1/2/4/6; 3/5 are
backend-real but UI/on-chain partially demo (documented).

## Loop 2 — Architecture (shipped)

- **API:** REST via Next route handlers (`docs/API.md`). Same-origin by default.
- **DB:** Prisma, 20 models, migration + seed. SQLite dev → Postgres prod (one datasource change).
- **Auth:** nonce → ed25519 verify → JWT (`server/auth.ts`, `server/crypto.ts`).
- **Oracle:** adapter + dev/admin resolver + webhook (`server/oracle.ts`); pari-mutuel settlement (`server/settlement.ts`).
- **Admin:** resolution gated by `ADMIN_RESOLUTION_KEY`.

## Definition-of-Done checklist

| # | Item | Status |
| - | ---- | ------ |
| 1 | App builds | ✅ `next build` |
| 2 | Typecheck passes | ✅ `tsc` 0 errors (ignoreBuildErrors removed) |
| 3 | Lint passes / documented | ✅ new code clean; legacy warnings documented |
| 4 | Core tests pass | ✅ 25 vitest tests |
| 5 | No critical flow on hidden mock data | ✅ DEMO_MODE-gated + badged |
| 6 | Wallet auth = signed message | ✅ |
| 7 | Backend authoritative (XP/bets/portfolio/outcome/leaderboard) | ✅ |
| 8 | Schema + migrations | ✅ |
| 9 | Prediction tx lifecycle | ⚠️ off-chain lifecycle real; on-chain not wired |
| 10 | Resolution not frontend-controlled | ✅ |
| 11 | Admin actions protected | ✅ key-gated |
| 12 | Audit logs | ✅ |
| 13 | Solana devnet flow | ⚠️ scaffold + docs; not compiled/deployed here |
| 14 | Env documented | ✅ `.env.example` |
| 15 | Mobile-safe, no portfolio/XP overlap | ✅ navbar three-zone flex fix |
| 16 | Loading/error/empty states | ✅ core screens |
| 17 | No client secrets | ✅ |
| 18 | Security basics | ✅ (rate limit, validation, env guard, audit) |
| 19 | Deployment instructions | ✅ README |
| 20 | Final audit report | ✅ `PRODUCTION_AUDIT_REPORT.md` |

**Overall:** Beta/demo-ready on devnet. Not production/mainnet-ready — see the
audit report for blockers (on-chain settlement, Postgres, audit, legal).
