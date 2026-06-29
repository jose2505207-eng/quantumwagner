import { HttpError } from "./errors";

/**
 * Fixed-window rate limiter with a pluggable storage backend.
 *
 * The window-counting policy lives in the public `rateLimit()` below; WHERE the
 * counter is stored lives behind the small `RateLimitStore` interface so the
 * same limiter works on a single node (MemoryStore, the default) or across many
 * serverless instances (RedisStore, opt-in via env).
 *
 * Gating (zero behavior change unless the new env is set):
 *   - RATE_LIMIT_ENABLED !== "true"            -> total no-op (as before).
 *   - RATE_LIMIT_ENABLED === "true", no Redis  -> in-memory fixed window (as before).
 *   - RATE_LIMIT_REDIS_URL (+ _TOKEN) present  -> Upstash Redis REST backend.
 *
 * Redis access uses the Upstash REST API via plain `fetch` — no npm dependency.
 * If the Redis backend is unreachable the limiter FAILS OPEN (logs + allows):
 * a down limiter must never hard-fail a request.
 */

/** One window's outcome: the post-increment count and when the window resets. */
interface HitResult {
  count: number;
  /** Epoch ms at which the current window expires. */
  resetAt: number;
}

/** Storage backend for the fixed-window counter. */
interface RateLimitStore {
  /** Increment `key`'s counter for the active window and report the new state. */
  hit(key: string, limit: number, windowMs: number): Promise<HitResult>;
  /** Test-only: drop all state. */
  reset(): void;
}

/* -------------------------------------------------------------------------- */
/* MemoryStore — the EXISTING in-memory fixed-window logic, unchanged.          */
/* -------------------------------------------------------------------------- */

interface Bucket {
  count: number;
  resetAt: number;
}

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>();

  async hit(key: string, _limit: number, windowMs: number): Promise<HitResult> {
    const now = Date.now();
    const b = this.buckets.get(key);
    if (!b || b.resetAt < now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, fresh);
      return fresh;
    }
    b.count += 1;
    return { count: b.count, resetAt: b.resetAt };
  }

  reset(): void {
    this.buckets.clear();
  }
}

/* -------------------------------------------------------------------------- */
/* RedisStore — Upstash Redis REST, INCR + PEXPIRE fixed window (no npm dep).    */
/* -------------------------------------------------------------------------- */

class RedisStore implements RateLimitStore {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  /** Single Upstash REST command: POST [cmd, ...args] -> { result }. */
  private async command(args: (string | number)[]): Promise<unknown> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) throw new Error(`Upstash REST ${res.status}`);
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result;
  }

  /** Upstash REST pipeline: POST [[cmd...],[cmd...]] -> [{result},{result}]. */
  private async pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    const res = await fetch(`${this.baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) throw new Error(`Upstash REST ${res.status}`);
    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    return data.map((entry) => {
      if (entry.error) throw new Error(entry.error);
      return entry.result;
    });
  }

  async hit(key: string, _limit: number, windowMs: number): Promise<HitResult> {
    const k = `rl:${key}`;
    // INCR establishes/advances the counter; PTTL gives us the reset instant.
    const [rawCount, rawTtl] = await this.pipeline([
      ["INCR", k],
      ["PTTL", k],
    ]);
    const count = Number(rawCount);
    let ttlMs = Number(rawTtl);
    // First hit of a window (count === 1) or a key without an expiry (ttl < 0):
    // (re)arm the window so it auto-expires and the next window starts fresh.
    if (count === 1 || !Number.isFinite(ttlMs) || ttlMs < 0) {
      await this.command(["PEXPIRE", k, windowMs]);
      ttlMs = windowMs;
    }
    return { count, resetAt: Date.now() + ttlMs };
  }

  reset(): void {
    // No-op: distributed state is not cleared from a single test process.
  }
}

/* -------------------------------------------------------------------------- */
/* Store selection + public API                                                 */
/* -------------------------------------------------------------------------- */

let storeInstance: RateLimitStore | null = null;

function enabled(): boolean {
  return process.env.RATE_LIMIT_ENABLED === "true";
}

/** Which backend is active, given current env. Memoized across calls. */
function getStore(): RateLimitStore {
  if (storeInstance) return storeInstance;
  const url = process.env.RATE_LIMIT_REDIS_URL;
  const token = process.env.RATE_LIMIT_REDIS_TOKEN;
  storeInstance = url && token ? new RedisStore(url, token) : new MemoryStore();
  return storeInstance;
}

/**
 * Backend label for health/observability: "disabled" when the limiter is off,
 * else "redis" or "memory". Reads env only — no I/O, safe to call anywhere.
 */
export function limiterStatus(): "disabled" | "redis" | "memory" {
  if (!enabled()) return "disabled";
  return process.env.RATE_LIMIT_REDIS_URL && process.env.RATE_LIMIT_REDIS_TOKEN
    ? "redis"
    : "memory";
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
 *
 * Async because the Redis backend is async; the memory backend resolves
 * synchronously. Fails OPEN: if the backend errors, the request is allowed.
 */
export async function rateLimit(
  req: Request,
  scope: string,
  limit = 20,
  windowMs = 60_000,
): Promise<void> {
  if (!enabled()) return;
  const key = clientKey(req, scope);

  let result: HitResult;
  try {
    result = await getStore().hit(key, limit, windowMs);
  } catch (err) {
    // Fail open: a down limiter backend must never hard-fail a request.
    console.warn("rateLimit backend unavailable, allowing request:", err);
    return;
  }

  if (result.count > limit) {
    const retry = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new HttpError(`Rate limit exceeded. Retry in ${retry}s`, 429);
  }
}

/** Test-only: clear all buckets and re-evaluate the backend on next call. */
export function __resetRateLimit() {
  storeInstance?.reset();
  storeInstance = null;
}
