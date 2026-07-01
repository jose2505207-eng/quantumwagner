/**
 * Wallet authentication core.
 *
 * Identity transport is the HttpOnly `qw_session` cookie (see server/session.ts).
 * `requireAuth` / `optionalAuth` read the session from that cookie; a
 * `Authorization: Bearer <jwt>` header is still honoured as a fallback for
 * API / server-to-server clients (and tests), but the cookie always wins.
 *
 * Login is a single-use, expiring ed25519 challenge: the client asks for a
 * nonce, signs the exact server-provided message, and posts it back. The nonce
 * table is kept tidy (expired/used nonces are pruned opportunistically, and a
 * consumed nonce is deleted immediately so it can never be replayed).
 */
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "./db";
import { env } from "./env";
import { HttpError } from "./http";
import { verifyEd25519 } from "./crypto";
import {
  readSession,
  signSession,
  verifySession,
  type SessionClaims,
} from "./session";

const NONCE_TTL_MS = 5 * 60 * 1000;

// Backward-compatible aliases. Older code (and tests) import these names; the
// implementation now lives in server/session.ts.
export type JwtClaims = SessionClaims;
export const signToken = signSession;
export const verifyToken = verifySession;

/** Extract + verify a Bearer JWT from the Authorization header (fallback only). */
function bearerClaims(req: Request): JwtClaims | null {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token ? verifyToken(token) : null;
}

/**
 * Resolve the caller's session. Canonical transport is the HttpOnly cookie; the
 * Bearer header is a fallback for non-browser clients. Cookie takes priority.
 */
export function getSession(req: Request): JwtClaims | null {
  return readSession(req) ?? bearerClaims(req);
}

/** Require an authenticated session. Throws 401 if absent/invalid. */
export function requireAuth(req: Request): JwtClaims {
  const claims = getSession(req);
  if (!claims) throw new HttpError("Unauthorized", 401);
  return claims;
}

/** Optional auth — returns claims or null, never throws. */
export function optionalAuth(req: Request): JwtClaims | null {
  return getSession(req);
}

/** Validate a base58 Solana address. */
export function isValidWallet(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create + persist a single-use login nonce for a wallet. Opportunistically
 * prunes expired and already-used nonces so the table never grows unbounded.
 */
export async function createNonce(walletAddress: string): Promise<string> {
  await prisma.authNonce.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { used: true }] },
  });

  const nonce = bs58.encode(nacl.randomBytes(16));
  await prisma.authNonce.create({
    data: {
      walletAddress,
      nonce,
      expiresAt: new Date(Date.now() + NONCE_TTL_MS),
    },
  });
  return nonce;
}

/** The exact message the wallet is asked to sign. */
export function buildAuthMessage(nonce: string): string {
  return `${env.WALLET_AUTH_MESSAGE}${nonce}`;
}

/**
 * Verify an ed25519 signed login message against a wallet. Returns true only if
 * the message is the canonical challenge for a valid, unused, unexpired nonce
 * that belongs to this wallet AND the signature checks out. On success the nonce
 * is deleted immediately (hard single-use, replay-proof).
 */
export async function verifySignedMessage(params: {
  walletAddress: string;
  message: string;
  signature: string; // base58
}): Promise<boolean> {
  const { walletAddress, message, signature } = params;

  // The message must be exactly `${WALLET_AUTH_MESSAGE}${nonce}` — reject any
  // other shape so a signature over arbitrary text can't smuggle in a nonce.
  const prefix = env.WALLET_AUTH_MESSAGE;
  if (!message.startsWith(prefix)) return false;
  const nonce = message.slice(prefix.length).trim();
  if (!nonce) return false;

  const record = await prisma.authNonce.findUnique({ where: { nonce } });
  if (!record || record.used || record.walletAddress !== walletAddress) return false;
  if (record.expiresAt.getTime() < Date.now()) return false;
  if (message !== buildAuthMessage(record.nonce)) return false;

  const valid = verifyEd25519(message, signature, walletAddress);
  if (valid) {
    // Consume the nonce so it can never be reused, even within its TTL.
    await prisma.authNonce.delete({ where: { nonce } });
  }
  return valid;
}
