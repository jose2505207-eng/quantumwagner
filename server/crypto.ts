import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

/**
 * Pure ed25519 signed-message verification (no DB / nonce logic).
 * Returns true iff `signatureB58` is a valid signature of `message` by the
 * wallet `addressB58`. Isolated here so it can be unit-tested in isolation.
 */
export function verifyEd25519(
  message: string,
  signatureB58: string,
  addressB58: string
): boolean {
  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signatureB58),
      new PublicKey(addressB58).toBytes()
    );
  } catch {
    return false;
  }
}
