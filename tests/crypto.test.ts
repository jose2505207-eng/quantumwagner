import { describe, it, expect } from "vitest";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { verifyEd25519 } from "@/server/crypto";

describe("verifyEd25519 (wallet signed-message auth core)", () => {
  const kp = Keypair.generate();
  const address = kp.publicKey.toBase58();
  const message = "Sign this message to login to Quantum: abc123";
  const signature = bs58.encode(
    nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey)
  );

  it("accepts a valid signature from the matching wallet", () => {
    expect(verifyEd25519(message, signature, address)).toBe(true);
  });

  it("rejects a tampered message", () => {
    expect(verifyEd25519(message + "x", signature, address)).toBe(false);
  });

  it("rejects a signature from a different wallet", () => {
    const other = Keypair.generate().publicKey.toBase58();
    expect(verifyEd25519(message, signature, other)).toBe(false);
  });

  it("rejects malformed signature/address without throwing", () => {
    expect(verifyEd25519(message, "not-base58!!", address)).toBe(false);
    expect(verifyEd25519(message, signature, "not-an-address")).toBe(false);
  });
});
