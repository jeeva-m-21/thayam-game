# Architecture Decisions Record

> Captures key technical decisions for this project. Each decision references the authoritative spec section.

---

## ADR-001: Monorepo with pnpm + turborepo

**Context:** Rules engine must run identically on client and server (AGENTS.md §1).  
**Decision:** pnpm workspaces + turborepo, 5 packages: `rules-engine`, `shared`, `web`, `server`, plus root config.  
**Consequence:** Single `rules-engine` package consumed by both `web` (in-browser for local/AI) and `server` (authoritative for multiplayer).

---

## ADR-002: Rules engine has zero runtime dependencies

**Context:** AGENTS.md §9 mandates zero deps outside TS stdlib.  
**Decision:** `rules-engine` package.json has no `dependencies` — only `devDependencies` for types/testing.  
**Consequence:** Guarantees identical behavior client-side and server-side. No node-specific APIs, no browser APIs.

---

## ADR-003: Board data is a pluggable data object, not hardcoded

**Context:** AGENTS.md §5 defines the `BoardData` schema.  
**Decision:** Engine functions (`legalMoves`, `applyMove`) receive `BoardData` as a parameter (or it's injected into a factory). Phase 1 uses a synthetic placeholder; Phase 2 swaps in real data without touching engine code.  
**Consequence:** Phase 1 and Phase 2 can proceed somewhat independently. Engine correctness is board-shape-agnostic.

---

## ADR-004: Design tokens from single JSON source

**Context:** design.md §10 requires both CSS custom properties and TS objects from one source.  
**Decision:** `packages/shared/tokens/tokens.json` is the source of truth. A build script generates `tokens.css` and `tokens.ts` from it.  
**Consequence:** No drift between flat UI (Tailwind) and 3D materials (Three.js).

---

## ADR-005: 2D fallback built first (Phase 3 before Phase 4)

**Context:** AGENTS.md §4 mandates 2D before 3D.  
**Decision:** Phase 3 builds a fully playable flat client. Phase 4 adds 3D as an enhancement layer. The perf-tier system in Phase 4 falls back to the Phase 3 client, not a degraded 3D scene.  
**Consequence:** Accessibility floor guaranteed; 3D is progressive enhancement.

---

## ADR-006: i18n from first commit

**Context:** AGENTS.md §1 and §9 mandate bilingual (EN/TA) from the start.  
**Decision:** All user-facing strings go through `i18next` key system. CI checks key parity between `en.json` and `ta.json`.  
**Consequence:** No hardcoded English strings anywhere. Tamil is never second-class.

---

## ADR-007: Color tokens follow design.md §4.2, NOT the original AGENTS.md color table

**Context:** AGENTS.md §2 says design.md wins on visual decisions. The design.md §4.2 color palette (floor-oxide, kolam-chalk, brass, etc.) differs from a generic palette.  
**Decision:** Use design.md §4.2 tokens exclusively. The token names and hex values from that section are canonical.  
**Consequence:** Cultural authenticity maintained per design philosophy.

---

## ADR-008: Movement path representation

**Context:** AGENTS.md §5 defines the path as `outerSequence` + `homeStretchSequence`.  
**Decision:** A pawn's position is an index into `[...outerSequence, ...homeStretchSequence]` for its owning color. Movement = advance index by N. Transition from outer to home-stretch gated by `hasCutOpponent`.  
**Consequence:** Generic over any valid `BoardData`. Center must be the last element of `homeStretchSequence`.

---

## ADR-009: Server is authoritative, client is cosmetic

**Context:** AGENTS.md §4 Phase 6.  
**Decision:** In online multiplayer, client submits intended moves. Server validates via the same `rules-engine` and broadcasts resulting state. Client-side prediction is cosmetic only.  
**Consequence:** No client can cheat. Rules engine is the single source of truth on both sides.
