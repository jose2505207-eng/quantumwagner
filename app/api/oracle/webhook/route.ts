import { handler, ok, fail } from "@/server/http";
import { z } from "zod";
import { applyResolution, adminResolver, type Outcome } from "@/server/oracle";
import { logAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSchema = z.object({
  marketId: z.string(),
  outcome: z.enum(["YES", "NO"]),
  adminKey: z.string(),
  source: z.string().optional(),
  raw: z.unknown().optional(),
});

/**
 * Oracle callback endpoint. A provider (or controlled admin caller) posts a
 * resolution here. We verify via the admin resolver (key gate), then apply it.
 * No outcome is ever invented server-side.
 */
export const POST = handler(async (req: Request) => {
  const body = webhookSchema.parse(await req.json());
  await logAudit({ action: "oracle.webhook", target: body.marketId, meta: { source: body.source } });

  try {
    const resolver = adminResolver(body.adminKey);
    const proposal = await resolver.propose({
      marketId: body.marketId,
      outcome: body.outcome as Outcome,
      raw: body.raw,
    });
    proposal.source = body.source ? `provider:${body.source}` : "admin";
    const resolution = await applyResolution(proposal);
    return ok({ resolution });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "webhook resolution failed", 400);
  }
});
