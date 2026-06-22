import { handler, ok } from "@/server/http";
import { getActiveSeason } from "@/server/users";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const season = await getActiveSeason();
  const players = await prisma.leaderboardEntry.count({ where: { seasonId: season.id } });
  return ok({
    id: season.id,
    name: season.name,
    startsAt: season.startsAt.toISOString(),
    endsAt: season.endsAt ? season.endsAt.toISOString() : null,
    active: season.active,
    players,
  });
});
