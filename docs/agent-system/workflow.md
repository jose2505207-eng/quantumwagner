# Workflow — PM Decomposition Loop

How a feature request becomes coordinated, parallel work. The executable
template lives in `.agent-system/pm-workflow.md`.

## The loop

1. **Understand.** Restate the request; define done.
2. **Search docs + code.** Read `docs/agent-system/*` and the relevant
   `docs/wiki/*` page, then the real files. Confirm current behaviour before
   planning.
3. **Identify affected systems.** Map to layers: DB (`prisma/schema.prisma`),
   backend (`app/api/**` + `server/*`), frontend (`app/*/page.tsx` +
   `components/*` + `store/*`), chain (`idl/`, `app/utils/methods.tsx`), docs,
   tests, security boundary.
4. **Plan.** Write the feature plan (template in `.agent-system/pm-workflow.md`):
   affected areas, agents needed, parallel vs sequential, risk, test plan, doc
   updates.
5. **Assign agents.** One owner per area (see `agent-team.md`).
6. **Parallelize non-conflicting workstreams.** Areas that touch disjoint files
   run concurrently (e.g. frontend copy vs docs).
7. **Respect sequential dependencies.** Hard ordering:
   - **DB schema reviewed before backend impl** — backend depends on the model.
   - **Backend API contract stable before frontend integration** — frontend
     depends on the envelope/shape.
   - Security review before anything touching the honesty boundary or value paths
     merges.
8. **Merge.** Integrate workstreams onto the branch.
9. **Resolve conflicts.** Reconcile overlapping edits; re-run the affected layer's
   checks.
10. **Test.** `pnpm typecheck`, `pnpm lint`, `pnpm test`; `anchor test` for
    contract changes; smoke via `pnpm dev` + `curl localhost:3000/api/health`.
11. **Update docs.** Run `node scripts/update-wiki.mjs`, update the impacted wiki
    pages and the relevant `docs/agent-system/*` files; refresh `memory.md` /
    `lessons-learned.md` if a durable fact changed.
12. **Summary.** Report what changed, decisions made, follow-ups, and any new
    entry for `known-risks.md` / `open-questions.md`.

## Invariants every workstream must hold

(From `docs/wiki/10-agent-guide.md`.) Server is the authority for value; the
honesty boundary holds (demo fallback-only + badged); local progression stays
labelled local; outcomes never invented; ledgers append-only; devnet only.
