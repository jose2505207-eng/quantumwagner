# Quantum Wager — Anchor Program (DEVNET ONLY)

> ⚠️ **UNAUDITED scaffold.** This minimal prediction-market escrow program is for
> **devnet/demo** only. Do **not** deploy to mainnet without a professional
> security audit, an economic review, and legal review. No mainnet readiness is
> claimed. See `../../docs/SECURITY_NOTES.md`.

## What it does

A minimal binary (YES/NO) prediction market with on-chain escrow:

| Instruction         | Purpose                                                        |
| ------------------- | ------------------------------------------------------------- |
| `initialize_market` | Create a market (PDA) + a lamport vault PDA, with an end time. |
| `place_bet`         | Escrow SOL into the vault and record a YES/NO position.        |
| `resolve_market`    | Market authority (admin/oracle) sets the final outcome.        |
| `claim_winnings`    | Winners withdraw a pari-mutuel pro-rata share of the pool.      |

Events (`MarketInitialized`, `BetPlaced`, `MarketResolved`, `WinningsClaimed`)
are emitted for off-chain indexing by the backend/frontend.

PDAs: `["market", market_id]`, `["vault", market]`, `["position", market, owner]`.

## Prerequisites

- Rust + `cargo`
- Solana CLI — https://docs.solanalabs.com/cli/install
- Anchor (via `avm`) 0.31.x — https://www.anchor-lang.com/docs/installation
- Node + Yarn (for tests)

## Build, test, deploy (devnet)

```bash
cd contracts/quantum_wager

# 1. Configure devnet + a funded keypair
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/devnet.json   # if needed
solana airdrop 2

# 2. Build + align the program id with your keypair
anchor build
anchor keys sync          # rewrites declare_id! + Anchor.toml program id

# 3. Test (localnet)
anchor test

# 4. Deploy to devnet
anchor deploy --provider.cluster devnet

# 5. Export the IDL for the app
anchor idl init <PROGRAM_ID> -f target/idl/quantum_wager.json --provider.cluster devnet
cp target/idl/quantum_wager.json ../../idl/quantum_wager.json
cp target/types/quantum_wager.ts ../../idl/quantum_wager_types.ts
```

Then set `NEXT_PUBLIC_PROGRAM_ID` (and `config.ts`) to the deployed program id.

## Env vars

```
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/devnet.json
PROGRAM_ID=<your devnet program id after anchor keys sync>
```

## Relationship to the existing deployed program

The app already integrates a separate, more complete deployed devnet program
(`C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc`, IDL in `../../idl/`). This
workspace is a clean, minimal, auditable reference implementation of the core
escrow/resolution flow — useful for understanding, testing, and extending the
on-chain logic without the full program's surface area.

## Before mainnet (required, not done here)

- Professional security audit (reentrancy, arithmetic, PDA/seed correctness,
  rent + lamport accounting on the vault).
- Economic review of pari-mutuel math, fees, and rounding/dust handling.
- Legal review (prediction markets are regulated in many jurisdictions).
