import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "./db";
import { env } from "./env";
import { HttpError } from "./http";
import { verifyEd25519 } from "./crypto";

const TOKEN_TTL = "7d";
const NONCE_TTL_MS = 5 * 60 * 1000;

export interface JwtClaims {
  sub: string; // user id
  wallet: string;
}

export function signToken(claims: JwtClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): JwtClaims | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtClaims;
  } catch {
    return null;
  }
}

/** Extract + verify the bearer token from a request. Throws 401 if absent/invalid. */
export function requireAuth(req: Request): JwtClaims {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const claims = token ? verifyToken(token) : null;
  if (!claims) throw new HttpError("Unauthorized", 401);
  return claims;
}

/** Optional auth — returns claims or null, never throws. */
export function optionalAuth(req: Request): JwtClaims | null {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token ? verifyToken(token) : null;
}

/** Validate a base58 Solana address. */
export function isValidWallet(address: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/** Create + persist a single-use login nonce for a wallet. */
export async function createNonce(walletAddress: string): Promise<string> {
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
 * Verify an ed25519 signed message against a wallet. Returns true only if the
 * nonce is valid, unused, unexpired, and the signature checks out. Marks the
 * nonce used on success.
 */
export async function verifySignedMessage(params: {
  walletAddress: string;
  message: string;
  signature: string; // base58
}): Promise<boolean> {
  const { walletAddress, message, signature } = params;

  // The message must contain a known, valid nonce.
  const nonce = message.replace(env.WALLET_AUTH_MESSAGE, "").trim();
  const record = await prisma.authNonce.findUnique({ where: { nonce } });
  if (!record || record.used || record.walletAddress !== walletAddress) return false;
  if (record.expiresAt.getTime() < Date.now()) return false;

  const valid = verifyEd25519(message, signature, walletAddress);

  if (valid) {
    await prisma.authNonce.update({ where: { nonce }, data: { used: true } });
  }
  return valid;
}
