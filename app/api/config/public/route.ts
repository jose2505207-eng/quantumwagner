import { ok } from "@/server/http";
import { env } from "@/server/env";
import { canPayout, vaultAddress } from "@/server/fastbetVault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, non-secret config the client may read. */
export async function GET() {
  // Fast-bet stakes are plain SOL transfers to this address (never a secret —
  // it is the destination players send to). `payoutsEnabled` reports whether
  // this deployment can also pay winners back out, so the UI can say so plainly
  // instead of taking stakes it cannot settle.
  const fastBetVault = vaultAddress();
  return ok({
    network: env.SOLANA_NETWORK,
    // NEVER echo the server RPC here: SOLANA_RPC_URL/ANCHOR_PROVIDER_URL carry
    // an authenticated provider key, and this endpoint is public — it was
    // handing that key to anyone who asked. Only the browser-side endpoint
    // (already public by construction) may be reported.
    rpcUrl:
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    oracleMode: env.ORACLE_MODE,
    appMode: process.env.NEXT_PUBLIC_APP_MODE || "development",
    fastBets: {
      vault: fastBetVault,
      stakingEnabled: Boolean(fastBetVault),
      payoutsEnabled: canPayout(),
    },
    features: {
      markets: true,
      fastBets: true,
      battles: true,
      launchpad: true,
      leaderboard: true,
    },
  });
}
