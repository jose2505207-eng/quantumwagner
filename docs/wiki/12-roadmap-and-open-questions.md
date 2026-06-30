# 12 · Roadmap & Open Questions

Clearly separated: **confirmed facts** from the code, then **speculation /
suggestions**. Speculation is never presented as fact.

## Confirmed unfinished areas (from the code & docs)

- **Levels 3–6 don't yet complete from authoritative signals.** Levels 1–2
  complete from real signals via `GameSync`; 3–6 complete from in-app actions and
  are intended to be wired to real backend/on-chain signals the same way.
  `Source: docs/GAME_LOOP.md`, `Source: components/game/GameSync.tsx`.
- **Progression is client-side.** XP/quests/streaks live in `localStorage` and
  grant no on-chain value. Moving them server-side is a documented prerequisite
  for any real economy. `Source: docs/SECURITY_NOTES.md`,
  `Source: store/useGameStore.ts`.
- **Fast bets feed is demo.** Per the security notes, no live fast-bets feed is
  wired yet (badged demo). `Source: docs/SECURITY_NOTES.md`.
- **Oracle provider adapter is a stub interface.** Only `dev` and `admin`
  resolvers ship; a `provider` adapter (Pyth/Switchboard) is described but not
  implemented (`ORACLE_MODE` accepts `provider`). `Source: server/oracle.ts`,
  `Source: server/env.ts`.
- **Component test coverage is nascent.** A real Vitest suite + CI now exist
  (node authority layer on real Postgres, jsdom component layer, blocking CI in
  `.github/workflows/ci.yml`), but only two component specs have been written so
  far. `Source: docs/wiki/08-testing-and-quality.md`, `Source: vitest.workspace.ts`,
  `Source: test/component/`.
- **Lint debt (~143 warnings).** Lint runs **non-blocking** in CI; the warnings
  are tracked as tech debt, not yet burned down. `Source: .github/workflows/ci.yml`.
- **Devnet on-chain E2E proof is pending funded creds.** `pnpm e2e`
  (`test/e2e/devnet-e2e.ts`) is wired and fails loud at 0 SOL; the devnet wallet
  funding is still pending, so the live green proof has not been produced.
  `Source: test/e2e/README.md`.

## Confirmed discrepancies / risks (verify before trusting)

- **`docs/ARCHITECTURE.md` is partly stale.** It describes the backend as an
  external Render service; the current backend is in-repo (`app/api/*` + Prisma).
  The README and `docs/BUILD_PROGRESS.md` explain the migration. Treat the README
  + this wiki as current. `Source: docs/ARCHITECTURE.md`, `Source: README.md`,
  `Source: docs/BUILD_PROGRESS.md`.
- **RPC drift: resolved.** Both `SolanaProvider` and `useProgram()` now read
  `SOLANA_RPC_URL` from `lib/solana.ts` (Loop 7 removed the hardcoded URL in
  `useProgram.ts`). Kept here only as a "don't regress" marker.
  `Source: lib/solana.ts`, `Source: app/utils/useProgram.ts`,
  `Source: app/utils/SolanaProvider.tsx`.
- **Deployed program is IDL-only; its Rust source is not recoverable.** The
  deployed program (`C8SAQXW3…toSc`, 18 instructions) is feature-rich
  (battles/tokens/curves/reputation per `config.ts` + IDL), but its Rust source
  is **not present in any branch, remote, or git history**. The
  `contracts/quantum_wager` scaffold is a **different**, minimal 4-instruction
  escrow program with a placeholder id — not the deployed program's source.
  `Source: config.ts`, `Source: idl/prediction_market.json`,
  `Source: contracts/quantum_wager/.../lib.rs`.
- **Devnet-only, unaudited.** Mainnet needs audit + economic + legal review.
  `Source: docs/SECURITY_NOTES.md`.

## Open questions (`Unknown from current repo`)

- **What is the canonical package manager?** Both `package-lock.json` and
  `pnpm-lock.yaml` are committed; README uses npm `--legacy-peer-deps`. *Verify:*
  ask the team / check CI when it exists.
- **Where is the deployed (full) program's Rust source?** Only the IDL is in this
  repo. *Verify:* `docs/DEVNET_DEPLOYMENT.md` says it's a "separate workspace" —
  locate that repo.
- **Are the on-chain flows proven end-to-end on devnet today?** A harness now
  exists (`pnpm e2e`, `test/e2e/devnet-e2e.ts`) but has **not run green** — the
  devnet wallet funding is pending. *Verify:* fund the keypair, run `pnpm e2e`,
  inspect the printed tx signature.

## Suggested next improvements (speculation — author's recommendation)

These are recommendations, not facts. Several earlier items now **shipped**
(authority-layer tests, a blocking CI pipeline, and RPC centralisation) and have
moved out of this list. What remains:

1. **Grow component coverage** beyond the two seed specs in `test/component/**`,
   targeting the core market/battle screens.
2. **Burn down the ~143 lint warnings** and flip CI lint to blocking once clean.
3. **Fund the devnet wallet and run `pnpm e2e` to green** — the last missing
   piece of an end-to-end on-chain proof.
4. **Make lint/CI fully blocking** after the debt is cleared.
5. **Refresh or retire `docs/ARCHITECTURE.md`** to match the in-repo backend, or
   redirect it to this wiki.
6. **Move progression server-side** behind the existing `awardXp` ledger when an
   economy is in scope, per `docs/SECURITY_NOTES.md`.

## How this page stays honest

When code changes, run `node scripts/update-wiki.mjs` to see which pages
(including this one's `detectedGaps`) need review, then update only those.
See [10-agent-guide](./10-agent-guide.md).
