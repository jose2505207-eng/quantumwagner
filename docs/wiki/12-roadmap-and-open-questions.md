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
- **No app-level automated tests and no CI.** Only `anchor test` for the
  reference contract exists. `Source: docs/wiki/08-testing-and-quality.md`,
  `Source: find . -name '*.test.*'` (empty), no `.github/` dir.

## Confirmed discrepancies / risks (verify before trusting)

- **`docs/ARCHITECTURE.md` is partly stale.** It describes the backend as an
  external Render service; the current backend is in-repo (`app/api/*` + Prisma).
  The README and `docs/BUILD_PROGRESS.md` explain the migration. Treat the README
  + this wiki as current. `Source: docs/ARCHITECTURE.md`, `Source: README.md`,
  `Source: docs/BUILD_PROGRESS.md`.
- **Hardcoded RPC in `useProgram.ts`.** It ignores `NEXT_PUBLIC_SOLANA_RPC_URL`;
  `SolanaProvider` uses `clusterApiUrl(Devnet)`. Two RPC sources can drift.
  `Source: app/utils/useProgram.ts`, `Source: app/utils/SolanaProvider.tsx`.
- **Deployed program ≠ reference scaffold.** The deployed program
  (`C8SAQXW3…toSc`) is feature-rich (battles/tokens/curves/reputation per
  `config.ts` + IDL); the Rust in `contracts/` is a minimal escrow with a
  placeholder id. The full deployed program's source is not in this repo.
  `Source: config.ts`, `Source: idl/`, `Source: contracts/quantum_wager/.../lib.rs`.
- **Devnet-only, unaudited.** Mainnet needs audit + economic + legal review.
  `Source: docs/SECURITY_NOTES.md`.

## Open questions (`Unknown from current repo`)

- **What is the canonical package manager?** Both `package-lock.json` and
  `pnpm-lock.yaml` are committed; README uses npm `--legacy-peer-deps`. *Verify:*
  ask the team / check CI when it exists.
- **Where is the deployed (full) program's Rust source?** Only the IDL is in this
  repo. *Verify:* `docs/DEVNET_DEPLOYMENT.md` says it's a "separate workspace" —
  locate that repo.
- **Are the on-chain `methods.tsx` flows exercised end-to-end on devnet today?**
  No automated proof in-repo. *Verify:* run the flows against devnet with a funded
  wallet and inspect tx signatures.
- **Is `RATE_LIMIT_ENABLED` actually enforced anywhere?** The env var exists;
  enforcement isn't confirmed here. *Verify:* `grep -r RATE_LIMIT server/ app/`.

## Suggested next improvements (speculation — author's recommendation)

These are recommendations, not facts:

1. **Add unit tests for the authority layer first** — `applyResolution` payout
   math, `awardXp` rank/leaderboard side-effects, `verifySignedMessage` replay.
2. **Add a minimal CI** (`typecheck` + `lint` + `anchor test`) to lock the
   quality gates that already pass.
3. **Centralise the RPC** so `useProgram.ts` reads `NEXT_PUBLIC_SOLANA_RPC_URL`.
4. **Refresh or retire `docs/ARCHITECTURE.md`** to match the in-repo backend, or
   redirect it to this wiki.
5. **Move progression server-side** behind the existing `awardXp` ledger when an
   economy is in scope, per `docs/SECURITY_NOTES.md`.

## How this page stays honest

When code changes, run `node scripts/update-wiki.mjs` to see which pages
(including this one's `detectedGaps`) need review, then update only those.
See [10-agent-guide](./10-agent-guide.md).
