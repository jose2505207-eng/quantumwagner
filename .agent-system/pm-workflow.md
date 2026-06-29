# PM Workflow — Parallel Decomposition

How the orchestrator turns a feature request into coordinated, parallel work
across the specialized agents (`agents/*`). Companion narrative:
`docs/agent-system/workflow.md`.

## The loop

1. **Understand** — restate the request; define "done".
2. **Search docs + code** — read `docs/agent-system/*` + the relevant
   `docs/wiki/*`, then the real files. Confirm current behaviour.
3. **Identify affected systems** — DB / backend / frontend / chain / docs / tests
   / security boundary.
4. **Plan** — fill the feature-plan template below.
5. **Assign agents** — one owner per area (`agents/*`).
6. **Parallelize non-conflicting workstreams** — disjoint file sets run
   concurrently.
7. **Respect sequential dependencies** (hard ordering):
   - **DB schema reviewed (database-agent) BEFORE backend implementation**
     (backend-agent) — the backend depends on the model.
   - **Backend API contract stable BEFORE frontend integration**
     (frontend-agent) — the UI depends on the envelope/shape.
   - **Security review BEFORE merging anything touching the honesty boundary or
     value paths.**
8. **Merge** onto the branch.
9. **Resolve conflicts** in overlapping edits; re-run the affected layer's checks.
10. **Test** — `pnpm typecheck`, `pnpm lint`, `pnpm test`; `anchor test` for
    contract changes; smoke via `pnpm dev` + `curl localhost:3000/api/health`.
11. **Update docs** — `node scripts/update-wiki.mjs`, update impacted wiki pages +
    `docs/agent-system/*`; update `memory.md` / `lessons-learned.md` if a durable
    fact changed.
12. **Summary** — what changed, decisions, follow-ups, new risks/questions.

## Feature-plan template

```
### Feature Request
<one-paragraph statement + definition of done>

### Affected Areas
- DB:        <models in prisma/schema.prisma, or "none">
- Backend:   <app/api/** routes + server/*.ts>
- Frontend:  <app/*/page.tsx + components/* + store/*>
- Chain:     <idl/ + app/utils/methods.tsx, or "none">
- Docs:      <wiki pages + docs/agent-system/*>
- Tests:     <test/** specs + anchor test?>
- Security:  <honesty-boundary / value-path impact>

### Agents Needed
<from .agent-system/agents/*>

### Parallel Workstreams
<disjoint file sets that can run concurrently>

### Sequential Dependencies
- DB schema reviewed BEFORE backend impl.
- Backend API contract stable BEFORE frontend integration.
- Security review BEFORE merging value/boundary changes.

### Risk Level
<low | medium | high> + why (esp. any value/trust path).

### Test Plan
<which Vitest specs / curl smokes / anchor test>

### Documentation Updates
<which wiki pages + agent-system files + update-wiki.mjs run>

### Final Merge Plan
<order of merge, conflict points, gates that must be green>
```

## Invariants every workstream must hold
Server is the authority for value; honesty boundary holds (demo fallback-only +
badged); local progression labelled; outcomes never invented; ledgers
append-only; devnet only. (`docs/wiki/10-agent-guide.md`.)
