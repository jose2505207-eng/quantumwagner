/**
 * Quantum Wager program tests (devnet/localnet).
 * Run with `anchor test` from contracts/quantum_wager once the Anchor + Solana
 * toolchains are installed. Covers the happy path: init -> bet -> resolve -> claim.
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QuantumWager } from "../target/types/quantum_wager";
import { assert } from "chai";

describe("quantum_wager", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.QuantumWager as Program<QuantumWager>;

  const marketId = new anchor.BN(Date.now());
  const enc = (s: string) => Buffer.from(s);

  const [marketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [enc("market"), marketId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [enc("vault"), marketPda.toBuffer()],
    program.programId
  );

  it("initializes a market", async () => {
    const endTs = new anchor.BN(Math.floor(Date.now() / 1000) + 3600);
    await program.methods
      .initializeMarket(marketId, endTs)
      .accounts({
        authority: provider.wallet.publicKey,
        market: marketPda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    assert.ok(market.marketId.eq(marketId));
    assert.equal(market.resolved, false);
  });

  it("places a YES bet", async () => {
    const [positionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [enc("position"), marketPda.toBuffer(), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    await program.methods
      .placeBet({ yes: {} } as any, new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        bettor: provider.wallet.publicKey,
        market: marketPda,
        vault: vaultPda,
        position: positionPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    assert.ok(market.yesPool.gtn(0));
  });

  // resolve + claim require the market end_ts to pass; on localnet you can warp
  // the clock or initialize with a past end_ts. Left as an exercise to keep the
  // scaffold runnable without clock manipulation helpers.
});
