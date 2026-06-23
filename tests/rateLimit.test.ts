import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rateLimit, __resetRateLimit } from "@/server/rateLimit";
import { HttpError } from "@/server/errors";

function reqFrom(ip: string): Request {
  return new Request("http://localhost/api/x", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimit();
    process.env.RATE_LIMIT_ENABLED = "true";
  });
  afterEach(() => {
    delete process.env.RATE_LIMIT_ENABLED;
  });

  it("allows up to the limit then throws 429", () => {
    const req = reqFrom("1.2.3.4");
    for (let i = 0; i < 3; i++) rateLimit(req, "test", 3, 60_000);
    let threw: unknown;
    try {
      rateLimit(req, "test", 3, 60_000);
    } catch (e) {
      threw = e;
    }
    expect(threw).toBeInstanceOf(HttpError);
    expect((threw as HttpError).status).toBe(429);
  });

  it("isolates buckets per IP", () => {
    rateLimit(reqFrom("a"), "test", 1, 60_000);
    // different IP is unaffected
    expect(() => rateLimit(reqFrom("b"), "test", 1, 60_000)).not.toThrow();
  });

  it("is a no-op when disabled", () => {
    delete process.env.RATE_LIMIT_ENABLED;
    const req = reqFrom("9.9.9.9");
    for (let i = 0; i < 100; i++) rateLimit(req, "test", 1, 60_000);
    // never throws
    expect(true).toBe(true);
  });
});
