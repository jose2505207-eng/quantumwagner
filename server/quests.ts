import { prisma } from "./db";
import { DAILY_QUESTS, todayKey } from "@/lib/game/quests";

/** Ensure the canonical quest rows exist (idempotent upsert from shared defs). */
export async function ensureQuests() {
  for (const q of DAILY_QUESTS) {
    await prisma.quest.upsert({
      where: { id: q.id },
      update: { title: q.title, description: q.description, xp: q.xp, kind: q.kind },
      create: { id: q.id, title: q.title, description: q.description, xp: q.xp, kind: q.kind },
    });
  }
}

export { todayKey };
