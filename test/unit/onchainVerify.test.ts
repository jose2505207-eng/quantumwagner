import { describe, it, expect } from "vitest";
import { anchorDiscriminator, PROGRAM_ID } from "@/server/solana";

/**
 * The deep on-chain verifier keys instructions by their Anchor discriminator —
 * the first 8 bytes of sha256("global:<instruction>"). If this drifts, the
 * backend silently stops recognising real `place_bet` transactions (or, worse,
 * accepts the wrong instruction), so the known-good vectors are pinned here.
 *
 * Vectors were read off real Devnet transactions of the deployed program
 * (C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc).
 */
describe("anchor instruction discriminators", () => {
  it("matches the deployed program's on-chain instruction tags", () => {
    expect(anchorDiscriminator("place_bet")).toBe("de3e43dc3fa67e21");
    expect(anchorDiscriminator("initialize_market")).toBe("2323bdc19b30aacb");
    expect(anchorDiscriminator("settle_market")).toBe("c1995fd8a60690d9");
    expect(anchorDiscriminator("withdraw_winnings")).toBe("4bb494755164a932");
    expect(anchorDiscriminator("enter_battle")).toBe("5622b486e611dc79");
    expect(anchorDiscriminator("create_token_launch")).toBe("5d573a7e584bace9");
  });

  it("distinguishes instructions (a bet is not a withdrawal)", () => {
    expect(anchorDiscriminator("place_bet")).not.toBe(
      anchorDiscriminator("withdraw_winnings")
    );
  });

  it("trusts exactly one program id", () => {
    expect(PROGRAM_ID.toBase58()).toBe(
      process.env.PROGRAM_ID ||
        process.env.NEXT_PUBLIC_PROGRAM_ID ||
        "C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc"
    );
  });
});
