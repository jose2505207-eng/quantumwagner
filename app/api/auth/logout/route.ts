import { NextResponse } from "next/server";
import { handler } from "@/server/http";
import { clearSessionCookie } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Clear the session cookie. Safe to call unauthenticated (idempotent). */
export const POST = handler(async () => {
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
});
