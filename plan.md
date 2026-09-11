# plan.md
## Execution Plan — Thayam (Dayakattai) Digital Game

This is the working task list. `AGENTS.md` defines *what* each phase must achieve and its Definition of Done; this file breaks those phases into **small, ordered, independently-verifiable tasks** so an agent can execute productively without re-deriving scope each session.

**How to use this file (agent instructions):**
- Work top to bottom. Do not skip ahead to a later phase's tasks even if it seems faster.
- Check a box `[x]` only after its **Verify** step passes, not after the code is merely written.
- Commit after each task (conventional commits per AGENTS.md §9), referencing the task ID (e.g. `feat(rules-engine): implement dice roll resolution [P1-03]`).
- If a task is blocked (missing decision, ambiguous data), do not guess silently — add a note under **Blockers Log** at the bottom with the task ID, then move to the next non-dependent task if one exists.
- At the start of any new session, re-read this file's checkbox state before doing anything else — it is the single source of truth for "what's already done."

---

## Phase 0 — Scaffolding

- [ ] **P0-01** Initialize `pnpm-workspace.yaml` + `turbo.json`; create the five package folders from AGENTS.md §3 with minimal `package.json` + `tsconfig.json` in each.
  - *Verify:* `pnpm install && pnpm turbo run build` exits 0 on empty packages.
- [ ] **P0-02** Build `packages/shared/tokens`: transcribe design.md §4.2 colors and §4.3 type scale into `tokens.ts` (plain TS export) and `tokens.css` (CSS custom properties), generated from one JSON source (`tokens.json`) so they can't drift.
  - *Verify:* a one-line script imports `tokens.ts` and confirms every hex value matches design.md §4.2 exactly (string diff against a copied table).
- [ ] **P0-03** Scaffold `packages/shared/i18n/en.json` and `ta.json` with an initial empty-but-typed key structure (even a single placeholder key) so `i18next` config compiles.
  - *Verify:* a typecheck script fails if `en.json` and `ta.json` keys don't match 1:1 (write this check now — it pays off for the rest of the project).
- [ ] **P0-04** Set up `.github/workflows/ci.yml`: install → lint → typecheck → `vitest run` on every PR, matrix over the workspace packages.
  - *Verify:* open a throwaway PR with a trivial change; CI goes green end to end.

**Phase 0 exit check:** clean checkout → `pnpm i && pnpm turbo run build` → green CI on a PR. Do not proceed to Phase 1 until this is true.

---

## Phase 1 — Rules Engine

Work inside `packages/rules-engine`. This package has **zero runtime dependencies** — enforce this at task 01 and don't relax it later.

- [ ] **P1-01** Define `types.ts`: `PlayerColor`, `Cell`, `CellType`, `BoardData`, `PlayerPath`, `PawnState`, `GameState`, `Move`, `RollResult` per AGENTS.md §5 schema.
  - *Verify:* compiles standalone with no imports outside `types.ts` itself.
- [ ] **P1-02** Implement `dice.ts`: face values `[0,1,2,3]` per die, `resolveRoll(dieA, dieB): number` per the combination table in PRD §8.3, including the `0+0 → 12` override.
  - *Verify:* unit test enumerates all 16 combinations against the PRD §8.3 table exactly — 16/16 assertions pass.
- [ ] **P1-03** Implement a **placeholder** `board-data.ts` with a small synthetic board (e.g. 12-cell ring + 4-cell home stretch per color) satisfying the `BoardData` schema — *not* the real digitized board yet (that's Phase 2). This unblocks engine development without waiting on art.
  - *Verify:* passes the same symmetry/invariant script that Phase 2 will later run on the real board (write that checker now, reuse it in P2).
- [ ] **P1-04** Implement `moves.ts :: legalMoves(state, rollValue): Move[]` covering: off-board entry (roll===1 only), forward movement along a pawn's path, blocking on own-color occupancy, and exact-landing-on-center requirement (no overshoot).
  - *Verify:* table-driven unit tests, one per PRD §8.4 sub-rule (1 through 9), each asserting the exact legal-move set for a hand-constructed `GameState`.
- [ ] **P1-05** Implement `engine.ts :: applyMove(state, move): GameState` — cutting logic (non-safe cell, opponent pawn present → send home), turn-continuation on bonus rolls (1/5/6/12), turn-end otherwise, mandatory-move enforcement (reject a "pass" if a legal move exists).
  - *Verify:* unit tests for: a cut correctly clears the opponent pawn to off-board; a cut is *rejected* on a safe cell; rolling 6 grants another roll; rolling 3 with no bonus ends the turn.
- [ ] **P1-06** Implement inner-path unlock gate: `hasCutOpponent` flag per player, set true on first successful cut, checked in `moves.ts` before allowing outer→home-stretch transition.
  - *Verify:* unit test — a player with zero cuts has no legal moves generated into their home-stretch sequence even when the roll value would otherwise permit it; after a cut, the same roll does generate that move.
- [ ] **P1-07** Implement win detection: all 4 pawns at `center` → `GameState.winner` set, no further moves accepted.
  - *Verify:* unit test drives a hand-scripted sequence to a win and asserts the engine rejects any further `applyMove` calls afterward.
- [ ] **P1-08** Write the fuzz harness (AGENTS.md §8): random-legal-move AI, ≥1000 simulated 2–4 player games, invariant assertions after every move.
  - *Verify:* `vitest run fuzz.test.ts` passes at 1000 games with zero invariant violations and no game exceeding the move ceiling. If it fails, **fix the engine before continuing** — do not proceed to Phase 2 with a known fuzz failure.
- [ ] **P1-09** Coverage check.
  - *Verify:* `vitest run --coverage` shows 100% branch coverage on `moves.ts` and `engine.ts` specifically (package-wide 100% is not required, those two files are).

**Phase 1 exit check:** all boxes above checked, fuzz harness green, coverage gate met. This is the highest-leverage phase in the whole project — do not rush P1-08/P1-09.

---

## Phase 2 — Board Data Authoring

- [ ] **P2-01** Place the reference board image in `docs/thayam-reference.png` (or note its absence and proceed with the textual PRD §8.2 description if the image isn't available in-repo).
- [ ] **P2-02** Map all 49 cells of the 7×7 grid to the `Cell` schema: type, safety, owner. Cross-check against PRD §8.2: 4 home squares at edge midpoints, entry-arrow cell one behind each home, 8 total safe cells, shared center.
  - *Verify:* run the symmetry/invariant checker script from P1-03 against the real data — must confirm 90°-rotational symmetry across the 4 player paths and exactly 8 safe cells.
- [ ] **P2-03** Write `docs/board-data.md`: a human-readable rendering (ASCII grid or exported image) of the finished mapping.
  - *Verify:* **manual human sign-off checkpoint** — do not auto-proceed; flag this file for stakeholder review before wiring it in, per AGENTS.md §6.
- [ ] **P2-04** Replace the Phase 1 placeholder board with the real `board-data.ts`. Re-run the **entire** Phase 1 test suite and fuzz harness unmodified against the new data.
  - *Verify:* Phase 1's test suite and fuzz harness both still pass with zero code changes to `moves.ts`/`engine.ts` — this is what proves the Phase 1 abstraction was actually board-agnostic. If any engine code needs to change here, that's a signal Phase 1 leaked board assumptions and should be revisited.

---

## Phase 3 — 2D Fallback Client

Work inside `packages/web`. Build the flat client first — it's the fastest path to a genuinely playable, testable product surface.

- [ ] **P3-01** Scaffold Vite + React + Tailwind in `packages/web`, wire Tailwind config to consume `packages/shared/tokens/tokens.css`.
- [ ] **P3-02** Build a flat top-down SVG/Canvas board renderer driven purely by `BoardData` + `GameState` from `rules-engine` (no hardcoded positions in the component).
- [ ] **P3-03** Build pawn rendering + tap handling → calls `legalMoves`/`applyMove` from the engine; disallow any UI action the engine wouldn't accept.
- [ ] **P3-04** Build the dice-tray UI (flat version) with the roll → bonus-roll → turn-end flow surfaced per design.md §6.3.
- [ ] **P3-05** Wire `i18next` with the en/ta files; implement the contextual-teaching pattern (glow + one-line anchored label) from design.md §6.1–6.2 for: entry, cutting, safe zones, inner-path lock.
- [ ] **P3-06** Wire local pass-and-play (2–4 players, one device, turn-based screen state) and vs-AI mode (consumes `ai.ts` — stub it minimally here if Phase 5 isn't done yet, e.g. random-legal-move, and revisit).
  - *Verify:* manual playtest checklist — 10 full games (mix of 2/3/4 players) completed start-to-finish with zero rules-engine-observable bugs; both languages checked; no hardcoded English strings found (grep check).

**Phase 3 exit check:** a stakeholder can open the dev server and play a complete game, in either language, today. This is the first genuinely demoable milestone — worth flagging to stakeholders when reached.

---

## Phase 4 — 3D Presentation Layer

- [ ] **P4-01** Author/source `.glb` models: board, 4 pawn variants (or 1 model × 4 material instances), dice. Run through `gltf-transform` Draco compression; confirm against the ≤8MB total budget (AGENTS.md §10).
- [ ] **P4-02** Build the R3F scene: board mesh with etched-inlay materials (design.md §5.4), fixed 3/4 camera (design.md §5.2).
- [ ] **P4-03** Implement dice physics roll via `@react-three/rapier` per design.md §5.3 (drop, settle 0.9–1.3s, legible pip read, brass bonus-roll pulse).
- [ ] **P4-04** Implement pawn move animation (arc-hop, distance-scaled speed) and cut animation (lift/tip/slide-off) per design.md §5.4/§8.
- [ ] **P4-05** Implement the performance-tier probe + switch (Full 3D / Reduced 3D / 2D Fallback) — Reduced and 2D must reuse the Phase 3 client's board logic, not fork it.
- [ ] **P4-06** Implement turn-camera rotation for local pass-and-play (design.md §5.2, 400ms eased).
  - *Verify:* Playwright + device emulation confirms: Full-3D hits ≥30fps steady-state and ≤2.5s first-render on the reference mid-tier profile; forcing a low-end profile correctly falls back to Reduced/2D without a broken scene; `prefers-reduced-motion` correctly disables physics/camera-rotation/pulse per design.md §8.

---

## Phase 5 — AI Opponent

- [ ] **P5-01** Implement the scoring function in `ai.ts` per AGENTS.md §7's weight table, parameterized by difficulty tier.
- [ ] **P5-02** Implement Easy (weighted + 40% random override) and Medium (pure top-score) tiers.
- [ ] **P5-03** Implement Hard tier (1-ply lookahead re-scoring).
- [ ] **P5-04** Replace the Phase 3 placeholder AI with this module.
  - *Verify:* simulated tournament, ≥100 games per pairing (Easy-vs-Medium, Medium-vs-Hard, Easy-vs-Hard) — win rates strictly ordered Hard > Medium > Easy; confirm zero illegal moves logged across all games (should be structurally impossible, but assert it anyway).

---

## Phase 6 — Online Multiplayer

Work inside `packages/server`.

- [ ] **P6-01** Scaffold Fastify + socket.io server; room creation/join (2–4 players) via `rooms.ts`.
- [ ] **P6-02** Implement `authoritative.ts`: server holds the canonical `rules-engine` `GameState`; clients submit intended moves, server validates via `legalMoves`/`applyMove` and broadcasts the resulting state — never trust a client-sent state.
- [ ] **P6-03** Implement reconnect grace period (PRD FR-14) and the disconnect/reconnect UX states from design.md §6.5.
- [ ] **P6-04** Wire the `packages/web/src/net` client: socket.io client, optimistic local move rendering reconciled against server broadcast.
  - *Verify:* two independent browser profiles complete a full match; killing one client's network mid-match and restoring it within the grace period resumes correctly; exceeding the grace period ends the match with the correct copy from design.md §6.5.

---

## Phase 7 — Hardening & Deployment

- [ ] **P7-01** Accessibility pass: screen-reader live-region announcements for every state change (design.md §9), tap-target audit (≥48×48dp effective hit area on all pawns/dice), dynamic-type scaling to 130%.
- [ ] **P7-02** Run the Anti-Genericness Checklist (design.md §11) against every shipped screen; log and fix any unchecked item.
- [ ] **P7-03** Write `packages/server/Dockerfile`; write `.github/workflows/deploy.yml` — on merge to `main`: build+deploy `web` to Vercel, build+push Docker image+deploy `server` to Fly.io.
- [ ] **P7-04** Populate `packages/server/.env.example`; confirm no secrets are committed (`git log -p` scan or a secret-scanning CI step).
- [ ] **P7-05** Write the root `README.md`: what this is, local dev setup, and the live URL.
- [ ] **P7-06** Run the full **Final Acceptance Checklist** from AGENTS.md §10, end to end, against the live deployed URL — not local dev.

**Project exit check:** every box in AGENTS.md §10 is checked against the *live* URL. Only then is this project done.

---

## Blockers Log

*(Agent: append here whenever a task is blocked on a missing decision or ambiguous input, rather than guessing silently. Format: `[Task ID] — description — proposed default if unblocked later`.)*

-

---

## Progress Snapshot

*(Optional: agent may maintain a one-line rolling summary here at the end of each session — current phase, last completed task ID, next task ID — to speed up context recovery at the start of the next session.)*

-