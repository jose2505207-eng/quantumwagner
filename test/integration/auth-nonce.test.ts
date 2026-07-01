import { describe, it, expect, beforeEach, afterAll } from "vitest";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { prisma } from "@/server/db";
import { createNonce, buildAuthMessage, verifySignedMessage } from "@/server/auth";

/**
 * Nonce lifecycle (integration, real db). Login nonces are single-use and
 * expiring; a consumed nonce must be deleted so it can't be replayed, and
 * expired/used nonces must be pruned so the table never grows unbounded.
 */
function makeWallet() {
  const kp = nacl.sign.keyPair();
  const wallet = bs58.encode(kp.publicKey);
  const sign = (message: string) =>
    bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey));
  return { wallet, sign };
}

describe("auth nonce lifecycle (integration, real db)", () => {
  beforeEach(async () => {
    await prisma.authNonce.deleteMany();
  });
  afterAll(async () => {
    await prisma.authNonce.deleteMany();
    await prisma.$disconnect();
  });

  it("verifies a correctly signed challenge and consumes the nonce (single-use)", async () => {
    const { wallet, sign } = makeWallet();
    const nonce = await createNonce(wallet);
    const message = buildAuthMessage(nonce);
    const signature = sign(message);

    expect(await verifySignedMessage({ walletAddress: wallet, message, signature })).toBe(true);
    // Nonce is deleted on success.
    expect(await prisma.authNonce.findUnique({ where: { nonce } })).toBeNull();
    // Replaying the same signature now fails.
    expect(await verifySignedMessage({ walletAddress: wallet, message, signature })).toBe(false);
  });

  it("rejects a valid signature that came from a different wallet", async () => {
    const alice = makeWallet();
    const bob = makeWallet();
    const nonce = await createNonce(alice.wallet);
    const message = buildAuthMessage(nonce);
    // Bob signs Alice's challenge.
    const signature = bob.sign(message);
    expect(
      await verifySignedMessage({ walletAddress: alice.wallet, message, signature }),
    ).toBe(false);
  });

  it("rejects a tampered message shape (nonce smuggled into arbitrary text)", async () => {
    const { wallet, sign } = makeWallet();
    const nonce = await createNonce(wallet);
    const evil = `malicious prefix ${nonce}`;
    const signature = sign(evil);
    expect(await verifySignedMessage({ walletAddress: wallet, message: evil, signature })).toBe(
      false,
    );
  });

  it("rejects an expired nonce", async () => {
    const { wallet, sign } = makeWallet();
    const nonce = bs58.encode(nacl.randomBytes(16));
    await prisma.authNonce.create({
      data: { walletAddress: wallet, nonce, expiresAt: new Date(Date.now() - 1000) },
    });
    const message = buildAuthMessage(nonce);
    expect(
      await verifySignedMessage({ walletAddress: wallet, message, signature: sign(message) }),
    ).toBe(false);
  });

  it("prunes expired and used nonces when a new nonce is created", async () => {
    const { wallet } = makeWallet();
    await prisma.authNonce.create({
      data: { walletAddress: wallet, nonce: "expired-old", expiresAt: new Date(Date.now() - 1000) },
    });
    await prisma.authNonce.create({
      data: {
        walletAddress: wallet,
        nonce: "used-old",
        used: true,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await createNonce(wallet);

    expect(await prisma.authNonce.findUnique({ where: { nonce: "expired-old" } })).toBeNull();
    expect(await prisma.authNonce.findUnique({ where: { nonce: "used-old" } })).toBeNull();
    // The fresh, unexpired nonce remains.
    expect(await prisma.authNonce.count({ where: { walletAddress: wallet } })).toBe(1);
  });
});
