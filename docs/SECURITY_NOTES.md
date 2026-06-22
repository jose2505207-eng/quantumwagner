# Quantum Wager — Security & Trust Notes

> Honest accounting of what is real, what is demo, and what must change before
> any production / mainnet launch.

## Trust boundaries today

| Concern                | Status in this repo                                            |
| ---------------------- | ------------------------------------------------------------- |
| Wallet auth            | Real: nonce + `signMessage` + JWT (`app/utils/walletAuth.tsx`)|
| Markets / positions    | Real: live REST backend (`lib/api.ts`)                        |
| XP / ranks / quests    | **Client-side / local** (`store/useGameStore.ts`) — labelled  |
| Fast bets feed         | **Demo** (badged) — no live feed wired yet                    |
| Sample positions       | **Demo** fallback, only in `DEMO_MODE`, badged                |
| On-chain actions       | Real: Anchor program on **devnet**                            |

## Why local XP is acceptable for now (and what to do for prod)

The progression layer is intentionally client-side so the gamified experience
can ship against the existing backend without inventing fake server state. It is
**always labelled** (`LOCAL` / `DEMO` badges) so users are never misled.

**Do not** trust client XP for anything of value. Before a real economy:

1. Move XP/quest/streak accrual server-side. The client may *request* an action;
   the server validates and writes the `XPEvent`.
2. Derive the leaderboard from server-side XP/wins, not from local state.
3. Make milestone completion verifiable from on-chain events / backend records
   (extend `GameSync` to read authoritative signals only).

## Required before mainnet (NOT done here)

- ⚠️ **Smart-contract security audit** by a reputable firm.
- ⚠️ **Economic review** of pools, fees, payouts, and bonding curves.
- ⚠️ **Legal review** (prediction markets are regulated in many jurisdictions).
- Server-side authorization for every state change; never trust the client for
  XP, wins, or outcome resolution.
- Input validation (zod or equivalent) on every backend endpoint.
- Rate limiting and audit logs for market creation, bets, resolution, claims.
- Environment-variable validation; no secrets committed (`.env*` is gitignored
  except `.env.example`).

The app is **devnet-only**. There are no mainnet claims anywhere, and there must
not be until the above is complete.

## Demo-mode contract

`DEMO_MODE` (see `lib/game/config.ts`) is **on** unless `NEXT_PUBLIC_APP_MODE=production`.
When on, screens may render seed data **only** as a fallback when the live source
returned nothing, and **only** with a visible `<DemoBadge/>`. Mock data is never
merged silently into live data.
