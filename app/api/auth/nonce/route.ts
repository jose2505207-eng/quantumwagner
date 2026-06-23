import { NextResponse } from "next/server";
import { handler, fail } from "@/server/http";
import { createNonce, isValidWallet, buildAuthMessage } from "@/server/auth";
import { nonceSchema } from "@/server/validators";
import { rateLimit } from "@/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (req: Request) => {
  rateLimit(req, "auth-nonce", 30, 60_000);
  const body = nonceSchema.parse(await req.json());
  if (!isValidWallet(body.wallet_address)) return fail("invalid wallet address", 400);
  const nonce = await createNonce(body.wallet_address);
  // `nonce` + `message` returned so the client signs the exact bytes.
  return NextResponse.json({ nonce, message: buildAuthMessage(nonce) });
});
