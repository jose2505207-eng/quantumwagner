import { handler, ok, fail } from "@/server/http";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET a single oracle resolution by id (traceable resolution record).
export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const resolution = await prisma.oracleResolution.findUnique({ where: { id } });
    if (!resolution) return fail("resolution not found", 404);
    return ok({ resolution });
  }
);
