import { describe, it, expect } from "vitest";
import { ok, fail, HttpError } from "@/server/http";

/**
 * Every API route returns through ok()/fail(). The frontend store branches on
 * `success`, so the envelope shape is a contract the whole client depends on.
 */
describe("server/http", () => {
  describe("ok", () => {
    it("wraps data in a success envelope with status 200", async () => {
      const res = ok({ hello: "world" });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ success: true, data: { hello: "world" } });
    });

    it("honours a custom status init", async () => {
      const res = ok({ created: true }, { status: 201 });
      expect(res.status).toBe(201);
    });
  });

  describe("fail", () => {
    it("returns a failure envelope with the default 400 status", async () => {
      const res = fail("bad request");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("bad request");
      expect(body.details).toBeUndefined();
    });

    it("includes details and a custom status when provided", async () => {
      const res = fail("validation failed", 422, { field: ["required"] });
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.details).toEqual({ field: ["required"] });
    });
  });

  describe("HttpError", () => {
    it("carries a message and status", () => {
      const err = new HttpError("nope", 401);
      expect(err.message).toBe("nope");
      expect(err.status).toBe(401);
    });

    it("defaults to status 400", () => {
      expect(new HttpError("oops").status).toBe(400);
    });
  });
});
