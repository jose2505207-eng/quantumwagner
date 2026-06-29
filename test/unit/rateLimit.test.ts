import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { HttpError } from "@/server/errors";
import {
  rateLimit,
  clientKey,
  limiterStatus,
  __resetRateLimit,
} from "@/server/rateLimit";

/**
 * The limiter is the front door's abuse brake. These tests pin the contract the
 * task hardens around: the in-memory fixed window still throws 429 over limit,
 * the public API is async/awaitable, it is a no-op when disabled, and — critically
 * — it FAILS OPEN when the (optional) Redis backend is unreachable. All without a
 * real network or Redis: `fetch` is mocked for the Redis paths.
 */

function reqFrom(ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/x", {
    headers: { "x-forwarded-for": ip },
  });
}

// Snapshot the env keys we mutate so each test starts from a clean slate.
const ENV_KEYS = [
  "RATE_LIMIT_ENABLED",
  "RATE_LIMIT_REDIS_URL",
  "RATE_LIMIT_REDIS_TOKEN",
] as const;
let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {};
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  for (const k of ENV_KEYS) delete process.env[k];
  __resetRateLimit();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  __resetRateLimit();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("rateLimit — disabled (default)", () => {
  it("is a no-op when RATE_LIMIT_ENABLED !== 'true', even far over any limit", async () => {
    const req = reqFrom();
    for (let i = 0; i < 50; i++) {
      await expect(rateLimit(req, "scope", 1, 60_000)).resolves.toBeUndefined();
    }
    expect(limiterStatus()).toBe("disabled");
  });
});

describe("rateLimit — memory backend", () => {
  beforeEach(() => {
    process.env.RATE_LIMIT_ENABLED = "true";
    __resetRateLimit();
  });

  it("allows up to `limit` then throws HttpError(429)", async () => {
    const req = reqFrom("10.0.0.1");
    await expect(rateLimit(req, "auth", 2, 60_000)).resolves.toBeUndefined(); // 1
    await expect(rateLimit(req, "auth", 2, 60_000)).resolves.toBeUndefined(); // 2
    await expect(rateLimit(req, "auth", 2, 60_000)).rejects.toBeInstanceOf(
      HttpError,
    ); // 3 -> over
  });

  it("the thrown error carries status 429 and a retry hint", async () => {
    const req = reqFrom("10.0.0.2");
    await rateLimit(req, "auth", 1, 60_000);
    try {
      await rateLimit(req, "auth", 1, 60_000);
      throw new Error("expected a 429 to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).status).toBe(429);
      expect((err as HttpError).message).toMatch(/Retry in \d+s/);
    }
  });

  it("isolates counters per client key (scope + ip)", async () => {
    await rateLimit(reqFrom("1.1.1.1"), "auth", 1, 60_000);
    await rateLimit(reqFrom("2.2.2.2"), "auth", 1, 60_000);
    // Different IPs each used their single allowance — neither has thrown yet,
    // but a second hit on the SAME key now exceeds.
    await expect(
      rateLimit(reqFrom("1.1.1.1"), "auth", 1, 60_000),
    ).rejects.toBeInstanceOf(HttpError);
  });

  it("resets the window after windowMs so a later request is allowed again", async () => {
    vi.useFakeTimers();
    try {
      const req = reqFrom("10.0.0.3");
      await rateLimit(req, "auth", 1, 1_000);
      await expect(rateLimit(req, "auth", 1, 1_000)).rejects.toBeInstanceOf(
        HttpError,
      );
      vi.advanceTimersByTime(1_001);
      await expect(rateLimit(req, "auth", 1, 1_000)).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("rateLimit returns a Promise (async API the call sites await)", () => {
    const p = rateLimit(reqFrom(), "auth", 5, 60_000);
    expect(p).toBeInstanceOf(Promise);
    return p;
  });

  it("reports the 'memory' backend", () => {
    expect(limiterStatus()).toBe("memory");
  });
});

describe("rateLimit — redis backend (mocked fetch)", () => {
  beforeEach(() => {
    process.env.RATE_LIMIT_ENABLED = "true";
    process.env.RATE_LIMIT_REDIS_URL = "https://redis.example";
    process.env.RATE_LIMIT_REDIS_TOKEN = "tok";
    __resetRateLimit();
  });

  it("reports the 'redis' backend when both url + token are set", () => {
    expect(limiterStatus()).toBe("redis");
  });

  it("FAILS OPEN (allows) when the Redis backend rejects", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    // Even with limit 0, a dead backend must NOT throw — it fails open.
    await expect(
      rateLimit(reqFrom(), "auth", 0, 60_000),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("FAILS OPEN when the Redis backend returns a non-200", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 }) as unknown as Response),
    );
    await expect(
      rateLimit(reqFrom(), "auth", 1, 60_000),
    ).resolves.toBeUndefined();
  });

  it("throws 429 when the Redis counter exceeds the limit", async () => {
    // Pipeline [INCR, PTTL] -> count 3 (over limit 2), ttl 30_000ms remaining.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => [{ result: 3 }, { result: 30_000 }],
      }) as unknown as Response),
    );
    await expect(
      rateLimit(reqFrom(), "auth", 2, 60_000),
    ).rejects.toBeInstanceOf(HttpError);
  });

  it("allows and arms the window on the first hit (count === 1)", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(url);
        if (url.endsWith("/pipeline")) {
          return {
            ok: true,
            status: 200,
            json: async () => [{ result: 1 }, { result: -1 }],
          } as unknown as Response;
        }
        // The follow-up PEXPIRE single command.
        return {
          ok: true,
          status: 200,
          json: async () => ({ result: 1 }),
        } as unknown as Response;
      }),
    );
    await expect(
      rateLimit(reqFrom(), "auth", 5, 60_000),
    ).resolves.toBeUndefined();
    // One pipeline call (INCR+PTTL) and one PEXPIRE to arm the new window.
    expect(calls.some((u) => u.endsWith("/pipeline"))).toBe(true);
    expect(calls.length).toBe(2);
  });
});

describe("clientKey", () => {
  it("derives scope:ip from x-forwarded-for (first hop)", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
    });
    expect(clientKey(req, "auth")).toBe("auth:9.9.9.9");
  });

  it("falls back to 'local' when no IP header is present", () => {
    expect(clientKey(new Request("http://x"), "auth")).toBe("auth:local");
  });
});
