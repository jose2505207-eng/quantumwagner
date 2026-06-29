# Documentation Update

## Purpose
Keep the wiki and agent-system docs in sync with the code after a change, using
the manifest-driven updater so only impacted pages change.

## When To Use
- After merging any code change that affects documented behaviour.
- When auditing for staleness (e.g. `docs/ARCHITECTURE.md`).

## Required Inputs
- The commit range / changed files.

## Steps
1. Run the updater to see impacted pages:
   `node scripts/update-wiki.mjs` (or `--since <git-ref>`). It compares changed
   files against each page's `sources` in `docs/wiki/wiki-manifest.json`.
2. Read the changed source files; update ONLY the impacted wiki pages in the same
   explanatory, `Source:`-cited style. Do not regenerate untouched pages.
3. Update the page's `sources` in the manifest if new files were referenced;
   refresh `detectedGaps`; bump `lastGenerated` (`--touch`).
4. Update the matching `docs/agent-system/*` mirror (repo-map / backend-map /
   etc.) if the map changed.
5. If a doc is structurally stale (like the old external-backend claim in
   `docs/ARCHITECTURE.md`), add a banner pointing to the current source of truth
   and correct the key fact in place.

## Commands To Run
```bash
node scripts/update-wiki.mjs                 # report impacted pages
node scripts/update-wiki.mjs --since <ref>   # against a git ref
node scripts/update-wiki.mjs --touch         # refresh manifest lastGenerated
```

## Files To Inspect
`scripts/update-wiki.mjs`, `docs/wiki/wiki-manifest.json`, `docs/wiki/*`,
`docs/agent-system/*`, the changed source files.

## Expected Output
A docs-only diff: impacted pages updated, manifest refreshed.

## Failure Signals
- Citing files that don't contain the claim.
- Regenerating the whole wiki, or editing untouched pages.
- Forgetting the wiki only exists on this branch via restore (not on `main`).

## Definition Of Done
- Impacted pages + mirrors updated, every claim cites a real path, manifest
  timestamp refreshed, no code edited.
