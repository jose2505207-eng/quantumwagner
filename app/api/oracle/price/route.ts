import { handler, ok, fail } from "@/server/http";
import { env } from "@/server/env";
import { getPriceFeedProvider } from "@/server/oracleProviders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ops/debug probe: GET /api/oracle/price?symbol=SOL/USD
 *
 * Returns the LIVE price + confidence + source for a symbol so operators can
 * confirm the oracle is wired and reachable WITHOUT placing a bet or resolving a
 * market. Admin-gated by ADMIN_RESOLUTION_KEY (no JWT — this is a bare ops probe,
 * the admin key is the gate). The key is accepted via the `x-admin-key` header
 * OR an `?adminKey=` query param.
 *
 * Honesty doctrine: this NEVER fabricates a price. If the provider throws
 * (unconfigured / unmapped symbol / Hermes non-200 / empty parsed), we surface
 * that loud failure as a 502 with the real error message — never a fake price.
 */
export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);

  const adminKey = req.headers.get("x-admin-key") ?? url.searchParams.get("adminKey");
  if (adminKey !== env.ADMIN_RESOLUTION_KEY) return fail("invalid admin key", 403);

  const symbol = url.searchParams.get("symbol") ?? "SOL/USD";

  const provider = getPriceFeedProvider();
  try {
    const { price, confidence, publishTime } = await provider.getPrice(symbol);
    return ok({ symbol, price, confidence, publishTime, source: provider.name });
  } catch (err) {
    // Loud, honest failure — the unconfigured/unmapped/upstream error verbatim.
    return fail(err instanceof Error ? err.message : "price lookup failed", 502);
  }
});
