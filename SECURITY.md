# Security Policy — Quantum Wager

> ⚠️ **Devnet / demo software.** This project is **not** approved for real-money
> or mainnet use. A security audit, economic review, and legal/compliance review
> are required first (see "Before mainnet").

## Reporting a vulnerability

Email the maintainers (or open a private security advisory on GitHub). Do not
open public issues for security reports. Include reproduction steps and impact.

## Trust model

The **server is authoritative** for everything of value. The client may *request*
actions but never decides them:

| Concern                         | Authority           | Enforcement |
| ------------------------------- | ------------------- | ----------- |
| Wallet identity                 | Server              | ed25519 signed-message verify (`server/crypto.ts`) over a single-use, expiring nonce; JWT session |
| XP / rank / level               | Server              | `awardXp`/`completeLevelServer` write an immutable `XPEvent`; client XP is display-only |
| Bet / prediction outcome        | Server / oracle     | `resolve` flows through `server/oracle.ts`; the frontend can never set a winner |
| Payouts                         | Server              | pari-mutuel math in `server/settlement.ts` (unit-tested) |
| Leaderboard                     | Server              | derived from persisted `LeaderboardEntry` (real XP/wins) |
| Admin resolution                | Server              | gated by `ADMIN_RESOLUTION_KEY` |

## Implemented controls

- **Signed-message auth**: nonce (single-use, 5-min TTL) → ed25519 verify → JWT (`server/auth.ts`). Wallet *connection alone is not authentication*.
- **Replay protection**: nonces are marked `used` on success and expire.
- **Server-side validation**: every request body is validated with zod (`server/validators.ts`).
- **Authorization**: mutations require a valid JWT; resolution requires the admin key.
- **Audit logs**: `AuditLog` rows for market create, prediction place, resolution, XP award, auth (`server/audit.ts`).
- **Rate limiting**: in-memory fixed-window limiter on auth endpoints (`server/rateLimit.ts`), gated by `RATE_LIMIT_ENABLED`.
- **Env validation**: `server/env.ts` (zod); the server refuses to boot in production with the insecure default `JWT_SECRET`.
- **No secrets in the client**: only `NEXT_PUBLIC_*` values reach the browser; `JWT_SECRET`, `ADMIN_RESOLUTION_KEY`, `DATABASE_URL` are server-only.
- **No secrets committed**: `.env*` is gitignored (except `.env.example`); the SQLite db is gitignored.

## Known limitations (must fix before production)

- Rate limiter is **in-memory** — does not span serverless instances. Use Redis/Upstash for multi-instance.
- No CORS hardening config yet (same-origin in-repo API mitigates this; add explicit allowlist if exposing cross-origin).
- No CSRF tokens (JWT in `Authorization` header, not cookies, reduces CSRF surface — keep it that way).
- On-chain settlement is **not** wired to live devnet execution; payouts are recorded off-chain.
- No automated dependency scanning in CI yet (add `npm audit` / Dependabot).

## Before mainnet (required, not done)

- Professional **smart-contract security audit**.
- **Economic review** of pari-mutuel math, fees, rounding/dust.
- **Legal / compliance review** — prediction markets and token launches are
  regulated; KYC/AML, geofencing, age limits, and Terms are required.
- Strong production secrets, managed Postgres, distributed rate limiting,
  monitoring/alerting, and integration/E2E test coverage of money flows.
