# Database Map

Source: `prisma/schema.prisma` (SQLite datasource, `DATABASE_URL="file:./dev.db"`
by default). Client singleton in `server/db.ts`. Seeder: `prisma/seed.ts`
(`pnpm db:seed`). 21 models.

## Models and key relations

| Model | Purpose | Key fields / relations |
| --- | --- | --- |
| `User` | Account, keyed by wallet | `walletAddress @unique`, `isDemo`; hub relation to almost everything (profile, xpEvents, predictions, battleEntries, votes, launchTokens, leaderboard, transactions, auditLogs, marketsCreated). |
| `Wallet` | Linked wallet addresses | `address @unique`, `chain`/`network` (default solana/devnet), → `User`. |
| `AuthNonce` | Single-use login nonce | `nonce @unique`, `used`, `expiresAt` (5-min TTL); consumed by `server/auth.ts`. |
| `PlayerProfile` | Authoritative progression | `xp`, `rankId`, `level`, `completedLevels` (JSON **string**), `wins`, `losses`; 1:1 `User`. Written only by `awardXp`. |
| `XPEvent` | Append-only XP ledger | `amount`, `reason`, `refType`/`refId`; never mutated. |
| `Quest` | Quest catalog | `id` = stable slug, `xp`, `kind` (claim/derived), `active`. |
| `UserQuest` | Claimed quest per day | `questId`, `day`, `claimedAt`; → `User` + `Quest`. |
| `Streak` | Daily check-in streak | `count`, `lastCheckIn` (yyyy-mm-dd); 1:1 `User`. |
| `Market` | Prediction market | `question`, `category`, `status` (ACTIVE/RESOLVED/CANCELLED), `outcome` (YES/NO/null), `yesPool`/`noPool`, `endTime`, `pda` (on-chain acct), `isDemo`; → creator `User`, predictions, resolutions. |
| `Prediction` | A stake on a market | `side` (YES/NO), `amount`, `settled`, `won`, `payout`, `txSignature` (optional on-chain ref); → `Market` + `User`. **Canonical settlement record.** |
| `FastBet` | Short-duration bet | `question`, `symbol`, `status`, `outcome`, `pool`, `startTime`/`endTime`, `isDemo`. |
| `FastBetEntry` | Entry into a fast bet | → `FastBet` + `User`. |
| `MemeBattle` | Meme battle | (battles surface; → entries, votes). |
| `MemeBattleEntry` | Battle participation | → `MemeBattle` + `User`. |
| `MemeBattleVote` | Battle vote | → `MemeBattle` + `User`. |
| `LaunchToken` | Launchpad token | → creator `User`. |
| `LeaderboardSeason` | Season window | parent of leaderboard entries. |
| `LeaderboardEntry` | Per-user season standing | derived from real XP/wins; upserted inside `awardXp`; → `User` + `LeaderboardSeason`. |
| `OracleResolution` | Resolution record | `status`, `source`, `confidence`, `raw`; → `Market`; created by `applyResolution`. |
| `Transaction` | Recorded transaction | → `User`. |
| `AuditLog` | Append-only audit trail | written by `server/audit.ts` (`logAudit`); never mutated. |

## Notes for agents

- **`completedLevels` is a JSON string** in SQLite — parse/stringify, do not treat
  as a native array.
- **Append-only ledgers:** `XPEvent` and `AuditLog` rows are inserted, never
  updated.
- **Authority writes:** `PlayerProfile.xp`/`wins`/`losses` and
  `LeaderboardEntry` are written ONLY via `awardXp` (`server/xp.ts`). Settlement
  fields on `Prediction` are written ONLY via `applyResolution` (`server/oracle.ts`).
- Switching to Postgres: change the datasource `provider` and `DATABASE_URL`
  (documented in `.env.example`).
