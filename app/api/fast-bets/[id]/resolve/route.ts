import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { settleFastBet } from "@/server/fastbetSettlement";
import { rateLimit } from "@/server/rateLimit";
import { isValidAdminKey } from "@/server/adminKey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  outcome: z.enum(["YES", "NO"]),
  adminKey: z.string(),
});

/**
 * Resolve a fast bet (admin-gated). Settlement is delegated to the shared
 * settleFastBet() so the admin and auto-resolve paths behave identically; the
 * outcome here is supplied by the admin, so the recorded source is "admin".
 */
export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "fastbets-resolve", 20, 60_000);
    requireAuth(req);
    const { id } = await ctx.params;
    const body = schema.parse(await req.json());
    if (!isValidAdminKey(body.adminKey)) return fail("invalid admin key", 403);

    const fastBet = await prisma.fastBet.findUnique({ where: { id } });
    if (!fastBet) return fail("fast bet not found", 404);
    if (fastBet.status === "resolved") return fail("already resolved", 409);

    const result = await settleFastBet({ fastBetId: id, outcome: body.outcome, source: "admin" });
    return ok({ resolved: true, outcome: result.outcome });
  }
);
