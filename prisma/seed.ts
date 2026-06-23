/**
 * Seed script — DEMO/SEED data only.
 *
 * Everything created here is flagged `isDemo: true` (where the model supports
 * it) and uses obviously-fake wallet addresses. Run with: `npm run db:seed`.
 * Safe to re-run (idempotent upserts on stable ids).
 */
import { PrismaClient } from "@prisma/client";
import { DAILY_QUESTS } from "../lib/game/quests";
import { LEVELS } from "../lib/game/levels";
import { getRank } from "../lib/game/ranks";

const prisma = new PrismaClient();

const DEMO_WALLETS = [
  "DEMOoracle1111111111111111111111111111111111",
  "DEMOshark22222222222222222222222222222222222",
  "DEMOmage333333333333333333333333333333333333",
  "DEMOrookie4444444444444444444444444444444444",
];

async function main() {
  console.log("Seeding DEMO data…");

  // Quests
  for (const q of DAILY_QUESTS) {
    await prisma.quest.upsert({
      where: { id: q.id },
      update: { title: q.title, description: q.description, xp: q.xp, kind: q.kind },
      create: { id: q.id, title: q.title, description: q.description, xp: q.xp, kind: q.kind },
    });
  }

  // Active season
  let season = await prisma.leaderboardSeason.findFirst({ where: { active: true } });
  if (!season) {
    season = await prisma.leaderboardSeason.create({ data: { name: "Season 1" } });
  }

  // Demo players with varied XP → drives a believable leaderboard.
  const xps = [8200, 4100, 1800, 320];
  const names = ["NeonOracle", "QuantumShark", "MemeMage", "RookieRunner"];
  for (let i = 0; i < DEMO_WALLETS.length; i++) {
    const wallet = DEMO_WALLETS[i];
    const xp = xps[i];
    const rank = getRank(xp);
    const completed = LEVELS.slice(0, Math.min(LEVELS.length, i === 0 ? 6 : 4 - i + 1)).map(
      (l) => l.id
    );
    const user = await prisma.user.upsert({
      where: { walletAddress: wallet },
      update: { username: names[i], isDemo: true },
      create: {
        walletAddress: wallet,
        username: names[i],
        isDemo: true,
        wallets: { create: { address: wallet } },
        streak: { create: { count: (4 - i) * 2 } },
      },
    });
    await prisma.playerProfile.upsert({
      where: { userId: user.id },
      update: { xp, rankId: rank.id, completedLevels: JSON.stringify(completed), wins: 10 - i * 2 },
      create: {
        userId: user.id,
        xp,
        rankId: rank.id,
        completedLevels: JSON.stringify(completed),
        wins: 10 - i * 2,
      },
    });
    await prisma.leaderboardEntry.upsert({
      where: { seasonId_userId: { seasonId: season.id, userId: user.id } },
      update: { xp, wins: 10 - i * 2 },
      create: { seasonId: season.id, userId: user.id, xp, wins: 10 - i * 2 },
    });
  }

  // Demo markets
  const demoMarkets = [
    { question: "Will SOL close above $250 this month? (demo)", category: "CRYPTO", yes: 62000, no: 38000, days: 12 },
    { question: "Will BTC make a new ATH this quarter? (demo)", category: "CRYPTO", yes: 71000, no: 29000, days: 40 },
    { question: "Will the next Fed meeting cut rates? (demo)", category: "MARKET_EVENTS", yes: 55000, no: 45000, days: 6 },
  ];
  for (const m of demoMarkets) {
    const existing = await prisma.market.findFirst({ where: { question: m.question } });
    if (existing) continue;
    await prisma.market.create({
      data: {
        question: m.question,
        category: m.category,
        yesPool: m.yes,
        noPool: m.no,
        endTime: new Date(Date.now() + m.days * 86_400_000),
        isDemo: true,
      },
    });
  }

  // Demo fast bet
  const fbQ = "Will PUMP reach $0.005 in 10 minutes? (demo)";
  if (!(await prisma.fastBet.findFirst({ where: { question: fbQ } }))) {
    await prisma.fastBet.create({
      data: { question: fbQ, symbol: "PUMP", endTime: new Date(Date.now() + 10 * 60_000), isDemo: true },
    });
  }

  // Demo battle
  const bT = "Doge vs Shiba (demo)";
  if (!(await prisma.memeBattle.findFirst({ where: { title: bT } }))) {
    await prisma.memeBattle.create({
      data: { title: bT, sideA: "DOGE", sideB: "SHIB", isDemo: true },
    });
  }

  console.log("Seed complete. All rows are DEMO data (isDemo=true).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
