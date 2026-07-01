import { describe, it, expect } from "vitest";
import {
  signSession,
  verifySession,
  readSession,
  readSessionCookie,
  SESSION_COOKIE,
  type SessionClaims,
} from "@/server/session";
import { requireAuth, optionalAuth, signToken } from "@/server/auth";

/**
 * The session cookie is now the bearer of identity for every authenticated
 * route. These pin the cookie transport: parse/verify roundtrips, cookie is the
 * canonical source, and the Bearer header only acts as a fallback.
 */
function reqWith(headers: Record<string, string>): Request {
  return new Request("http://t/api/auth/me", { headers });
}
function cookieHeader(token: string): string {
  return `foo=bar; ${SESSION_COOKIE}=${encodeURIComponent(token)}; baz=qux`;
}

describe("server/session", () => {
  const claims: SessionClaims = { sub: "user_123", wallet: "WALLETabc" };

  describe("signSession / verifySession", () => {
    it("roundtrips claims through a signed session token", () => {
      const token = signSession(claims);
      const decoded = verifySession(token);
      expect(decoded).toEqual(claims);
    });

    it("returns null for a malformed or foreign token", () => {
      expect(verifySession("not-a-jwt")).toBeNull();
      expect(
        verifySession(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiJ4Iiwid2FsbGV0IjoieSJ9.badsig",
        ),
      ).toBeNull();
    });
  });

  describe("readSessionCookie / readSession", () => {
    it("extracts the qw_session value from a multi-cookie header", () => {
      const token = signSession(claims);
      expect(readSessionCookie(reqWith({ cookie: cookieHeader(token) }))).toBe(token);
    });

    it("returns null when the cookie is absent", () => {
      expect(readSessionCookie(reqWith({ cookie: "foo=bar" }))).toBeNull();
      expect(readSessionCookie(reqWith({}))).toBeNull();
    });

    it("verifies the session carried by the cookie", () => {
      const token = signSession(claims);
      expect(readSession(reqWith({ cookie: cookieHeader(token) }))).toEqual(claims);
    });
  });

  describe("requireAuth / optionalAuth transport", () => {
    it("authenticates from the session cookie", () => {
      const token = signToken(claims);
      expect(requireAuth(reqWith({ cookie: cookieHeader(token) }))).toEqual(claims);
    });

    it("falls back to a Bearer header when no cookie is present", () => {
      const token = signToken(claims);
      expect(requireAuth(reqWith({ authorization: `Bearer ${token}` }))).toEqual(claims);
    });

    it("prefers the cookie over the Bearer header", () => {
      const cookieTok = signToken({ sub: "cookie-user", wallet: "C" });
      const bearerTok = signToken({ sub: "bearer-user", wallet: "B" });
      const req = reqWith({
        cookie: cookieHeader(cookieTok),
        authorization: `Bearer ${bearerTok}`,
      });
      expect(requireAuth(req).sub).toBe("cookie-user");
    });

    it("throws 401 when neither cookie nor Bearer is present", () => {
      expect(() => requireAuth(reqWith({}))).toThrowError(/unauthorized/i);
    });

    it("optionalAuth returns null instead of throwing", () => {
      expect(optionalAuth(reqWith({}))).toBeNull();
    });
  });
});
