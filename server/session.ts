/**
 * Stateless session layer.
 *
 * The signed identity (`{ sub, wallet }`) is carried inside a JWT which lives in
 * an HttpOnly, SameSite=Lax cookie (`qw_session`) — NOT in localStorage, so it
 * cannot be exfiltrated by XSS. There is no server-side session table: the JWT
 * is self-contained, so nothing here touches the database or the Prisma schema.
 */
import jwt from "jsonwebtoken";
import type { NextResponse } from "next/server";
import { env } from "./env";

/** Name of the HttpOnly session cookie. */
export const SESSION_COOKIE = "qw_session";

/** Session lifetime (seconds). Short-ish; clients re-auth on expiry. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SessionClaims {
  sub: string; // user id
  wallet: string; // wallet address (base58)
}

/** Sign a session JWT from the given claims. */
export function signSession(claims: SessionClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });
}

/** Verify a session JWT. Returns typed claims, or null if invalid/expired. */
export function verifySession(token: string): SessionClaims | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    if (typeof decoded.sub === "string" && typeof decoded.wallet === "string") {
      return { sub: decoded.sub, wallet: decoded.wallet };
    }
    return null;
  } catch {
    return null;
  }
}

/** Read the raw `qw_session` cookie value out of a request's Cookie header. */
export function readSessionCookie(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

/** Verify the session carried by the request's cookie. */
export function readSession(req: Request): SessionClaims | null {
  const token = readSessionCookie(req);
  return token ? verifySession(token) : null;
}

// `Secure` is gated on production so devnet dev over plain http://localhost still
// works (a Secure cookie would be dropped by the browser on http).
function secureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Attach a fresh session cookie (HttpOnly, SameSite=Lax) to a response. */
export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Expire the session cookie (logout / wallet disconnect). */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
