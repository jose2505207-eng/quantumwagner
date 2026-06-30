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

## On-chain E2E proof (devnet only)

This repo ships a real, end-to-end proof that the deployed program is reachable
and that the local signer can sign a transaction on devnet — with a **real
transaction signature and a Solana Explorer (devnet) link**, never fabricated.

> 🔒 **Devnet-only enforcement.** Any RPC URL containing `mainnet` (e.g.
> `api.mainnet-beta.solana.com`), or `SOLANA_NETWORK` other than `devnet`, is
> rejected at boot (`lib/solanaNetwork.ts`, `server/env.ts`). The health check
> and E2E also verify the live cluster by **genesis hash**, so a devnet-shaped
> URL that actually resolves to mainnet is still refused.

### 1. Get a free devnet RPC (authenticated)

The public `https://api.devnet.solana.com` is heavily rate-limited. Create a free
**devnet** app key from any provider and copy its HTTPS URL:

- **Alchemy** — dashboard → Create App → chain *Solana*, network *Devnet* →
  `https://solana-devnet.g.alchemy.com/v2/YOUR_KEY`
- **Helius** — `https://devnet.helius-rpc.com/?api-key=YOUR_KEY`
- **QuickNode** — create a *Solana / Devnet* endpoint → copy the HTTPS URL

### 2. Export env vars locally

Put the authenticated key **server-side only** (it never reaches the browser):

```bash
# in .env (gitignored)
SOLANA_NETWORK=devnet
ANCHOR_PROVIDER_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_KEY
ANCHOR_WALLET=.devnet/id.json
# keep the browser endpoint keyless (public devnet) unless you have a
# browser-restricted devnet key:
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

The E2E signer is the gitignored `.devnet/id.json`, expected pubkey
`EBJjWqRqR6qidwo9qNNpaDvveX6A5PRD1avtxvDkVphA`. Do not commit it.

### 3. Health check + balance

```bash
pnpm solana:health    # RPC reachable + cluster=devnet (genesis) + signer match + balance
pnpm solana:balance   # just the balance
```

Both print only the **RPC host** (never the full URL / API key).

### 4. Fund the wallet (out-of-band)

`pnpm e2e` aborts loudly at **0 SOL** — it never skip-passes or fakes a
signature. Fund the pubkey on devnet first (the public faucet may be IP-blocked
on CI hosts, so fund via your authenticated RPC / `solana airdrop` from a clean
network):

```bash
solana airdrop 1 EBJjWqRqR6qidwo9qNNpaDvveX6A5PRD1avtxvDkVphA \
  --url https://solana-devnet.g.alchemy.com/v2/YOUR_KEY
```

### 5. Run the on-chain E2E proof

```bash
pnpm e2e
```

It prints a real signature and a link of the exact form:

```
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

### 6. Confirm the link is devnet

Open the link — Explorer must show the **Devnet** cluster badge and a
*Success* status, and the `?cluster=devnet` query must be present. If a link ever
lacks `?cluster=devnet`, treat it as invalid for this devnet-only app.
