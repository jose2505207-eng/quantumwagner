import { handler, ok, fail } from "@/server/http";
import { env } from "@/server/env";
import { runAutoResolve } from "@/server/fastbetAutoResolve";
import { rateLimit } from "@/server/rateLimit";
import { isValidAdminKey, isValidBearer } from "@/server/adminKey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Authorize a scheduled (cron) invocation. Vercel Cron (GET) and the GitHub
 * Actions fallback (POST) both send `Authorization: Bearer <CRON_SECRET>`. When
 * CRON_SECRET is unset we never authorize a cron request.
 */
function authorizeCron(req: Request): boolean {
  return isValidBearer(req.headers.get("authorization"), env.CRON_SECRET);
}

/**
 * Read an admin key from header `x-admin-key` or a JSON body `adminKey`.
 * Tolerates an empty/non-JSON body (returns null).
 */
async function readAdminKey(req: Request): Promise<string | null> {
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey) return headerKey;
  try {
    const body = (await req.json()) as { adminKey?: unknown };
    return typeof body?.adminKey === "string" ? body.adminKey : null;
  } catch {
    return null;
  }
}

/** Vercel Cron path (GET): authorized via CRON_SECRET only. */
export const GET = handler(async (req: Request) => {
  await rateLimit(req, "fastbets-autoresolve", 30, 60_000);
  if (!authorizeCron(req)) return fail("unauthorized", 403);
  const result = await runAutoResolve();
  return ok(result);
});

/** GitHub Actions / admin path (POST): cron Bearer OR admin key. */
export const POST = handler(async (req: Request) => {
  await rateLimit(req, "fastbets-autoresolve", 30, 60_000);
  let authorized = authorizeCron(req);
  if (!authorized) {
    const adminKey = await readAdminKey(req);
    authorized = isValidAdminKey(adminKey);
  }
  if (!authorized) return fail("unauthorized", 403);
  const result = await runAutoResolve();
  return ok(result);
});
