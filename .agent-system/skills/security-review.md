# Security Review (honesty-boundary)

## Purpose
Verify a change does not breach the honesty boundary or any value/trust path —
the most important review in this repo.

## When To Use
- Any change to `lib/game/config.ts`, `server/xp.ts`, `server/oracle.ts`,
  `server/auth.ts`, `server/env.ts`, `lib/useMarkets.ts`, `lib/demo/*`.
- Any change that grants XP/wins, settles predictions, renders demo data, or
  touches auth/secrets.

## Required Inputs
- The diff and the trust paths it touches.

## Steps
1. **Demo fallback-only + badged:** confirm demo/seed (`lib/demo/markets.ts`)
   renders only when the live source is empty AND `DEMO_MODE` is on, always behind
   `<DemoBadge/>`, never merged into live (`lib/useMarkets.ts`, `lib/game/config.ts`).
2. **Local progression labelled:** confirm `useGameStore` XP/levels stay local and
   labelled (`PROGRESSION_IS_LOCAL`, `LOCAL_PROGRESS_NOTE`); not presented as
   on-chain value.
3. **Server-only value:** confirm XP grows only via `awardXp` and settlement only
   via `applyResolution`; no client/handler writes `PlayerProfile.xp`/`wins` or
   `Prediction` payout directly.
4. **Outcomes never invented:** resolution comes from a resolver adapter (`dev`
   trusts caller, `admin` requires `ADMIN_RESOLUTION_KEY`).
5. **Append-only ledgers:** `XPEvent`/`AuditLog` inserted, never mutated.
6. **Secrets/auth:** no secrets in `NEXT_PUBLIC_*`; `server/env.ts` prod boot
   guard (insecure `JWT_SECRET`) intact; nonce single-use; ed25519 verify in
   `server/auth.ts`.
7. **Devnet only:** no mainnet ids/RPC/economic claims.

## Commands To Run
```bash
grep -rn "PlayerProfile" server/ app/        # who writes XP/wins?
grep -rn "DEMO\|isDemo\|DemoBadge" lib/ components/ app/
grep -rn "NEXT_PUBLIC_" .                     # ensure no secret is public
grep -rn "ADMIN_RESOLUTION_KEY\|JWT_SECRET" server/
```

## Files To Inspect
`lib/game/config.ts`, `lib/useMarkets.ts`, `lib/demo/markets.ts`,
`server/{xp,oracle,auth,env,audit,validators}.ts`, `store/useGameStore.ts`,
`docs/SECURITY_NOTES.md`.

## Expected Output
A per-invariant PASS/FAIL checklist with file:line evidence and a go/no-go.

## Failure Signals
- Demo data reachable from a live render path.
- A handler writing XP/wins directly.
- A secret exposed via `NEXT_PUBLIC_*`; prod boot guard removed.

## Definition Of Done
- All 7 checks PASS with evidence, or the merge is blocked and escalated.
