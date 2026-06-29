# Devnet on-chain E2E harness

`devnet-e2e.ts` is the OQ#3 deliverable: real, end-to-end proof that the deployed
prediction-market program (`idl/prediction_market.json`, 18 instructions) is
reachable on devnet and that the locally-configured wallet can read from and sign
against it. It prints **real account reads and a real transaction signature** —
never fabricated.

## Run

```bash
pnpm e2e
```

This is **NOT** part of `pnpm test` / CI. It needs a funded devnet keypair and a
live RPC, so it never gates the green build. The node-only Vitest suite excludes
`test/e2e/**` (see `vitest.config.ts`).

## Required env (already wired in `.env`)

- `ANCHOR_WALLET` — path to the keypair JSON (repo default: `.devnet/id.json`,
  gitignored). Pubkey: `EBJjWqRqR6qidwo9qNNpaDvveX6A5PRD1avtxvDkVphA`.
- `ANCHOR_PROVIDER_URL` — devnet RPC. Falls back to `NEXT_PUBLIC_SOLANA_RPC_URL`,
  then `https://api.devnet.solana.com`.

## What it does

1. Confirms the RPC is reachable.
2. **Balance gate** — at **0 SOL it FAILS LOUD** with a clear message and a
   non-zero exit. It never skip-as-passes and never prints a fake signature.
3. Loads the program from the IDL and performs **real read-only account reads**:
   the `PlatformConfig` PDA, plus `getProgramAccounts` inventory of battles,
   markets, and token launches (with a sample of each when present).
4. **Signing-liveness proof**: a 0-lamport self-transfer (wallet → wallet). This
   is economically neutral (costs only the network fee, sends to self) yet yields
   a **real signature** with a Solana Explorer link.

## Funding status

The devnet faucet is currently IP-blocked for this host; the wallet is funded
out-of-band via an authenticated devnet RPC. Until funded, `pnpm e2e` is expected
to fail loud at step [2] — that is the correct honest behaviour, not a bug.
