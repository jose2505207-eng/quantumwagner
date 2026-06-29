# 06 · API & Interfaces

Three interface surfaces: the **REST API** (in-repo Route Handlers), the
**on-chain program** (Anchor instructions), and the **client hooks/stores** that
the UI consumes.

## REST API

In-repo Next.js Route Handlers under `app/api/*`, Node runtime, Prisma + SQLite.
Base URL is same-origin unless `NEXT_PUBLIC_API_URL` is set.
`Source: app/api/markets/route.ts`, `Source: lib/game/config.ts`.

**Envelope** (`server/http.ts`): success → `{ "success": true, "data": ... }`;
error → `{ "success": false, "message": "...", "details"?: ... }`.
**Auth:** `Authorization: Bearer <jwt>` from wallet sign-in.
**Validation:** Zod on every body (`server/validators.ts`); failures → `422`.
**Authority:** XP, wins, resolution computed server-side only.

The route handlers below are confirmed to exist on disk
(`Source: find app/api -name route.ts`). Method/auth/body details are
cross-referenced with the maintained reference `docs/API.md`.

### System
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET | `/api/health` | — | `app/api/health/route.ts` |
| GET | `/api/config/public` | — | `app/api/config/public/route.ts` |

### Auth (wallet signed-message)
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| POST | `/api/auth/nonce` | — | `app/api/auth/nonce/route.ts` |
| POST | `/api/auth/verify-wallet` | — | `app/api/auth/verify-wallet/route.ts` |
| POST | `/api/auth/verify` | — | `app/api/auth/verify/route.ts` (alias) |
| GET | `/api/auth/me` | ✓ | `app/api/auth/me/route.ts` |
| GET | `/api/auth/profile` | ✓ | `app/api/auth/profile/route.ts` (alias) |

Flow: `nonce` → wallet signs `message` (ed25519) → `verify-wallet` → JWT. Nonces
single-use, 5-min TTL. `Source: server/auth.ts`, `Source: docs/API.md`.

### Player
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET | `/api/player/profile` | ✓ | `app/api/player/profile/route.ts` |
| GET | `/api/player/progress` | ✓ | `app/api/player/progress/route.ts` |
| GET | `/api/player/quests` | ✓ | `app/api/player/quests/route.ts` |
| POST | `/api/player/quests/:questId/claim` | ✓ | `app/api/player/quests/[questId]/claim/route.ts` |

### Markets
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET | `/api/markets` | — | `app/api/markets/route.ts` |
| POST | `/api/markets` | ✓ | `app/api/markets/route.ts` |
| GET | `/api/markets/:id` | — | `app/api/markets/[id]/route.ts` |
| GET | `/api/markets/:id/predictions` | — | `app/api/markets/[id]/predictions/route.ts` |
| POST | `/api/markets/:id/predictions` | ✓ | `app/api/markets/[id]/predictions/route.ts` |
| POST | `/api/markets/:id/resolve` | ✓ | `app/api/markets/[id]/resolve/route.ts` |
| GET | `/api/positions` | ✓ | `app/api/positions/route.ts` |

Body schemas (`Source: server/validators.ts`): `createMarketSchema`
(`question` 8–280, `endTime`, optional `description`/`category`/`pda`);
`placePredictionSchema` (`side: YES|NO`, `amount` >0 ≤1e6, optional `txSignature`);
`resolveMarketSchema` (`outcome: YES|NO`, `source: dev|admin`, optional `adminKey`).

### Fast Bets
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET / POST | `/api/fast-bets` | — / ✓ | `app/api/fast-bets/route.ts` |
| POST | `/api/fast-bets/:id/enter` | ✓ | `app/api/fast-bets/[id]/enter/route.ts` |
| POST | `/api/fast-bets/:id/resolve` | ✓ | `app/api/fast-bets/[id]/resolve/route.ts` |

### Meme Battles
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET / POST | `/api/battles` | — / ✓ | `app/api/battles/route.ts` |
| GET | `/api/battles/:id` | — | `app/api/battles/[id]/route.ts` |
| POST | `/api/battles/:id/join` | ✓ | `app/api/battles/[id]/join/route.ts` |
| POST | `/api/battles/:id/vote` | ✓ | `app/api/battles/[id]/vote/route.ts` |
| POST | `/api/battles/:id/resolve` | ✓ | `app/api/battles/[id]/resolve/route.ts` |

### Launchpad
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET / POST | `/api/launchpad/tokens` | — / ✓ | `app/api/launchpad/tokens/route.ts` |
| GET | `/api/launchpad/tokens/:id` | — | `app/api/launchpad/tokens/[id]/route.ts` |

### Leaderboard
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| GET | `/api/leaderboard` | opt | `app/api/leaderboard/route.ts` |
| GET | `/api/leaderboard/season` | — | `app/api/leaderboard/season/route.ts` |

### Oracle
| Method | Path | Auth | Handler |
| --- | --- | --- | --- |
| POST | `/api/oracle/webhook` | key | `app/api/oracle/webhook/route.ts` |
| GET | `/api/oracle/resolutions/:id` | — | `app/api/oracle/resolutions/[id]/route.ts` |

Resolution settles predictions pari-mutuel, awards XP/wins, updates the
leaderboard, and writes an audit log. `Source: server/oracle.ts`,
`Source: docs/API.md`.

> Method/auth columns marked from `docs/API.md` are the maintained reference; if
> you change a handler's method or auth, re-open the matching `route.ts` to keep
> this table honest.

## On-chain program interface

### Deployed program (`C8SAQXW3…toSc`)
Interface lives in `idl/prediction_market.json` + `idl/types.ts`; consumed via
`useProgram()` and called from `app/utils/methods.tsx`. It covers markets,
battles, token launches, bonding curves and reputation (per `config.ts`
constants). `Source: idl/prediction_market.json`, `Source: app/utils/useProgram.ts`,
`Source: app/utils/methods.tsx`.

### Reference program instructions (`contracts/quantum_wager`)
The auditable minimal core — its public instruction surface
(`Source: contracts/quantum_wager/programs/quantum_wager/src/lib.rs`):

| Instruction | Effect |
| --- | --- |
| `initialize_market(market_id, end_ts)` | Create a binary market + vault PDA |
| `place_bet(side, amount)` | Escrow lamports into the vault, record a `Position` |
| `resolve_market(outcome)` | Authority sets the outcome after `end_ts` |
| `claim_winnings()` | Pari-mutuel payout from the vault to a winning position |

Accounts: `Market`, `Position` (PDAs seeded by `market`/`vault`/`position`).
Events: `MarketInitialized`, `BetPlaced`, `MarketResolved`, `WinningsClaimed`.
Errors: `WagerError::{InvalidAmount, InvalidSide, MarketResolved, MarketEnded,
MarketNotResolved, AlreadyClaimed, NotAWinner, Unauthorized}`.

## Client hooks & stores (the UI's interface to all of the above)

| Symbol | File | Returns |
| --- | --- | --- |
| `api` (axios) + `getMarkets`/`getMarket`/`getProfile` | `lib/api.ts` | Typed REST calls with JWT injected |
| `useMarkets()` | `lib/useMarkets.ts` | `{ markets, source, loading, error, reload }` |
| `useLeaderboard()` | `lib/useLeaderboard.ts` | Leaderboard data |
| `useProgram()` | `app/utils/useProgram.ts` | Anchor `Program` or `null` |
| `useAllBattles`/`useAllTokens`/`useUserBattles`/`useUserTokens`/`useUserBoughtTokens` | `app/utils/*` | On-chain data |
| `useGameStore` | `store/useGameStore.ts` | Local progression + actions |
| `useUserStore` | `store/userInfo.ts` | Authenticated backend user |
| `usePositionStore` | `store/usePositionStore.ts` | Player positions |

`Source: lib/`, `Source: app/utils/`, `Source: store/` listings.
