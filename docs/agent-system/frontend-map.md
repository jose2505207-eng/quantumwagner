# Frontend Map

## Page surfaces (`app/<feature>/page.tsx`, from `find app -name page.tsx`)

| Route | File | Surface |
| --- | --- | --- |
| `/` | `app/page.tsx` | Landing / home arena |
| `/markets` | `app/markets/page.tsx` | Prediction markets list |
| `/markets/category/[category]` | `app/markets/category/[category]/page.tsx` | Category-filtered markets |
| `/markets/[id]` | `app/markets/[id]/page.tsx` | Single market + place prediction |
| `/fastbet` | `app/fastbet/page.tsx` | Fast-bets feed |
| `/fastbet/[id]` | `app/fastbet/[id]/page.tsx` | Single fast-bet |
| `/battlearena` | `app/battlearena/page.tsx` | Meme battles list |
| `/battlearena/new` | `app/battlearena/new/page.tsx` | Create battle |
| `/battlearena/[pda]` | `app/battlearena/[pda]/page.tsx` | Single battle (keyed by on-chain pda) |
| `/buytoken` | `app/buytoken/page.tsx` | Token marketplace |
| `/token` | `app/token/page.tsx` | Token launchpad |
| `/token/[id]` | `app/token/[id]/page.tsx` | Single token |
| `/leaderboard` | `app/leaderboard/page.tsx` | Season leaderboard (server-derived) |
| `/portfolio` | `app/portfolio/page.tsx` | User positions/holdings |
| `/portfolio/battle/[pda]`, `/portfolio/token/[mid]`, `/portfolio/token/bought/[ata]` | nested | Portfolio detail views |
| `/admin` | `app/admin/page.tsx` | Admin: markets/stats |
| `/how-it-works` | `app/how-it-works/page.tsx` | Explainer |
| `/info/*` | `app/info/{privacy_policy,support,terms_of_services}/page.tsx` | Static info |

## Root wiring — `app/layout.tsx`

Mounts (in order): `RouteProgress` (nprogress), `SolanaProvider`, `Navbar` (incl.
HUD), `WalletAuth` (headless), `GameSync` (headless), `XPToast`,
`<main>{children}</main>`, `Toaster`, `Footer`.

## `app/utils/*` — wallet + chain glue

- `SolanaProvider.tsx` — wallet adapter + `Connection` (uses
  `clusterApiUrl(devnet)`).
- `walletAuth.tsx` — headless sign-in effect (nonce → signMessage → verify → JWT).
- `useProgram.ts` — builds the Anchor `Program` from `idl/prediction_market.json`
  (RPC read from `NEXT_PUBLIC_SOLANA_RPC_URL` with devnet fallback).
- `methods.tsx` — composes on-chain instructions using `config.ts` constants.
- `useAllBattles.tsx`, `useUserBattles.tsx`, `useAllTokens.tsx`,
  `useUserTokens.tsx`, `useUserBoughtTokens.tsx`, `hooks/`.

## Game layer — `components/game/*` (the cross-cutting HUD)

`GameSync.tsx` (real-signal bridge), `PlayerHUD.tsx`, `NavbarHUD.tsx`,
`MissionMap.tsx`, `MissionCard.tsx`, `DailyQuests.tsx`, `RankBadge.tsx`,
`XPProgress.tsx`, `XPToast.tsx`, `StatusPill.tsx`, `LiveArenaStats.tsx`,
`WalletGate.tsx`, `CompleteLevelOnMount.tsx`, `GlassPanel.tsx`, `DemoBadge.tsx`,
`EmptyState.tsx`, `ErrorState.tsx`, `LoadingSkeleton.tsx`, `index.ts`.

## Game source-of-truth — `lib/game/*`

Imported by **both** client and server (treat as a shared contract):
`config.ts` (honesty flags `DEMO_MODE`/`PROGRESSION_IS_LOCAL`, `API_URL`, RPC),
`levels.ts`, `ranks.ts` (`getRank` XP ladder), `quests.ts`, `xp.ts`, `types.ts`,
`index.ts`.

## Other component groups

`components/marketing/*` (Navbar), `components/landing/*`, `components/market/*`,
`components/battlearena/*`, `components/fastbet/*`, `components/buytoken/*`,
`components/portfolio/*`, `components/positions/*`, `components/leaderboard/*`,
`components/admin/*`, `components/token-details/*`, `components/achivementNFTCards/*`,
`components/reputationCards/*`, `components/custom/*`, `components/ui/*` (shadcn).

## Client state — `store/*` (Zustand)

`useGameStore.ts` (persisted, key `qw-progress-v1`: `xp`, `completedLevels`,
`claimedQuests`, `streak`; methods `syncFromBackend`, `hydrateServer`),
`userInfo.ts` (auth user), `usePositionStore.ts`, `adminMarketStore.ts`.

## HTTP client — `lib/api.ts`

axios instance; interceptor injects the `Bearer` JWT from localStorage on every
request. Base URL from `BACKEND_URL`/`API_URL` (default same-origin `""`).
