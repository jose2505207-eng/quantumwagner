# API Map

Two interface surfaces: the **REST API** (in-repo, `app/api/**`) and the
**on-chain instruction** surface (`idl/prediction_market.json`).

## REST routes

Envelope: `{ success, data }` or `{ success: false, message }`. Auth via
`Bearer` JWT (localStorage `token`). See `docs/API.md` for request/response
shapes; `backend-map.md` for server delegation.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | no | DB/health probe |
| GET | `/api/config/public` | no | Public runtime config |
| POST | `/api/auth/nonce` | no | Issue login nonce |
| POST | `/api/auth/verify-wallet` | no | Verify signature → JWT |
| POST | `/api/auth/verify` | no | **alias** of verify-wallet |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/auth/profile` | yes | **alias** of me |
| GET | `/api/player/profile` | yes | Player profile |
| GET | `/api/player/progress` | yes | Server progression (XP/levels) |
| GET | `/api/player/quests` | yes | Quests for the player |
| POST | `/api/player/quests/[questId]/claim` | yes | Claim a quest (awards XP) |
| GET/POST | `/api/markets` | GET no / POST yes | List / create market |
| GET | `/api/markets/[id]` | no | Single market |
| POST | `/api/markets/[id]/predictions` | yes | Place prediction |
| POST | `/api/markets/[id]/resolve` | yes (admin key) | Resolve + settle |
| GET | `/api/positions` | yes | User positions |
| GET/POST | `/api/fast-bets` | GET no / POST yes | List / create fast bet |
| POST | `/api/fast-bets/[id]/enter` | yes | Enter a fast bet |
| POST | `/api/fast-bets/[id]/resolve` | yes (admin key) | Resolve fast bet |
| GET/POST | `/api/battles` | GET no / POST yes | List / create battle |
| POST | `/api/battles/[id]/join` | yes | Join battle |
| POST | `/api/battles/[id]/vote` | yes | Vote in battle |
| POST | `/api/battles/[id]/resolve` | yes (admin key) | Resolve battle |
| GET/POST | `/api/launchpad/tokens` | GET no / POST yes | List / create token |
| GET | `/api/launchpad/tokens/[id]` | no | Single token |
| GET | `/api/leaderboard` | optional | Leaderboard |
| GET | `/api/leaderboard/season` | no | Season leaderboard |
| POST | `/api/oracle/webhook` | admin key | External resolution intake |
| GET | `/api/oracle/resolutions/[id]` | no | Resolution record |
| GET | `/api/oracle/price` | admin key (`x-admin-key`/`?adminKey`) | Live price ops probe (never fabricates; 502 on provider failure) |
| GET | `/api/oracle/settle-stats` | admin key (`x-admin-key`/`?adminKey`) | FastBet `settleMethod` distribution among resolved rounds (asof/spot-fallback/spot/unrecorded) + `asofShare` reliability metric; real recorded values only |

(HTTP method/auth specifics: confirm against each `route.ts` and `docs/API.md`
before relying on them for a contract change.)

## On-chain instruction surface — `idl/prediction_market.json`

Deployed devnet program `C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`.
Instructions (18):

`initialize_platform`, `initialize_market`, `initialize_launchpad`, `place_bet`,
`settle_market`, `cancel_market`, `withdraw_winnings`, `create_battle`,
`enter_battle`, `increase_battle_position`, `resolve_battle`,
`claim_battle_reward`, `create_token_launch`, `buy_token`, `sell_token`,
`migrate_to_dex`, `claim_creator_tokens`, `withdraw_creator_royalties`.

Accounts: `PlatformConfig`, `Market`, `UserPosition`, `Battle`, `BattlePosition`,
`TokenLaunch`.

Consumed in the browser via `app/utils/useProgram.ts` + `app/utils/methods.tsx`
with parameters from `config.ts`.

> The **reference** scaffold `contracts/quantum_wager/` exposes only a minimal
> escrow subset (init/bet/resolve/claim) with a placeholder id — it is NOT the
> source of the 18-instruction deployed program.
