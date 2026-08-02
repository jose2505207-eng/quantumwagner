# Devnet launch checklist

Everything required to run Quantum Wager as a real (no-demo-data) product on
Solana **devnet**, where a player funds a wallet with free devnet SOL and bets.

## 1. Database

The app is dead without Postgres — every API route reads it.

```bash
# any Postgres works; e.g. a throwaway local one
docker run --name qw-pg -e POSTGRES_PASSWORD=postgres -p 5433:5432 -d postgres:16
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/quantum_wager?schema=public"
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/quantum_wager?schema=quantum_test"

pnpm db:migrate:deploy      # never `migrate dev` against a deployed database
```

For a hosted deploy, point `DATABASE_URL` at the managed instance and run the
same `migrate deploy`. There is **no seed step** — the product ships empty and
fills up with real activity.

## 2. Solana (devnet)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SOLANA_NETWORK=devnet` | guarded; a non-devnet value refuses to boot |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | browser RPC — **public endpoint only, never a keyed URL** |
| `SOLANA_RPC_URL` / `ANCHOR_PROVIDER_URL` | server RPC; may carry a provider key |
| `NEXT_PUBLIC_PROGRAM_ID` / `PROGRAM_ID` | deployed prediction-market program |
| `SOLANA_REQUIRE_ONCHAIN=true` | refuse to record any bet without a confirmed tx |

The program at `C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc` is already deployed
on devnet with its platform config initialised. Its **source is not in this
repo** — the IDL is the only interface, so on-chain behaviour cannot be changed
from here. Practical consequences: minimum bet is 0.1 SOL, and market creation
costs a 0.1 SOL platform fee.

## 3. Fast-bet vault

Fast bets have no on-chain instruction, so stakes are plain SOL transfers to a
platform vault and payouts are sent back by the server.

```bash
FASTBET_VAULT_ADDRESS="<pubkey>"                  # enables staking
FASTBET_VAULT_SECRET=".devnet/fastbet-vault.json" # enables payouts
```

Fund the vault with enough SOL to cover payouts plus transaction fees. With
neither variable set, the UI states that fast-bet staking is unavailable rather
than accepting bets it cannot settle. **This is a hot key — devnet only.**

## 4. Scheduled jobs

`vercel.json` already declares them; they authenticate with `CRON_SECRET`:

| Schedule | Path | Effect |
| --- | --- | --- |
| every minute | `/api/fast-bets/auto-resolve` | settles due rounds from the Pyth feed and pays winners |
| every 5 min | `/api/fast-bets/generate` | opens fresh rounds |

Without `CRON_SECRET` set on the host, both refuse to run and the fast-bet feed
goes stale. `ORACLE_PROVIDER=pyth` is required too, or rounds are created with
no baseline price and can never auto-resolve.

## 5. Secrets

- `JWT_SECRET`, `ADMIN_RESOLUTION_KEY` — the server refuses to boot in
  production while these hold their dev defaults.
- `NEXT_PUBLIC_ADMIN_WALLETS` — who *sees* the Admin link (authority still comes
  from `ADMIN_RESOLUTION_KEY`).
- `RATE_LIMIT_REDIS_URL` / `_TOKEN` — required for multi-instance deploys;
  without them the limiter is per-instance memory.
- `MONITORING_DSN` — optional error sink.

> Rotate the Alchemy/Helius devnet key if it was ever exposed: until this
> release `/api/config/public` returned `SOLANA_RPC_URL` verbatim, so a keyed
> server RPC was readable by anyone.

## 6. Verify before calling it live

```bash
pnpm typecheck && pnpm lint && pnpm test     # 148 tests
pnpm build

# real money paths, against a running server
E2E_BASE_URL=http://localhost:3000 npx tsx test/e2e/market-e2e.ts    # market + bet
E2E_BASE_URL=http://localhost:3000 npx tsx test/e2e/fastbet-e2e.ts   # stake + payout
```

Both harnesses use the funded devnet keypair at `.devnet/id.json` and assert
against the chain, not the database.

## 7. The player's first five minutes

1. Connect a wallet (Phantom etc. — set it to **Devnet**).
2. Press **Get devnet SOL** in the navbar (falls back to faucet.solana.com when
   the airdrop endpoint is rate-limited).
3. Bet on a market, or open one with **Create a market** (0.1 SOL fee).
4. Stake a fast-bet round; winners are paid automatically after it resolves.
5. Claim a settled market's winnings from the market page or the portfolio.

## Known limits

- **Unaudited program**, source not in this repo. Devnet only; do not point any
  of this at mainnet.
- **Custodial fast bets.** Stakes sit in a server-controlled vault between the
  bet and the payout. Acceptable for free devnet SOL, not for real value.
- **Market resolution is operator-driven** — an admin resolves markets with
  `ADMIN_RESOLUTION_KEY`. Only fast bets resolve automatically from a price feed.
- **Battle arena needs a connected wallet** to read battles: it queries program
  accounts directly rather than through the backend.
- **Two on-chain config accounts exist** (`config` and `platform_config` seeds);
  market flows use the former, launchpad/battle flows the latter. Fees and
  treasury can therefore differ between features.
