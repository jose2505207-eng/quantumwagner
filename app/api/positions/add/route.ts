import { handler, ok, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { z } from "zod";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { recordPrediction } from "@/server/predictions";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Body shape posted by the markets bet UI (app/markets/[id]/page.tsx).
// `amount_staked` is in LAMPORTS here (the UI works in lamports for the chain
// call); it is converted to SOL exactly once, below, before anything is stored.
const schema = z.object({
  market_id: z.string(),
  position_type: z.enum(["YES", "NO"]),
  amount_staked: z.coerce.number().positive(),
  stake_tx_hash: z.string().optional(), // real Devnet signature from placeBet()
});

/**
 * Record a prediction from a REAL on-chain stake. Shares one implementation
 * with /api/markets/[id]/predictions — including signature de-duplication, so
 * a client that posts the same bet to both endpoints stores it once.
 */
export const POST = handler(async (req: Request) => {
  await rateLimit(req, "positions-add", 30, 60_000);
  const claims = requireAuth(req);
  const body = schema.parse(await req.json());

  const result = await recordPrediction({
    marketRef: body.market_id,
    userId: claims.sub,
    wallet: claims.wallet,
    side: body.position_type,
    amountSol: body.amount_staked / LAMPORTS_PER_SOL,
    txSignature: body.stake_tx_hash,
  });

  if (!result.ok) return fail(result.error, result.status);

  return ok(
    {
      prediction: result.prediction,
      firstPrediction: result.firstPrediction,
      deduped: result.deduped,
      onchain: result.onchain,
    },
    { status: result.deduped ? 200 : 201 }
  );
});
