import { handler, ok, fail } from "@/server/http";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const token = await prisma.launchToken.findUnique({ where: { id } });
    if (!token) return fail("token not found", 404);
    return ok({ token });
  }
);
