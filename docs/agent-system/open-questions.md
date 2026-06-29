# Open Questions

Questions that need a human/team answer. Each is `Unknown from current repo`
with how to verify. Do NOT guess these in code or docs. (Sourced from
`docs/wiki/12-roadmap-and-open-questions.md` and verified against the tree.)

1. **What is the canonical package manager — npm or pnpm?**
   Both `package-lock.json` and `pnpm-lock.yaml` are committed at root. `README.md`
   documents npm `--legacy-peer-deps`; recent commits use pnpm (`dd367fe fix: sync
   pnpm lockfile`). *Verify:* ask the team; check CI once it exists; whichever
   lockfile CI installs from wins, then delete the other.

2. **Where is the deployed (full) program's Rust source?**
   Only `idl/prediction_market.json` (18 instructions) is in this repo;
   `contracts/quantum_wager/` is a minimal escrow scaffold with a placeholder id.
   `docs/DEVNET_DEPLOYMENT.md` says the Anchor source is "a separate workspace."
   *Verify:* locate that workspace/repo and link it here.

3. **Are the on-chain `methods.tsx` flows exercised end-to-end on devnet today?**
   No in-repo automated proof. *Verify:* run the flows against devnet with a
   funded wallet and inspect tx signatures; ideally add an E2E harness.

4. **Is `RATE_LIMIT_ENABLED` actually enforced anywhere?**
   The env var exists (`.env.example`, default `"false"`) but enforcement is not
   confirmed. *Verify:* `grep -rn RATE_LIMIT server/ app/` and trace whether any
   handler/middleware reads it.

5. **Does `test/setup.ts` exist and does `pnpm test` currently pass?**
   `vitest.config.ts` references `./test/setup.ts`. *Verify:* `ls test/` and run
   `pnpm test`. (Tests are being added now — this may be in flight.)
