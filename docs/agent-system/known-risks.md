# Known Risks

Verified against the real repo. Each entry: the fact, where it lives, the impact.

## Active / being fixed

- **TypeScript build error in `app/utils/methods.tsx` (being fixed).** TS errors
  now fail `pnpm build` (`next.config.mjs`). This is the largest on-chain
  instruction-composer file; a type error here blocks the build until resolved.
  *Verify:* `pnpm typecheck`.
- **Hardcoded RPC drift (being centralised).** `app/utils/useProgram.ts` reads
  `NEXT_PUBLIC_SOLANA_RPC_URL` with a devnet fallback, but
  `app/utils/SolanaProvider.tsx` uses `clusterApiUrl(devnet)`. Two RPC sources can
  drift; intent is to centralise on one env-driven source.

## Tech debt

- **Two committed lockfiles.** Both `package-lock.json` (npm) and `pnpm-lock.yaml`
  exist at root. Recent commits use pnpm (`dd367fe fix: sync pnpm lockfile`), but
  `README.md` documents npm `--legacy-peer-deps`. Risk: dependency drift / "works
  on my machine". *Resolve:* pick one, delete the other (see `open-questions.md`).
- **~62 ESLint errors as tech debt.** ESLint is NOT enforced at build time
  (`next.config.mjs eslint.ignoreDuringBuilds: true`) precisely because the legacy
  codebase has pre-existing lint problems. *Verify exact count:* `pnpm lint`.
- **No app-level tests / CI merged yet.** Vitest config + scripts are present and
  authority-layer tests are in progress, but `.github/` has no workflow on this
  branch. *Verify:* `ls .github/workflows test/`.

## Chain / program

- **Deployed program ≠ in-repo reference contract.** The deployed devnet program
  `C8SAQXW3…toSc` (IDL: 18 instructions — markets, battles, tokens, bonding
  curves, reputation) is far richer than `contracts/quantum_wager/` (minimal
  escrow scaffold, placeholder id). **The full deployed program's Rust source is
  NOT in this repo** — only `idl/prediction_market.json`. Do not assume the
  reference Rust matches the deployed IDL feature-for-feature.
- **On-chain flows unproven E2E in-repo.** No automated evidence that
  `methods.tsx` flows succeed against devnet today (open question).

## Documentation / process

- **`docs/ARCHITECTURE.md` was stale** (described an external Render backend). A
  banner + minimal in-place correction were added pointing to
  `docs/wiki/01-architecture.md`; the rest of that file may still drift — prefer
  the wiki.
- **The wiki was not merged to `main`.** It lives on `origin/docs/repo-wiki` and
  was **restored onto this branch** into `docs/wiki/`. `WIKI.md` at root was a
  dangling pointer until this restore. Until a merge lands, `main` lacks the wiki.

## Security boundary (must not regress)

- The **honesty boundary** (`lib/game/config.ts`, `server/xp.ts`,
  `server/oracle.ts`, `lib/useMarkets.ts`) is load-bearing: progression is local +
  labelled, demo is fallback-only + badged, value (XP/wins/settlement) is
  server-only, outcomes come from resolver adapters never invented. Any change
  that lets mock data render as live, or grants XP/wins client-side, is a
  regression. See `docs/SECURITY_NOTES.md`.
- **Devnet-only & unaudited.** No mainnet without audit + economic + legal review.
