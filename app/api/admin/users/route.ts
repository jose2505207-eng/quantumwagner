import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { isValidAdminKey } from "@/server/adminKey";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/users — list users for the admin dashboard.
// Session-authenticated AND admin-key-gated (x-admin-key header), matching the
// oracle/resolve admin pattern. Display-only: the schema has no role column, so
// there is no role management here.
export const GET = handler(async (req: Request) => {
  await rateLimit(req, "admin-users", 30, 60_000);
  requireAuth(req);
  if (!isValidAdminKey(req.headers.get("x-admin-key"))) {
    return fail("invalid admin key", 403);
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { profile: true, _count: { select: { predictions: true } } },
  });

  return ok({
    users: users.map((u) => ({
      id: u.id,
      wallet_address: u.walletAddress,
      username: u.username,
      created_at: u.createdAt.toISOString(),
      xp: u.profile?.xp ?? 0,
      level: u.profile?.level ?? 1,
      predictions: u._count.predictions,
    })),
  });
});
