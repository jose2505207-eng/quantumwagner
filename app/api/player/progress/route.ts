import { handler } from "@/server/http";
import { ok } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const [profile, streak] = await Promise.all([
    prisma.playerProfile.upsert({
      where: { userId: claims.sub },
      update: {},
      create: { userId: claims.sub },
    }),
    prisma.streak.upsert({
      where: { userId: claims.sub },
      update: {},
      create: { userId: claims.sub },
    }),
  ]);

  return ok({
    xp: profile.xp,
    rankId: profile.rankId,
    level: profile.level,
    completedLevels: JSON.parse(profile.completedLevels || "[]"),
    wins: profile.wins,
    losses: profile.losses,
    streak: streak.count,
    lastCheckIn: streak.lastCheckIn,
  });
});
