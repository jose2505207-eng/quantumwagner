# Data Flow (core flows)

Summarized from [`docs/wiki/03-core-flows.md`](../wiki/03-core-flows.md). Read
the wiki for full Mermaid diagrams and per-step citations.

## Auth — wallet sign-in (real)

`app/utils/walletAuth.tsx` (headless) runs when a wallet connects:
1. If a cached JWT exists → `GET /api/auth/profile` (alias of `/me`); if valid and
   wallet matches, done.
2. Else `POST /api/auth/nonce { wallet_address }` → `server/auth.createNonce`
   stores an `AuthNonce` (single-use, 5-min TTL).
3. Wallet signs `WALLET_AUTH_MESSAGE + nonce`.
4. `POST /api/auth/verify` (alias of `verify-wallet`) →
   `server/auth.verifySignedMessage` (ed25519 via tweetnacl). Verification fails
   unless the nonce exists, is unused, unexpired, and matches the wallet, AND the
   signature checks out. Nonce marked `used` only on success.
5. `server/auth.signToken({ sub, wallet })` issues a 7-day JWT → stored in
   localStorage `token`; `lib/api.ts` injects it as `Bearer` on every request.

## Predict — authed write

`POST /api/markets/[id]/predictions`: `requireAuth()` → `claims.sub`;
`placePredictionSchema.parse(body)` (`side YES|NO`, `amount` > 0 and ≤ 1,000,000,
optional `txSignature`); `prisma.prediction.create`; update market yes/no pool;
`awardXp(...)`. The DB `Prediction` is canonical; `txSignature` (optional) merely
records an on-chain stake.

## Resolve / settle — server authority

`POST /api/markets/[id]/resolve` or `POST /api/oracle/webhook` →
`server/oracle.applyResolution`:
- A resolver **adapter** proposes the outcome — `devResolver` trusts the caller;
  `adminResolver(adminKey)` requires `ADMIN_RESOLUTION_KEY`. Outcomes are never
  invented.
- Pari-mutuel payout: `payout = (stake / winnersStake) * totalPool`; losers get 0.
- Writes `OracleResolution` (status/source/confidence/raw), sets
  `market.status=RESOLVED` + `outcome`, settles each `Prediction`, calls
  `awardXp` (120 XP + win flag for winners, 10 XP consolation otherwise), logs
  audit. Re-resolving a RESOLVED market throws.

## XP — the single path (`server/xp.awardXp`)

1. Append immutable `XPEvent`.
2. Upsert `PlayerProfile`: recompute `xp`, `rankId` (`getRank`), `wins`/`losses`.
3. Upsert active-season `LeaderboardEntry` (leaderboard derived from real XP/wins).
4. `logAudit("xp.award")`.
This is why the leaderboard is trustworthy while HUD XP is "local": leaderboard
reads server `LeaderboardEntry`, HUD reads `store/useGameStore`.

## Progression bridge (local, real-signal-driven)

`components/game/GameSync.tsx` reads `connected/publicKey` + backend prediction
count → `useGameStore.syncFromBackend({ hasWallet, predictionCount })`. Level 1
completes on real wallet connect, Level 2 on `predictionCount > 0`. When authed,
also pulls `GET /api/player/progress` and `hydrateServer`s it (server XP wins via
`Math.max`, completed levels unioned). Levels 3–6 currently complete from in-app
actions and are intended to be wired to real signals the same way.

## On-chain bet (browser → chain)

`useProgram()` builds the Anchor `Program` from `idl/prediction_market.json`;
`app/utils/methods.tsx` composes instructions using `config.ts` constants and the
treasury/battle-pool pubkeys. The escrow shape mirrors the reference program:
`initialize_market → place_bet → resolve/settle_market → withdraw_winnings`.

## Demo fallback (honesty path)

A screen calls a loader (`lib/useMarkets.ts`). Live rows → render, `source:"live"`,
no badge. Empty + `DEMO_MODE` on → render `lib/demo/markets.ts` seed,
`source:"demo"`, `<DemoBadge/>`. Empty + not demo → empty/error state. Demo data
is never merged into live.
