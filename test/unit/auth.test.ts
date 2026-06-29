import { describe, it, expect } from "vitest";
import { signToken, verifyToken, buildAuthMessage, type JwtClaims } from "@/server/auth";

/**
 * JWTs are the bearer of identity for every authenticated route. If the
 * sign/verify roundtrip or the signed-message format drifts, auth silently
 * breaks (or worse, accepts forged tokens). These pin the contract.
 */
describe("server/auth", () => {
  const claims: JwtClaims = { sub: "user_123", wallet: "WALLETabc" };

  describe("signToken / verifyToken", () => {
    it("roundtrips claims through a signed token", () => {
      const token = signToken(claims);
      expect(typeof token).toBe("string");
      const decoded = verifyToken(token);
      expect(decoded?.sub).toBe("user_123");
      expect(decoded?.wallet).toBe("WALLETabc");
    });

    it("returns null for a malformed token", () => {
      expect(verifyToken("not-a-jwt")).toBeNull();
    });

    it("returns null for a token signed with a different secret", () => {
      // A token whose signature won't verify against env.JWT_SECRET.
      const forged =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        "eyJzdWIiOiJ4Iiwid2FsbGV0IjoieSJ9." +
        "invalidsignaturevalue";
      expect(verifyToken(forged)).toBeNull();
    });
  });

  describe("buildAuthMessage", () => {
    it("prefixes the nonce with the wallet auth message", () => {
      // WALLET_AUTH_MESSAGE is set to the canonical prefix in test/setup.ts.
      expect(buildAuthMessage("NONCE42")).toBe("Sign this message to login to Quantum: NONCE42");
    });
  });
});
