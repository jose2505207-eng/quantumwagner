# 07 · Data & State

State lives in four places, each with a different lifecycle and a different level
of trust:

| Store | Where | Authority | Lifecycle |
| --- | --- | --- | --- |
| Relational DB | Prisma + SQLite (`prisma/schema.prisma`) | **Authoritative** | Persisted on disk (dev) / Postgres (prod) |
| Local progression | `useGameStore` → localStorage | Display only | Per-device, key `qw-progress-v1` |
| Session/user | `useUserStore`, JWT in `localStorage` | Derived from DB | Per-browser, 7-day JWT |
| On-chain accounts | Solana program PDAs | Authoritative for escrow | On devnet ledger |

## 1. Relational data (Prisma)

Datasource is SQLite for zero-friction dev; swap `provider`/`url` for Postgres in
prod. The server is the source of truth for XP, wins, and resolution.
`Source: prisma/schema.prisma` (header).

### Model groups (`Source: prisma/schema.prisma`)

**Identity & auth**
- `User` — hub model; `walletAddress` unique, `isDemo` flag; relations to almost
  everything.
- `Wallet` — additional wallets (chain/network), defaults solana/devnet.
- `AuthNonce` — single-use login nonces with `expiresAt` (5-min TTL in code).

**Gamification**
- `PlayerProfile` — `xp`, `rankId`, `level`, `completedLevels` (JSON string
  array), `wins`/`losses`. One per user.
- `XPEvent` — **append-only XP ledger**; every XP change is one row (auditable).
- `Quest` / `UserQuest` — quest definitions and per-day claims (unique on
  `userId+questId+day` for idempotent daily reset).
- `Streak` — daily check-in counter (`lastCheckIn` as `yyyy-mm-dd`).

**Markets & betting**
- `Market` — `question`, `category`, `status` (ACTIVE/RESOLVED/CANCELLED),
  `outcome`, `yesPool`/`noPool`, `endTime`, optional `pda`, `isDemo`.
- `Prediction` — a stake (`side`, `amount`); settlement fields `settled`/`won`/
  `payout`/`settledAt`, optional on-chain `txSignature`.
- `FastBet` / `FastBetEntry` — timed speed rounds and entries.
- `MemeBattle` / `MemeBattleEntry` / `MemeBattleVote` — battles, staked entries,
  one vote per user (unique `battleId+userId`).
- `LaunchToken` — launchpad tokens (`mint`, `totalSupply` as string, `txSignature`).

**Leaderboard & oracle**
- `LeaderboardSeason` / `LeaderboardEntry` — seasonal standings, unique
  `seasonId+userId`; kept in sync by `awardXp`.
- `OracleResolution` — every resolution attempt with `source`, `status`,
  `outcome`, `confidence`, `raw` payload (traceable).

**Audit**
- `Transaction` — recorded value movements (`kind`, `amount`, `signature`).
- `AuditLog` — append-only action log (`action`, `target`, `meta`).

### Key invariants encoded in the schema
- `XPEvent` and `AuditLog` are **append-only ledgers** — never mutate rows,
  insert new ones. `Source: prisma/schema.prisma`, `Source: server/xp.ts`,
  `Source: server/audit.ts`.
- `isDemo` exists on user-facing content models so seed data is filterable and
  badge-able. `Source: prisma/schema.prisma`, `Source: prisma/seed.ts`.
- `completedLevels` is a JSON string (SQLite has no native arrays) — parse it
  when reading. `Source: server/xp.ts` (`completeLevelServer`).

### Migrations & seed
- Migrations are committed under `prisma/migrations/` (the SQLite `.db` file is
  gitignored). `Source: .gitignore`, `Source: prisma/migrations/`.
- `prisma/seed.ts` creates **only** `isDemo: true` data with obviously-fake
  wallet addresses (`DEMOoracle…`); idempotent upserts on stable ids, safe to
  re-run. `Source: prisma/seed.ts`.

## 2. Local progression (`useGameStore`)

A Zustand store with the `persist` middleware, persisted under key
`qw-progress-v1`. `Source: store/useGameStore.ts`.

- **Persisted shape** (`partialize`): `xp`, `completedLevels`, `claimedQuests`,
  `lastQuestDay`, `streak`, `lastCheckIn` — action closures are **not** persisted.
- **Actions:** `completeLevel` (idempotent), `claimQuest` (idempotent per day,
  rolls over at `todayKey`), `checkIn` (advances/resets streak + capped bonus),
  `addXp`, `syncFromBackend` (real-signal reconciliation), `hydrateServer`
  (server XP wins via `Math.max`), `reset`.
- **Toasts:** every gain sets a one-shot `lastToast` consumed by `<XPToast/>`.

> Honesty rule restated in code: "this is a LOCAL progression layer. It does not
> grant on-chain value." `Source: store/useGameStore.ts`.

### Why two XP numbers exist
The **HUD** XP is local (`useGameStore`). The **leaderboard** XP is server-side
(`PlayerProfile`/`LeaderboardEntry`, written only by `awardXp`). They can differ;
`hydrateServer` pulls the server number into the HUD when authenticated and lets
the server value win. `Source: store/useGameStore.ts`, `Source: server/xp.ts`,
`Source: components/game/GameSync.tsx`.

## 3. Session / user state

- The JWT is stored in `localStorage` under `token` and injected on every axios
  request. `Source: lib/api.ts`, `Source: app/utils/walletAuth.tsx`.
- `useUserStore` holds the authenticated backend user (`store/userInfo.ts`),
  populated by `walletAuth` on sign-in.
- On wallet mismatch the cached token is cleared and re-issued. `Source: app/utils/walletAuth.tsx`.

## 4. On-chain accounts (the escrow truth)

For the reference program, state is held in PDAs
(`Source: contracts/quantum_wager/programs/quantum_wager/src/lib.rs`):
- `Market` PDA — `seeds = ["market", market_id]`; holds pools, `resolved`,
  `outcome`.
- `vault` PDA — `seeds = ["vault", market]`; a `SystemAccount` holding escrowed
  lamports.
- `Position` PDA — `seeds = ["position", market, owner]`; one per bettor per
  market, `init_if_needed` so repeated bets accumulate.

Lifecycle & risks: lamports live in the vault between `place_bet` and
`claim_winnings`; the vault signs payouts via its bump seed. The deployed program
extends this with token mints, bonding-curve and battle-pool accounts referenced
by `config.ts` pubkeys (`treasury`, `battlePoolVault`, `royaltyVault`).
`Source: config.ts`. The DB mirrors on-chain results off-chain via optional
`pda`/`mint`/`txSignature` columns, but settlement XP/wins are computed from the
**DB** predictions, not re-read from chain. `Source: server/oracle.ts`,
`Source: prisma/schema.prisma`.
