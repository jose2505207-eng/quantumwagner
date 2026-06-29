# Architecture (summary)

Canonical, detailed version: [`docs/wiki/01-architecture.md`](../wiki/01-architecture.md).
This is the agent-facing summary.

## The three layers (+ chain)

1. **UI shell + game layer (browser).** `app/layout.tsx` wires everything:
   `SolanaProvider` (wallet adapter + RPC), `WalletAuth` (headless sign-in
   effect), `GameSync` (headless real-signal → progression bridge), `XPToast`,
   navbar/footer, page `children`. The "game" is cross-cutting, not a page:
   `components/game/*` (HUD, MissionMap, DailyQuests, RankBadge, XPProgress,
   Demo/Empty/Error states) renders state sourced from `lib/game/*`
   (levels/ranks/quests/xp/config). Local state lives in Zustand
   (`store/useGameStore.ts`, persisted to localStorage).

2. **In-repo API — the authority (Next.js process).** Each
   `app/api/**/route.ts` is a thin handler delegating to `server/*.ts`:
   `http.ts` (envelope + `handler()`), `auth.ts`, `oracle.ts`, `xp.ts`,
   `validators.ts`, `db.ts`, `env.ts`, `users.ts`, `quests.ts`, `markets.ts`,
   `audit.ts`. Handlers declare `runtime = "nodejs"` and
   `dynamic = "force-dynamic"`. Backed by Prisma + SQLite.

3. **Data — Prisma + SQLite.** `prisma/schema.prisma`, 21 models. The DB
   prediction is the canonical settlement record, not the chain tx.

**Chain (separate).** The deployed Anchor devnet program `C8SAQXW3…toSc` is
consumed in the **browser** (`app/utils/useProgram.ts` + `methods.tsx`) via
`idl/prediction_market.json`. The `contracts/quantum_wager/` Rust is only a
minimal reference scaffold, not the deployed source.

## The honesty boundary (load-bearing design rule)

The single most important invariant. Three forms, all enforced in code:

- **Progression is local and labelled.** `useGameStore` XP/levels/streaks live
  in localStorage, grant no on-chain value, and the UI labels them as local/demo.
  `lib/game/config.ts` (`PROGRESSION_IS_LOCAL`, `LOCAL_PROGRESS_NOTE`).
- **Demo data is fallback-only and always badged.** Loaders (`lib/useMarkets.ts`)
  return `source: live | demo | empty`. Demo seed (`lib/demo/markets.ts`) appears
  only when `DEMO_MODE` is on AND the live source returned nothing, always behind
  `<DemoBadge/>`, never merged into live.
- **Value is server-side only.** XP/wins via `awardXp` (`server/xp.ts`) is the
  ONLY XP path; settlement via `applyResolution` (`server/oracle.ts`) is the ONLY
  payout path. Outcomes are never invented — a resolver adapter proposes them
  (`dev` trusts caller, `admin` requires `ADMIN_RESOLUTION_KEY`).

Security agents must guard this boundary. See `known-risks.md` and
`docs/SECURITY_NOTES.md`.
