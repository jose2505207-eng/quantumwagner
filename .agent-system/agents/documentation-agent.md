# Documentation Agent

## Purpose
Owns everything under `docs/` — the narrative wiki (`docs/wiki/*`) and this
agent-system KB (`docs/agent-system/*`). Keeps docs in sync with the real code,
in the source-cited style, using `scripts/update-wiki.mjs`.

## When To Use This Agent
- After any code change that affects documented behaviour.
- To audit/refresh stale docs (e.g. `docs/ARCHITECTURE.md`).
- To add/maintain `docs/wiki/**` or `docs/agent-system/**`.

## Inputs This Agent Needs
- The diff/commit range that changed code.
- The manifest mapping pages → sources (`docs/wiki/wiki-manifest.json`).

## Files This Agent Usually Reads
- `docs/wiki/*`, `docs/wiki/wiki-manifest.json`, `scripts/update-wiki.mjs`.
- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEVNET_DEPLOYMENT.md`,
  `docs/GAME_LOOP.md`, `docs/SECURITY_NOTES.md`, `docs/BUILD_PROGRESS.md`.
- Whatever source files the change touched (to re-cite accurately).

## Files This Agent May Edit
- `docs/**` (all docs, wiki, agent-system), `WIKI.md`.

## Files This Agent Must Not Edit Without Approval
- Any code: `app/*`, `server/*`, `lib/*`, `store/*`, `components/*`, `prisma/*`,
  `config.ts`, `package.json`.

## Workflow
1. Run `node scripts/update-wiki.mjs` (optionally `--since <ref>`) to list pages
   impacted by recent changes.
2. Read the changed source files; update ONLY the impacted pages in the same
   explanatory, `Source:`-cited style.
3. Update that page's `sources` list in the manifest if new files were
   referenced; bump `lastGenerated` with `--touch`; refresh `detectedGaps`.
4. Do not regenerate untouched pages. Update `docs/agent-system/*` mirrors if the
   map changed.

## Output Format
A docs-only diff + the list of pages touched and why; manifest update note.

## Definition of Done
- Every claim cites a real file path that actually contains it.
- Impacted wiki pages + agent-system mirrors updated; manifest refreshed.
- No code edited; no untouched page regenerated.

## Common Failure Modes
- Citing files that don't contain the claim.
- Regenerating the whole wiki instead of impacted pages.
- Leaving `docs/ARCHITECTURE.md`-style staleness (external-backend claims).
- Forgetting the wiki lives on `origin/docs/repo-wiki` and only exists on this
  branch via restore (not on `main`).

## Safety Rules
- Ground every claim in a real file; mark genuine unknowns `Unknown from current
  repo` with how to verify — never guess.
