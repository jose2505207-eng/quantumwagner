-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT,
    "walletAddress" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL DEFAULT 'solana',
    "network" TEXT NOT NULL DEFAULT 'devnet',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuthNonce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "rankId" TEXT NOT NULL DEFAULT 'unranked',
    "level" INTEGER NOT NULL DEFAULT 1,
    "completedLevels" TEXT NOT NULL DEFAULT '[]',
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XPEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XPEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'claim',
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastCheckIn" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'CRYPTO',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "outcome" TEXT,
    "yesPool" REAL NOT NULL DEFAULT 0,
    "noPool" REAL NOT NULL DEFAULT 0,
    "endTime" DATETIME NOT NULL,
    "pda" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT,
    CONSTRAINT "Market_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "won" BOOLEAN,
    "payout" REAL NOT NULL DEFAULT 0,
    "txSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" DATETIME,
    CONSTRAINT "Prediction_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FastBet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "symbol" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'live',
    "outcome" TEXT,
    "pool" REAL NOT NULL DEFAULT 0,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FastBetEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fastBetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "won" BOOLEAN,
    "payout" REAL NOT NULL DEFAULT 0,
    "txSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FastBetEntry_fastBetId_fkey" FOREIGN KEY ("fastBetId") REFERENCES "FastBet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FastBetEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemeBattle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sideA" TEXT NOT NULL DEFAULT 'Side A',
    "sideB" TEXT NOT NULL DEFAULT 'Side B',
    "winner" TEXT,
    "pda" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MemeBattleEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "txSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemeBattleEntry_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "MemeBattle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MemeBattleEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MemeBattleVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemeBattleVote_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "MemeBattle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MemeBattleVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LaunchToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUri" TEXT NOT NULL DEFAULT '',
    "mint" TEXT,
    "totalSupply" TEXT NOT NULL DEFAULT '0',
    "creatorId" TEXT NOT NULL,
    "txSignature" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LaunchToken_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaderboardSeason" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaderboardEntry_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "LeaderboardSeason" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OracleResolution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "outcome" TEXT,
    "confidence" REAL NOT NULL DEFAULT 0,
    "raw" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "OracleResolution_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "signature" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recorded',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "AuthNonce_nonce_key" ON "AuthNonce"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE INDEX "XPEvent_userId_idx" ON "XPEvent"("userId");

-- CreateIndex
CREATE INDEX "UserQuest_userId_day_idx" ON "UserQuest"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_userId_questId_day_key" ON "UserQuest"("userId", "questId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");

-- CreateIndex
CREATE INDEX "Market_status_idx" ON "Market"("status");

-- CreateIndex
CREATE INDEX "Prediction_userId_idx" ON "Prediction"("userId");

-- CreateIndex
CREATE INDEX "Prediction_marketId_idx" ON "Prediction"("marketId");

-- CreateIndex
CREATE INDEX "FastBetEntry_userId_idx" ON "FastBetEntry"("userId");

-- CreateIndex
CREATE INDEX "MemeBattleEntry_userId_idx" ON "MemeBattleEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemeBattleVote_battleId_userId_key" ON "MemeBattleVote"("battleId", "userId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_seasonId_idx" ON "LeaderboardEntry"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_seasonId_userId_key" ON "LeaderboardEntry"("seasonId", "userId");

-- CreateIndex
CREATE INDEX "OracleResolution_marketId_idx" ON "OracleResolution"("marketId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
