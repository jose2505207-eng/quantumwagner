import { HttpError } from "./errors";

/**
 * Minimal in-memory fixed-window rate limiter. Good enough for a single-node
 * dev/demo deployment and to blunt obvious abuse (nonce spam, brute-force).
 *
 * NOTE: in-memory state does not span serverless instances. For multi-instance
 * production, back this with Redis/Upstash (same interface). Gated by
 * RATE_LIMIT_ENABLED so it can be turned off in local dev.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function enabled(): boolean {
  return process.env.RATE_LIMIT_ENABLED === "true";
}

/** Best-effort client key: forwarded IP, else a constant (dev). */
export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}

/**
 * Throw HttpError(429) if the caller exceeded `limit` requests within
 * `windowMs`. No-op when RATE_LIMIT_ENABLED !== "true".
 */
export function rateLimit(
  req: Request,
  scope: string,
  limit = 20,
  windowMs = 60_000
): void {
  if (!enabled()) return;
  const key = clientKey(req, scope);
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > limit) {
    const retry = Math.ceil((b.resetAt - now) / 1000);
    throw new HttpError(`Rate limit exceeded. Retry in ${retry}s`, 429);
  }
}

/** Test-only: clear all buckets. */
export function __resetRateLimit() {
  buckets.clear();
}
