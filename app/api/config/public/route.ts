import { ok } from "@/server/http";
import { env } from "@/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, non-secret config the client may read. */
export async function GET() {
  return ok({
    network: env.SOLANA_NETWORK,
    rpcUrl: env.SOLANA_RPC_URL,
    oracleMode: env.ORACLE_MODE,
    appMode: process.env.NEXT_PUBLIC_APP_MODE || "development",
    features: {
      markets: true,
      fastBets: true,
      battles: true,
      launchpad: true,
      leaderboard: true,
    },
  });
}
