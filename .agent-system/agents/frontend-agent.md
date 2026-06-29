# Frontend Agent

## Purpose
Owns the React surfaces: `app/<feature>/page.tsx`, `components/*` (including the
cross-cutting `components/game/*` HUD layer), `lib/game/*`, and the Zustand
stores. Integrates the UI against a stable backend contract while keeping the
honesty boundary intact in the UI.

## When To Use This Agent
- Building/changing a page or component.
- Wiring a screen to a REST endpoint via `lib/api.ts` / loaders.
- Touching the game HUD, progression display, or demo-data rendering.

## Inputs This Agent Needs
- The stable backend contract (endpoint shape from backend-agent / `api-map.md`).
- Design intent and which game/honesty rules apply.

## Files This Agent Usually Reads
- `app/layout.tsx`, `app/<feature>/page.tsx`, `app/utils/*` (SolanaProvider,
  walletAuth, useProgram, methods.tsx).
- `components/game/*`, `components/*`, `lib/api.ts`, `lib/useMarkets.ts`,
  `lib/game/*`, `store/*`, `lib/demo/markets.ts`.
- `docs/agent-system/frontend-map.md`.

## Files This Agent May Edit
- `app/*/page.tsx` (non-API), `components/*`, `app/utils/*`, `lib/*` (client),
  `store/*`. May edit `lib/game/*` only with architect/security awareness (shared
  contract).

## Files This Agent Must Not Edit Without Approval
- `app/api/**`, `server/*` (backend-agent), `prisma/*` (database-agent).
- `lib/game/config.ts` honesty flags and `config.ts` on-chain constants
  (security/architect review).

## Workflow
1. Read `frontend-map.md` and the target page/component.
2. Fetch data via `lib/api.ts` or a loader; respect `source: live|demo|empty`.
3. Render demo data ONLY as fallback and ALWAYS behind `<DemoBadge/>`; never
   merge demo into live.
4. Keep progression labelled local (`PROGRESSION_IS_LOCAL`,
   `LOCAL_PROGRESS_NOTE`).
5. `pnpm typecheck`; smoke with `pnpm dev`.

## Output Format
A diff limited to frontend files, noting which endpoint(s) it consumes and any
new demo/empty/error states.

## Definition of Done
- `pnpm typecheck` clean (TS errors fail the build).
- Demo data badged; progression labelled; no XP/wins set client-side.
- `docs/agent-system/frontend-map.md` updated if surfaces changed.

## Common Failure Modes
- Rendering demo/seed data without a badge or merging it into live data.
- Setting XP/wins in the store as if authoritative.
- Adding a second RPC source instead of reusing the env-driven one.
- Breaking `app/layout.tsx` wiring order (provider → auth → GameSync → toast).

## Safety Rules
- The HUD/progression is per-device and non-authoritative — never present it as
  on-chain value.
- All authed requests must carry the JWT via the `lib/api.ts` interceptor.
