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

- **Lockfile RESOLVED (Loop 2):** pnpm is canonical; `package-lock.json` is no
  longer tracked, only `pnpm-lock.yaml`. Residual `npm run` command refs in docs
  were scrubbed to pnpm in Loop 3 (two npm-only `--legacy-peer-deps`
  troubleshooting rows intentionally kept — that flag doesn't exist under pnpm).
- **~62 ESLint errors as tech debt.** ESLint is NOT enforced at build time
  (`next.config.mjs eslint.ignoreDuringBuilds: true`) precisely because the legacy
  codebase has pre-existing lint problems. *Verify exact count:* `pnpm lint`.
- **CI exists** (`.github/workflows/ci.yml`: generate → migrate deploy → typecheck
  → build → test against an ephemeral Postgres; lint non-blocking). NOTE: Loops 1–3
  product work runs under a **max-throughput directive that SKIPS typecheck/test/
  build locally** — CI is the safety net, so a red CI run is expected until a
  catch-up verification pass is done.

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

## Scheduler / oracle (Loop 3)

- **Auto-resolve uses the SPOT price at expiry vs the captured `startPrice`.** A
  round is settled `YES` iff `currentPrice > startPrice` at the moment the cron
  runs — there is jitter between `endTime` and the actual settle tick, and Pyth is
  a spot read (no TWAP). For a high-stakes/mainnet context this is a fairness risk;
  acceptable on devnet/demo. A round whose price can't be fetched is SKIPPED (left
  unresolved), never invented — honest, but it can linger until a later run.
- **`CRON_SECRET` must be set on the deployment** for any cron path to authorize
  (Vercel injects `Authorization: Bearer ${CRON_SECRET}`; the GitHub workflow needs
  repo secrets `CRON_SECRET` + `APP_BASE_URL`). When unset, cron silently 403s and
  the feed stops refreshing/settling — admin POST still works. Not committed (env).
- **Price cache is per-process/per-lambda** (`CachingPriceFeedProvider`, 5s TTL,
  module-level Map). It is a hot-path round-trip reducer, NOT a correctness or
  cross-instance consistency mechanism; two lambdas can hold prices up to 5s apart.
  Failures are never cached (loud-failure honesty preserved).
- **Vercel Cron is GET-only**, so `/api/fast-bets/generate` has a cron GET handler
  that creates rounds from validator DEFAULTS (SOL/USD). Its admin POST (JWT +
  `ADMIN_RESOLUTION_KEY`) is unchanged. Don't remove the GET path or the scheduler
  breaks.

## Security boundary (must not regress)

- The **honesty boundary** (`lib/game/config.ts`, `server/xp.ts`,
  `server/oracle.ts`, `lib/useMarkets.ts`) is load-bearing: progression is local +
  labelled, demo is fallback-only + badged, value (XP/wins/settlement) is
  server-only, outcomes come from resolver adapters never invented. Any change
  that lets mock data render as live, or grants XP/wins client-side, is a
  regression. See `docs/SECURITY_NOTES.md`.
- **Devnet-only & unaudited.** No mainnet without audit + economic + legal review.
