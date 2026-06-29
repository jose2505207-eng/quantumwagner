# 10 · Agent Guide

For future AI agents and engineers changing this repo. Read this before editing.

## Architectural invariants (do not break)

1. **Server is the authority for value.** XP, wins, and resolution are computed
   server-side only. `awardXp` (`server/xp.ts`) is the **only** way XP is granted;
   `applyResolution` (`server/oracle.ts`) is the only settlement path. The client
   must never set XP/wins. `Source: server/xp.ts`, `Source: server/oracle.ts`.
2. **The honesty boundary holds.** Demo/seed data appears **only** as a fallback
   when a live source returns nothing, and **always** behind a `<DemoBadge/>`.
   Never merge mock data into live data. `Source: lib/useMarkets.ts`,
   `Source: lib/game/config.ts`, `Source: docs/SECURITY_NOTES.md`.
3. **Local progression stays labelled local.** `useGameStore` is per-device and
   grants no on-chain value. If you make it authoritative, move it server-side
   (the path is documented in `docs/SECURITY_NOTES.md`).
4. **Outcomes are never invented.** Resolution comes from a resolver adapter
   (`dev` trusts caller; `admin` requires `ADMIN_RESOLUTION_KEY`). Keep that
   contract for any new adapter. `Source: server/oracle.ts`.
5. **Ledgers are append-only.** `XPEvent` and `AuditLog` rows are inserted, never
   mutated. `Source: server/xp.ts`, `Source: server/audit.ts`.
6. **Devnet only.** No mainnet ids, no mainnet RPC, no economic claims.
   `Source: contracts/quantum_wager/.../lib.rs`, `Source: docs/SECURITY_NOTES.md`.

## Files to read first

1. `app/layout.tsx` — how everything is wired.
2. `lib/game/config.ts` — the honesty flags governing the product.
3. `server/http.ts` + `server/validators.ts` — the API contract shape.
4. `server/xp.ts` + `server/oracle.ts` — the authority layer.
5. `prisma/schema.prisma` — the data model.
6. `store/useGameStore.ts` — the local progression engine.

## Safe change protocol

**Before editing:**
```bash
git status                 # know the working-tree state
pnpm typecheck             # baseline must be clean
pnpm lint                  # baseline lint (non-blocking debt, ~143 warnings)
pnpm test                  # baseline: both Vitest projects (needs Postgres env)
```

**While editing — match the existing pattern for the area:**
- New REST endpoint? Add `app/api/<x>/route.ts` exporting `handler()`-wrapped
  `GET`/`POST`, declare `runtime = "nodejs"` + `dynamic = "force-dynamic"`, parse
  the body with a Zod schema in `server/validators.ts`, return `ok(...)`/`fail(...)`.
  Mirror `app/api/markets/route.ts`.
- Granting XP? Call `awardXp` — never write `PlayerProfile.xp` directly.
- New data field? Edit `prisma/schema.prisma`, then `pnpm db:migrate` (creates
  a committed migration). Don't hand-edit migration SQL.
- New on-chain call? Add it to `app/utils/methods.tsx`, pull params from
  `config.ts`, build the program via `useProgram()`.
- New demo data? Flag it `isDemo`/badge it; never let it reach live render paths.

**After editing:**
```bash
pnpm typecheck
pnpm lint
pnpm test   # node authority (real Postgres) + jsdom component projects
pnpm dev    # smoke test the touched flow
curl localhost:3000/api/health
```
Touching a React component? Add/extend a spec under `test/component/**` (jsdom,
DB-free). Touching the authority layer? Add to `test/unit/**` or
`test/integration/**` (node, real Postgres `quantum_test` schema). For contract
changes: `cd contracts/quantum_wager && anchor build && anchor test`. The live
devnet harness (`pnpm e2e`) needs a funded wallet and is not part of CI.

## Common traps

- **One RPC source — keep it that way.** Both `SolanaProvider` and
  `useProgram()` read `SOLANA_RPC_URL` from `lib/solana.ts`. Don't reintroduce a
  hardcoded `new Connection(...)` URL — change the env/`lib/solana` only.
  `Source: lib/solana.ts`, `Source: app/utils/useProgram.ts`,
  `Source: app/utils/SolanaProvider.tsx`.
- **Coerce decoded IDL values at the UI edge.** Anchor decodes accounts as
  `PublicKey`/`BN`/`null`; the battle/portfolio pages convert these
  (`PublicKey`→base58 via `.toString()`, `BN`→string, option→`undefined`) before
  passing to props. Don't feed raw decoded objects into string/`number` props.
  `Source: app/utils/methods.tsx`, `Source: app/battlearena/[pda]/page.tsx`,
  `Source: components/battlearena/battle-card.tsx`.
- **Two program perspectives.** The deployed program (`C8SAQXW3…toSc`, full
  features) is **not** the same as the reference scaffold in `contracts/`
  (minimal escrow, placeholder id). Don't assume the Rust source matches the
  deployed IDL feature-for-feature. `Source: config.ts`, `Source: idl/`,
  `Source: contracts/quantum_wager/.../lib.rs`.
- **`completedLevels` is a JSON string** in SQLite — parse/stringify it.
  `Source: server/xp.ts`.
- **`verify` vs `verify-wallet`.** The client uses the `verify` alias; both
  resolve. Keep both working if you touch auth. `Source: app/utils/walletAuth.tsx`,
  `Source: docs/API.md`.
- **Prod boot guard.** Changing env handling? `server/env.ts` intentionally
  throws in prod on insecure `JWT_SECRET` and uses `NEXT_PHASE` to avoid breaking
  `next build`. Don't remove that distinction. `Source: server/env.ts`.

## Style conventions (observed)

- Route handlers: thin; logic lives in `server/*.ts`. Always `handler()`-wrapped.
- Zod for every external input. Envelope is always `{ success, data | message }`.
- Source-of-truth game data is centralised in `lib/game/*` and imported by both
  client and server — treat it as a shared contract.
- Comments explain *why* (honesty rules, authority) — preserve them.

## Updating THIS wiki after a code change

This wiki ships with a manifest mapping pages → source files
(`docs/wiki/wiki-manifest.json`) and an updater script
(`scripts/update-wiki.mjs`).

```bash
node scripts/update-wiki.mjs          # report pages impacted by recent changes
node scripts/update-wiki.mjs --since <git-ref>
```

The script compares changed files (since the manifest's `lastGenerated` or a git
ref) against each page's `sources`, prints which pages need review, and refreshes
the manifest timestamp with `--touch`. After editing pages:

1. Update the affected page(s) in the **same explanatory, source-cited style**.
2. Update that page's `sources` list in the manifest if you referenced new files.
3. Bump `lastGenerated` (run with `--touch`) and refresh `detectedGaps`.
4. Do **not** regenerate untouched pages.

If the script is impractical for a change, follow this protocol manually: find
the changed files in the manifest's per-page `sources`, edit only those pages,
and re-cite real files.
