import { NextResponse } from "next/server";
import { handler, fail } from "@/server/http";
import { verifySignedMessage, signToken, isValidWallet } from "@/server/auth";
import { setSessionCookie } from "@/server/session";
import { getOrCreateUserByWallet } from "@/server/users";
import { verifyWalletSchema } from "@/server/validators";
import { completeLevelServer } from "@/server/xp";
import { LEVEL_BY_ID } from "@/lib/game/levels";
import { logAudit } from "@/server/audit";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verify a signed login message → issue a session, create/load the user, and
 * complete Level 1 (connect-wallet) server-side. The JWT is set as an HttpOnly
 * `qw_session` cookie (never returned in the body, so XSS can't read it); the
 * response body keeps the `success` + `user` shape the frontend expects.
 */
export const POST = handler(async (req: Request) => {
  await rateLimit(req, "auth-verify", 20, 60_000);
  const body = verifyWalletSchema.parse(await req.json());
  if (!isValidWallet(body.wallet_address)) return fail("invalid wallet address", 400);

  const valid = await verifySignedMessage({
    walletAddress: body.wallet_address,
    message: body.message,
    signature: body.signature,
  });
  if (!valid) return fail("signature verification failed", 401);

  const user = await getOrCreateUserByWallet(body.wallet_address);

  // Level 1 milestone is earned by a verified connection — real signal.
  const lvl1 = LEVEL_BY_ID["connect-wallet"];
  await completeLevelServer({
    userId: user.id,
    levelId: lvl1.id,
    levelNumber: lvl1.level,
    levelXp: lvl1.xp,
  });

  await logAudit({ actorId: user.id, action: "auth.verify", target: user.id });

  const token = signToken({ sub: user.id, wallet: user.walletAddress });
  const res = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      wallet_address: user.walletAddress,
      username: user.username,
    },
  });
  setSessionCookie(res, token);
  return res;
});
