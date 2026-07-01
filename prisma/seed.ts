/**
 * Seed script — REAL infrastructure only (no demo/sample data).
 *
 * This intentionally seeds ONLY the platform scaffolding required for the app to
 * function on Devnet: the daily quest catalog and an active leaderboard season.
 * It creates NO fake users, markets, fast-bets, or battles — every market/bet/
 * position the app shows must be real on-chain/backend data. Safe to re-run
 * (idempotent upserts). Run with: `npm run db:seed`.
 */
import { PrismaClient } from "@prisma/client";
import { DAILY_QUESTS } from "../lib/game/quests";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding platform infrastructure (no demo data)…");

  // Daily quest catalog — real progression infra, not demo data.
  for (const q of DAILY_QUESTS) {
    await prisma.quest.upsert({
      where: { id: q.id },
      update: { title: q.title, description: q.description, xp: q.xp, kind: q.kind },
      create: { id: q.id, title: q.title, description: q.description, xp: q.xp, kind: q.kind },
    });
  }

  // Ensure exactly one active leaderboard season exists (empty until real
  // players earn XP — no seeded standings).
  const season = await prisma.leaderboardSeason.findFirst({ where: { active: true } });
  if (!season) {
    await prisma.leaderboardSeason.create({ data: { name: "Season 1" } });
  }

  console.log("Seed complete. Quests + active season only — no demo rows created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
