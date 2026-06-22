# Devnet Deployment (Solana / Anchor)

> ⚠️ **Devnet only.** Do not deploy to mainnet without a security audit,
> economic review and legal review. See [`SECURITY_NOTES.md`](./SECURITY_NOTES.md).

The Quantum Wager prediction-market program is already deployed to devnet:

```
Program ID:  C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc
IDL:         ../idl/prediction_market.json
Types:       ../idl/types.ts
```

The frontend consumes this program via `@coral-xyz/anchor` using the IDL above.
You normally do **not** need to redeploy — just point the app at devnet.

## Frontend → program config

```bash
# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc
```

## Building & deploying your own program (optional)

The Anchor program source is maintained in a separate workspace. If you fork it,
the standard flow is:

```bash
# Toolchain: Rust, Solana CLI, Anchor (avm)
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/devnet.json   # if needed
solana airdrop 2                                            # devnet SOL

# In the Anchor workspace
anchor build
anchor keys sync            # align declare_id! with the new keypair
anchor deploy --provider.cluster devnet

# Copy the regenerated IDL + types back into this repo
cp target/idl/prediction_market.json   <this-repo>/idl/
cp target/types/prediction_market.ts   <this-repo>/idl/types.ts
```

Then update `NEXT_PUBLIC_PROGRAM_ID` (and `config.ts`) to the new program id.

### Contract env vars

```
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/devnet.json
PROGRAM_ID=<your devnet program id>
```

## Verifying

```bash
solana program show C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc --url devnet
```

If the program account exists and is executable, the frontend can interact with
it once your wallet is connected to devnet.
