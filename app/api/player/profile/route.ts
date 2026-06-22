import { NextResponse } from "next/server";
import { handler, fail } from "@/server/http";
import { requireAuth } from "@/server/auth";
import { serializeUserProfile } from "@/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request) => {
  const claims = requireAuth(req);
  const payload = await serializeUserProfile(claims.sub);
  if (!payload) return fail("user not found", 404);
  return NextResponse.json(payload);
});
