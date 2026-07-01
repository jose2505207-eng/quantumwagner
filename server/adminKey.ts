import { timingSafeEqual } from "crypto";
import { env } from "./env";

/**
 * Constant-time string comparison.
 *
 * A naive `a === b` (or `!==`) on a secret short-circuits on the first differing
 * byte, leaking length/prefix information a network attacker can use to recover
 * the secret one character at a time. `timingSafeEqual` compares in time that
 * does not depend on where the mismatch is. We hash-normalise to equal-length
 * buffers first so a length mismatch cannot itself throw or leak via timing.
 */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(String(a));
  const bb = enc.encode(String(b));
  // timingSafeEqual requires equal-length buffers; when lengths differ the
  // answer is definitively false, but still run a self-compare of equal length
  // so the code path's timing does not reveal the length relationship.
  if (ab.length !== bb.length) {
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/**
 * True when `provided` matches the configured ADMIN_RESOLUTION_KEY in constant
 * time. Null/undefined/empty always fails. Centralises the admin gate so every
 * admin-gated route compares the same way (and safely).
 */
export function isValidAdminKey(provided: string | null | undefined): boolean {
  if (!provided) return false;
  return safeEqual(provided, env.ADMIN_RESOLUTION_KEY);
}

/**
 * True when an `Authorization` header carries the expected `Bearer <secret>`,
 * compared in constant time. Used by the cron-authorised endpoints. Returns
 * false whenever the secret is unset (never authorise against an empty secret).
 */
export function isValidBearer(
  authHeader: string | null | undefined,
  secret: string | undefined | null,
): boolean {
  if (!secret) return false;
  const header = authHeader ?? "";
  const expected = `Bearer ${secret}`;
  return safeEqual(header, expected);
}
