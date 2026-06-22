// Legacy alias for /api/auth/me (the existing frontend calls /auth/profile).
import { GET as me } from "../me/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = me;
