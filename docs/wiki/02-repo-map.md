# 02 · Repo Map

A guided tour grouped by **responsibility**, not an alphabetical file dump. For
each area: what it owns, and whether it's safe to touch.

## Where a new contributor should start

1. Read `app/layout.tsx` — it wires every global concern in one place.
2. Read `lib/game/config.ts` — the honesty flags that govern the whole product.
3. Pick one feature and read its triple: `app/<feature>/page.tsx` →
   `app/api/<feature>/route.ts` → the matching `server/*.ts` helper.
4. Skim `prisma/schema.prisma` — the data model is small and explains the domain.

## Top-level layout

| Path | Owns | Touch with care? |
| --- | --- | --- |
| `app/` | Routes (UI pages) **and** the in-repo API (`app/api`) | UI: yes. `app/api`: it's the authority — careful |
| `components/` | All React components, grouped by feature + `ui/` (shadcn) | Mostly safe |
| `lib/` | Client utilities + `lib/game/*` source of truth + `lib/api.ts` | `lib/game` is product-defining — careful |
| `server/` | Server-only business logic behind the API | **Authority. Change deliberately** |
| `store/` | Zustand stores (game/user/positions) | Careful with persisted shape |
| `prisma/` | Schema, migrations, seed (DEMO data) | Migrations are committed; coordinate |
| `idl/` | Anchor IDL + TS types for the **deployed** program | Generated — don't hand-edit |
| `contracts/` | Reference Anchor escrow program (Rust) | Separate workspace |
| `config.ts` | On-chain program id, treasury, fee/param constants | Affects real chain calls |
| `constants/` | FAQ, fonts, links | Safe |
| `docs/` | Hand-written docs (incl. this `wiki/`) | Keep in sync |

`Source: repository root listing`

## `app/` — routes and API

### UI routes (App Router pages)
`Source: find app -name page.tsx`. Each maps to a game surface:

| Route | Purpose |
| --- | --- |
| `app/page.tsx` | Landing / arena entry |
| `app/markets/` (+ `[id]`, `category/[category]`) | Prediction markets |
| `app/fastbet/` (+ `[id]`) | Fast bets |
| `app/battlearena/` (+ `new`, `[pda]`) | Meme battles |
| `app/token/` (+ `[id]`), `app/buytoken/` | Token launchpad / trading |
| `app/leaderboard/` | Seasonal standings |
| `app/portfolio/` (+ `battle/[pda]`, `token/...`) | Player holdings/positions |
| `app/admin/` | Admin/resolution surface |
| `app/how-it-works/`, `app/info/*` | Marketing / legal pages |

### `app/api/` — the backend (Route Handlers)
One folder per resource; `route.ts` files export `GET`/`POST` wrapped by
`handler()`. Full list in [06-api-and-interfaces](./06-api-and-interfaces.md).
`Source: find app/api -name route.ts`.

### `app/utils/` — client glue (incl. the chain)
| File | Role |
| --- | --- |
| `SolanaProvider.tsx` | Wallet adapter + connection context |
| `walletAuth.tsx` | Side-effect: nonce → sign → verify → store JWT |
| `useProgram.ts` | Builds the Anchor `Program` from the IDL (hardcoded devnet RPC) |
| `methods.tsx` | The big on-chain action module (markets/battles/tokens) |
| `useAllBattles / useAllTokens / useUserBattles / useUserTokens / useUserBoughtTokens` | On-chain data hooks |
| `hooks/` | `CountdownTimer`, `useCountDown`, `routeProgress` |

`Source: app/utils/` listing. **Careful:** `methods.tsx` and `useProgram.ts`
sign and send real (devnet) transactions.

## `server/` — the authority layer

| File | Owns |
| --- | --- |
| `http.ts` | `ok`/`fail` envelope, `handler()` error wrapper, `HttpError` |
| `auth.ts` | Nonces, ed25519 verify, JWT, `requireAuth`/`optionalAuth` |
| `env.ts` | Zod-validated env; refuses insecure prod boot |
| `db.ts` | Prisma client singleton |
| `validators.ts` | Zod schemas for every request body |
| `oracle.ts` | Resolution adapters + pari-mutuel `applyResolution` |
| `xp.ts` | `awardXp` (only XP path) + `completeLevelServer` |
| `users.ts` | User lookup/creation, active season |
| `quests.ts` | Quest claim logic |
| `markets.ts` | Market serialization/helpers |
| `audit.ts` | `logAudit` append-only audit trail |

**This is the trust boundary.** Anything that grants value lives here.
`Source: server/` listing.

## `lib/game/` — the product's source of truth

| File | Defines |
| --- | --- |
| `levels.ts` | The 6-level journey (ids, missions, XP, unlock logic) |
| `ranks.ts` | XP→rank ladder + `getRank`/`rankProgress` |
| `quests.ts` | Daily quests + `todayKey` reset boundary |
| `xp.ts` | `arenaLevelNumber`, `streakBonus` helpers |
| `config.ts` | `APP_MODE`, `DEMO_MODE`, `API_URL`, honesty flags |
| `types.ts` | Shared progression types |
| `index.ts` | Barrel re-export |

`Source: lib/game/` listing. **Careful:** `levels.ts`/`ranks.ts` are imported by
both client and server (`server/xp.ts` imports `getRank`), so they are a shared
contract.

## `components/` — by feature

`Source: components/` listing (counts):
`game/` (19) the HUD/progression layer · `ui/` (25) shadcn primitives ·
`market/` (8), `marketing/` (8 — Navbar/Footer), `leaderboard/` (6),
`reputationCards/` (6), `achivementNFTCards/` (6), `custom/` (5),
`token-details/` (4), `admin/` (4), `buytoken/` (4), `battlearena/` (3),
`fastbet/` (3), `landing/` (3), `portfolio/` (3), `global/` (3),
`positions/` (1), `helper/` (1).

## Data & contracts

- `prisma/schema.prisma` — 18 models (identity, gamification, markets, fast
  bets, battles, launchpad, leaderboard, oracle, audit). `prisma/seed.ts` loads
  **only** `isDemo: true` data. See [07-data-and-state](./07-data-and-state.md).
- `idl/prediction_market.json` + `idl/types.ts` — the deployed program's
  interface (program id `C8SAQXW3…toSc`).
- `contracts/quantum_wager/` — the minimal auditable escrow program (own Anchor
  workspace, own `README.md`). See [09-deployment](./09-deployment.md).
