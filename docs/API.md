# Quantum Wager — API Reference

In-repo backend implemented as **Next.js Route Handlers** under `app/api/*`
(Node runtime) backed by **Prisma + SQLite**. Base URL is same-origin by
default (set `NEXT_PUBLIC_API_URL` to override).

**Envelope:** success → `{ "success": true, "data": ... }`; error →
`{ "success": false, "message": "...", "details"?: ... }`.
**Auth:** send `Authorization: Bearer <jwt>` (issued by `verify-wallet`).
**Validation:** all request bodies are validated server-side with zod.
**Authority:** XP, wins, and resolution are computed server-side only.

## System

| Method | Path                  | Auth | Description                         |
| ------ | --------------------- | ---- | ----------------------------------- |
| GET    | `/api/health`         | —    | DB ping + status                    |
| GET    | `/api/config/public`  | —    | Public, non-secret runtime config   |

## Auth (wallet signed-message)

| Method | Path                       | Auth | Body / notes |
| ------ | -------------------------- | ---- | ------------ |
| POST   | `/api/auth/nonce`          | —    | `{ wallet_address }` → `{ nonce, message }` |
| POST   | `/api/auth/verify-wallet`  | —    | `{ wallet_address, signature, message }` → `{ success, token, user }`; completes Level 1 |
| POST   | `/api/auth/verify`         | —    | legacy alias of verify-wallet |
| GET    | `/api/auth/me`             | ✓    | current user profile |
| GET    | `/api/auth/profile`        | ✓    | legacy alias of me |

Flow: `nonce` → wallet signs `message` (ed25519) → `verify-wallet` → JWT. Nonces
are single-use and expire in 5 minutes.

## Player

| Method | Path                                  | Auth | Description |
| ------ | ------------------------------------- | ---- | ----------- |
| GET    | `/api/player/profile`                 | ✓    | profile + derived stats |
| GET    | `/api/player/progress`                | ✓    | `{ xp, rankId, level, completedLevels, wins, losses, streak }` |
| GET    | `/api/player/quests`                  | ✓    | daily quests with claimed status |
| POST   | `/api/player/quests/:questId/claim`   | ✓    | claim a quest (idempotent per day) → XP |

## Markets

| Method | Path                               | Auth | Description |
| ------ | ---------------------------------- | ---- | ----------- |
| GET    | `/api/markets`                     | —    | list markets |
| POST   | `/api/markets`                     | ✓    | create `{ question, description?, category?, endTime, pda? }` |
| GET    | `/api/markets/:id`                 | —    | market + summary |
| GET    | `/api/markets/:id/predictions`     | —    | predictions for a market |
| POST   | `/api/markets/:id/predictions`     | ✓    | `{ side: YES\|NO, amount, txSignature? }`; first → Level 2 |
| POST   | `/api/markets/:id/resolve`         | ✓    | `{ outcome, source: dev\|admin, adminKey? }` via oracle |
| GET    | `/api/positions`                   | ✓    | the user's positions (predictions) |

## Fast Bets

| Method | Path                          | Auth | Description |
| ------ | ----------------------------- | ---- | ----------- |
| GET    | `/api/fast-bets`              | —    | list |
| POST   | `/api/fast-bets`              | ✓    | create |
| POST   | `/api/fast-bets/:id/enter`    | ✓    | `{ side, amount, txSignature? }` |
| POST   | `/api/fast-bets/:id/resolve`  | ✓    | `{ outcome, adminKey }`; first win → Level 3 |

## Meme Battles

| Method | Path                        | Auth | Description |
| ------ | --------------------------- | ---- | ----------- |
| GET    | `/api/battles`              | —    | list |
| POST   | `/api/battles`              | ✓    | create |
| POST   | `/api/battles/:id/join`     | ✓    | `{ side: A\|B, amount, txSignature? }`; first → Level 4 |
| POST   | `/api/battles/:id/vote`     | ✓    | `{ side: A\|B }` (one per user) |
| POST   | `/api/battles/:id/resolve`  | ✓    | `{ winner: A\|B, adminKey }` |

## Launchpad

| Method | Path                          | Auth | Description |
| ------ | ----------------------------- | ---- | ----------- |
| GET    | `/api/launchpad/tokens`       | —    | list |
| POST   | `/api/launchpad/tokens`       | ✓    | create `{ name, symbol, ... }`; first → Level 5 |
| GET    | `/api/launchpad/tokens/:id`   | —    | token detail |

## Leaderboard

| Method | Path                        | Auth | Description |
| ------ | --------------------------- | ---- | ----------- |
| GET    | `/api/leaderboard`          | opt  | active-season standings (real XP/wins) + your row |
| GET    | `/api/leaderboard/season`   | —    | active season info |

## Oracle

| Method | Path                            | Auth | Description |
| ------ | ------------------------------- | ---- | ----------- |
| POST   | `/api/oracle/webhook`           | key  | `{ marketId, outcome, adminKey, source?, raw? }` → applies resolution |
| GET    | `/api/oracle/resolutions/:id`   | —    | a resolution record (traceable) |

Resolution settles predictions pari-mutuel, awards XP/wins, updates the
leaderboard, and writes an audit log. Outcomes are never invented server-side.
