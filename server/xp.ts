import { prisma } from "./db";
import { getRank } from "@/lib/game/ranks";
import { getActiveSeason } from "./users";
import { logAudit } from "./audit";

/**
 * Authoritative XP award. This is the ONLY way XP is granted, and it is
 * server-side only — the frontend can never set XP directly.
 *
 * It writes an immutable XPEvent, updates the PlayerProfile (xp/rank/level),
 * and keeps the active-season leaderboard entry in sync.
 */
export async function awardXp(params: {
  userId: string;
  amount: number;
  reason: string;
  refType?: string;
  refId?: string;
  win?: boolean;
}) {
  const { userId, amount, reason, refType, refId, win } = params;
  if (amount === 0 && win === undefined) return;

  await prisma.xPEvent.create({
    data: { userId, amount, reason, refType, refId },
  });

  const profile = await prisma.playerProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const newXp = profile.xp + amount;
  const rank = getRank(newXp);
  const wins = profile.wins + (win === true ? 1 : 0);
  const losses = profile.losses + (win === false ? 1 : 0);

  await prisma.playerProfile.update({
    where: { userId },
    data: { xp: newXp, rankId: rank.id, wins, losses },
  });

  // Sync leaderboard entry for the active season.
  const season = await getActiveSeason();
  await prisma.leaderboardEntry.upsert({
    where: { seasonId_userId: { seasonId: season.id, userId } },
    update: { xp: newXp, wins },
    create: { seasonId: season.id, userId, xp: newXp, wins },
  });

  await logAudit({ actorId: userId, action: "xp.award", target: refId, meta: { amount, reason } });
  return newXp;
}

/**
 * Mark a milestone level complete for a user (idempotent) and award its XP.
 * `levelXp` is provided by the caller from the shared LEVELS source of truth.
 *
 * `win` is an OPTIONAL win/loss flag forwarded to the underlying `awardXp` so a
 * milestone that is ALSO a win (e.g. the Level-3 "win-fast-bet" milestone, granted
 * on a player's FIRST fast-bet win) still increments `profile.wins` and the season
 * leaderboard in the SAME XP event — instead of the win silently not counting.
 * Omit it for non-competitive milestones (connect-wallet, visit-leaderboard, …)
 * which are level completions but not wins.
 */
export async function completeLevelServer(params: {
  userId: string;
  levelId: string;
  levelNumber: number;
  levelXp: number;
  win?: boolean;
}) {
  const { userId, levelId, levelNumber, levelXp, win } = params;
  const profile = await prisma.playerProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const completed: string[] = JSON.parse(profile.completedLevels || "[]");
  if (completed.includes(levelId)) return { alreadyDone: true, xp: profile.xp };

  completed.push(levelId);
  await prisma.playerProfile.update({
    where: { userId },
    data: {
      completedLevels: JSON.stringify(completed),
      level: Math.min(6, Math.max(profile.level, levelNumber + 1)),
    },
  });

  await awardXp({
    userId,
    amount: levelXp,
    reason: `Level cleared: ${levelId}`,
    refType: "level",
    refId: levelId,
    win,
  });

  return { alreadyDone: false };
}
