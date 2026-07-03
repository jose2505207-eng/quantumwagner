# Devnet on-chain E2E harness

`devnet-e2e.ts` is the OQ#3 deliverable: real, end-to-end proof that the deployed
prediction-market program (`idl/prediction_market.json`, 18 instructions) is
reachable on devnet and that the locally-configured wallet can read from and sign
against it. It prints **real account reads and a real transaction signature** —
never fabricated.

## Preflight + run

```bash
pnpm solana:health    # RPC reachable + cluster=devnet (genesis) + signer match + balance
pnpm solana:balance   # just the balance
# the full signed-transaction proof (IPv4-first avoids unreachable-AAAA hangs):
NODE_OPTIONS="--dns-result-order=ipv4first" pnpm e2e
```

The harness verifies the live cluster is **devnet by genesis hash** and that the
signer is the expected pubkey, and prints only the **RPC host** (never the API
key). Any mainnet RPC / non-devnet network is rejected at boot.

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
   the `PlatformConfig` PDA, then **deterministic PDA discovery** — it derives
   each `token_launch` / `battle` / `market` account PDA by id from the
   `PlatformConfig` counters (`next_launch_id` / `next_battle_id` /
   `next_market_id`) and batch-reads them with **`getMultipleAccountsInfo`** (via
   Anchor `fetchMultiple`), decoding with the IDL account coder. Absent ids come
   back `null` and are reported honestly — never invented. The seeds are taken
   straight from `idl/prediction_market.json` and match `app/utils/methods.tsx`
   (`["token_launch", id]`, `["battle", id]`, `["market", id]`, all u64 LE).
   **No `getProgramAccounts` is used on the standard run**, so a free-tier RPC is
   sufficient.
4. **Signing-liveness proof**: a 0-lamport self-transfer (wallet → wallet). This
   is economically neutral (costs only the network fee, sends to self) yet yields
   a **real signature** with a Solana Explorer link.

## Troubleshooting

- **`getProgramAccounts is not available on the Free tier`** — the standard run no
  longer calls `getProgramAccounts`; it uses deterministic PDA reads (above), so a
  free-tier devnet RPC (e.g. Alchemy Free) works. The legacy program-wide scan is
  kept **only** as an opt-in debug path: run `E2E_GPA_INVENTORY=1 pnpm e2e`. That
  provider may not support `getProgramAccounts` on a free tier; if blocked, the
  harness warns and skips it without failing the proof.
- **DNS / IPv6 connectivity (RPC unreachable, hangs at boot)** — run the harness
  with the IPv4-first resolver:
  `NODE_OPTIONS="--dns-result-order=ipv4first" pnpm e2e`. Some hosts resolve the
  RPC host to an unreachable AAAA record first; this forces IPv4.
- **Confirmation hangs ~30s then times out** — key-only HTTPS RPC endpoints don't
  serve the `signatureSubscribe` WebSocket. The harness confirms via HTTP polling
  (`getSignatureStatuses`), not `confirmTransaction`, so this is already handled.

## Funding status

The devnet faucet is currently IP-blocked for this host; the wallet is funded
out-of-band via an authenticated devnet RPC. Until funded, `pnpm e2e` is expected
to fail loud at step [2] — that is the correct honest behaviour, not a bug.

## Companion journey proofs

- `npx tsx test/e2e/market-e2e.ts` — full market journey: on-chain
  `initialize_market` → wallet auth → market recorded (server re-verifies the
  tx) → on-chain `place_bet` → prediction recorded.
- `npx tsx test/e2e/token-e2e.ts` — full memecoin journey: on-chain
  `create_token_launch` (pays the 0.1 SOL creation fee) → launch recorded →
  on-chain `buy_token` → trade recorded.

Both need the app running (`E2E_BASE_URL`, default `http://localhost:3000`)
and the funded `.devnet/id.json` wallet. Like the harness above they are NOT
part of `pnpm test` / CI.
