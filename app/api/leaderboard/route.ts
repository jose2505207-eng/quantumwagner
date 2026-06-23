import { handler, ok } from "@/server/http";
import { optionalAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getActiveSeason } from "@/server/users";
import { getRank } from "@/lib/game/ranks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Leaderboard for the active season, computed from real persisted XP/wins. */
export const GET = handler(async (req: Request) => {
  const claims = optionalAuth(req);
  const season = await getActiveSeason();

  const entries = await prisma.leaderboardEntry.findMany({
    where: { seasonId: season.id },
    orderBy: [{ xp: "desc" }, { wins: "desc" }],
    take: 100,
    include: { user: true },
  });

  const rows = entries.map((e, i) => ({
    rank: i + 1,
    userId: e.userId,
    wallet: e.user.walletAddress,
    username: e.user.username,
    xp: e.xp,
    wins: e.wins,
    rankTier: getRank(e.xp).id,
    isYou: claims?.sub === e.userId,
  }));

  const you = rows.find((r) => r.isYou) ?? null;
  return ok({ season: { id: season.id, name: season.name }, entries: rows, you });
});
