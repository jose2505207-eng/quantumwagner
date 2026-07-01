import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { prisma } from "@/server/db";
import { enterFastBetSchema } from "@/server/validators";
import { awardXp } from "@/server/xp";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    await rateLimit(req, "fastbets-enter", 30, 60_000);
    const claims = requireAuth(req);
    const { id } = await ctx.params;
    const body = enterFastBetSchema.parse(await req.json());

    const fastBet = await prisma.fastBet.findUnique({ where: { id } });
    if (!fastBet) return fail("fast bet not found", 404);
    if (fastBet.status === "resolved") return fail("fast bet already resolved", 409);

    const entry = await prisma.fastBetEntry.create({
      data: {
        fastBetId: id,
        userId: claims.sub,
        side: body.side,
        amount: body.amount,
        txSignature: body.txSignature,
      },
    });
    await prisma.fastBet.update({
      where: { id },
      data: { pool: fastBet.pool + body.amount },
    });
    await prisma.transaction.create({
      data: {
        userId: claims.sub,
        kind: "fastbet",
        amount: body.amount,
        signature: body.txSignature,
        refType: "fastbet",
        refId: entry.id,
      },
    });
    await awardXp({
      userId: claims.sub,
      amount: 15,
      reason: "Entered a fast bet",
      refType: "fastbet",
      refId: entry.id,
    });
    await logAudit({ actorId: claims.sub, action: "fastbet.enter", target: entry.id });
    return ok({ entry }, { status: 201 });
  }
);
