# Lint Burndown

## Purpose
Drive the ESLint ERROR count down on a disjoint file set without breaking the
build — fixing types honestly (no rule disabling), the pattern that worked in
Loop 5.

## When To Use
- The repo has a backlog of ESLint errors and you want to reduce it in a focused,
  parallel-safe pass.
- After a feature lands and adds new `@typescript-eslint/no-explicit-any` /
  `no-empty-object-type` / `react/no-unescaped-entities` errors.

## Required Inputs
- An explicit EXCLUSION LIST of files this agent must NOT touch: always
  `app/utils/methods.tsx` (the on-chain transaction composer — a wrong type there
  BLOCKS `pnpm build`, owned by a single owner in small batches) plus any file
  another in-flight workstream owns.
- A baseline error count from `pnpm lint 2>&1 | grep "error"` before starting.

## Steps
1. Capture the baseline: `pnpm lint` (full report) and the error count via
   `pnpm lint 2>&1 | grep -c "error"`. Note `pnpm build` can be GREEN while lint
   has errors — `next.config.mjs` has `eslint.ignoreDuringBuilds: true`, so lint
   is NOT a build gate; the count must be checked with `pnpm lint`.
2. Confirm `pnpm typecheck` is at 0 errors NOW — that is the iron baseline. The
   build DOES fail on TypeScript errors (`next.config.mjs` typescript is not
   ignored), so every lint fix must keep typecheck at 0.
3. Target ERRORS, not warnings. Errors first: `@typescript-eslint/no-explicit-any`
   (dominant), `@typescript-eslint/no-empty-object-type` (the `{}` type), and
   `react/no-unescaped-entities`. Warnings (`no-unused-vars`, `no-img-element`)
   are NOT errors — leave them for later.
4. Fix in small batches on the DISJOINT file set, honoring the exclusion list.
   Replace `any` with the real type (or `unknown` + a narrow), replace `{}` with
   the intended object/`Record`/interface, escape JSX entities. NEVER add blanket
   `eslint-disable` or turn rules off in config — fix the types honestly.
5. After EACH batch run `pnpm typecheck`; if it is not 0, revert that batch.
6. Re-run `pnpm lint` to confirm the error count dropped and no new errors were
   introduced. Finish with `pnpm build` exiting 0.
7. Integrate centrally — `methods.tsx` and any contested file stay with their
   single owner who runs typecheck+build after EACH of their own batches.

## Commands To Run
```bash
pnpm lint                          # full report
pnpm lint 2>&1 | grep "error"      # isolate ERROR lines
pnpm lint 2>&1 | grep -c "error"   # error count (track the burndown)
pnpm typecheck                     # MUST stay 0 — run after every batch
pnpm build                         # MUST exit 0
```

## Files To Inspect
`next.config.mjs` (confirms `eslint.ignoreDuringBuilds: true` + typescript NOT
ignored), `.eslintrc*` / eslint flat config, the full `pnpm lint` report, and the
disjoint set of `app/**` / `components/**` / `lib/**` / `server/**` files you own.
NEVER `app/utils/methods.tsx` or any file owned by a parallel workstream.

## Expected Output
A diff that lowers the ESLint error count, `pnpm typecheck` at 0, `pnpm build`
exiting 0, and a before/after error count noted for the orchestrator.

## Failure Signals
- `pnpm typecheck` goes above 0 after a batch (revert immediately).
- A new `eslint-disable` comment or a rule flipped off in config — that is masking,
  not fixing; stop.
- Editing `app/utils/methods.tsx` or a file another workstream owns — collision risk.
- Error count went up, or `pnpm build` no longer exits 0.

## Definition Of Done
- ESLint error count is lower than baseline with 0 new errors introduced.
- `pnpm typecheck` is 0 and `pnpm build` exits 0.
- No rules disabled, no blanket `eslint-disable`; exclusion list respected.
