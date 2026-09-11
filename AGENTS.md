# AGENTS.md
## Build Contract — Thayam (Dayakattai) Digital Game

This file is the operating manual for any coding agent (Claude Code or equivalent) working in this repository. It is written to be sufficient, on its own plus the two companion documents below, to take this project from empty repo to a deployed, playable, rules-accurate product without further clarification. Where a decision is genuinely open, it is marked **[DECISION NEEDED]** — everything else is locked and should not be re-litigated mid-build.

**Read these three files, in this order, before writing any code:**
1. `Thayam_PRD.md` — product requirements, full rules specification (Section 8 is the authoritative rules source)
2. `design.md` — visual identity, 3D system, UX flows, motion/accessibility rules
3. `AGENTS.md` (this file) — how to actually build it

If any implementation choice conflicts with `design.md` or `Thayam_PRD.md`, those two win; this file governs *process and architecture*, not visual or rules decisions.

---

## 1. Mission & Non-Negotiables

Build a deployment-ready, cross-platform (web + responsive mobile web) implementation of Classic Thayam (Section 6.1 of the PRD: 4 pawns, 2–4 players, 7×7 board) with:
- A **provably correct rules engine**, unit-tested to the rule set in PRD Section 8, shared identically between client (local/AI play) and server (online multiplayer) so no client can cheat.
- A **tiered 3D presentation** per `design.md` Section 5.5 (Full 3D / Reduced 3D / 2D Fallback), never blocking gameplay on device capability.
- **Bilingual (English/Tamil)** UI from the first commit, not bolted on later.
- A **real CI/CD pipeline** ending in a live, reachable deployment — "done" means there is a URL a stakeholder can open and play, not a `localhost` demo.

**Non-negotiable gates (a phase is not complete until these pass):**
- Rules engine: 100% branch coverage on cutting, safe-zone, inner-path-unlock, and win-condition logic.
- No gameplay-critical state conveyed by color or motion alone (design.md §9).
- Full-3D tier holds ≥30fps steady-state on the reference mid-tier device profile (design.md §5.5) — if it doesn't, ship that build on Reduced 3D, don't lower the bar.
- Every PR includes updated/passing tests before merge; no direct pushes to `main`.

---

## 2. Tech Stack (locked)

| Layer | Choice | Why |
|---|---|---|
| Monorepo tooling | `pnpm` workspaces + `turborepo` | Shared rules-engine package consumed by both client and server without duplication or drift |
| Rules engine | TypeScript, framework-agnostic, zero UI dependencies | Must run identically in-browser (AI/local play) and on the server (authoritative multiplayer) |
| Client framework | React 18 + TypeScript + Vite | Fast dev loop, wide hiring pool, first-class Three.js interop |
| 3D rendering | `three.js` via `@react-three/fiber` + `@react-three/drei` | Declarative R3F integrates cleanly with React state; drei covers loaders/helpers |
| Dice physics | `@react-three/rapier` (Rapier physics) | Real rigid-body cuboid dice roll per design.md §5.3, WASM-based, performant on mobile |
| Client state | `zustand` | Minimal boilerplate, easy to slice game-state vs. UI-state, testable outside React |
| Styling (flat UI layer) | Tailwind CSS, configured from the design-token file (design.md §10) | Tokens-as-code requirement; utility classes keep the "chrome" layer fast to build correctly |
| i18n | `i18next` + `react-i18next` | Mature, supports the en/ta key-based pipeline required in design.md §10 |
| Multiplayer transport | `socket.io` (client + server) | Reliable reconnect handling (PRD FR-14) out of the box |
| Server | Node.js 20 LTS + TypeScript + Fastify | Lightweight, fast startup, good WS support alongside HTTP |
| AI opponent | Pure TS module in `packages/rules-engine`, heuristic (not ML) for v1 | Dice-variance-heavy game; a tuned heuristic bot (move-priority scoring) is sufficient and testable — see §7 |
| Testing | `vitest` (unit/integration), `playwright` (e2e) | Fast TS-native unit runner; Playwright for cross-browser + mobile viewport e2e |
| CI/CD | GitHub Actions | Standard, free for public/small private repos, wide support |
| Client hosting | Vercel (static + edge) | Zero-config Vite deploys, preview URLs per PR |
| Server hosting | Fly.io (Dockerized Fastify + socket.io) | WebSocket-friendly, simple multi-region if needed later |
| Asset pipeline | Blender → glTF (`.glb`), Draco-compressed via `gltf-transform` | Meets the ≤8MB total 3D payload budget in design.md §10 |

**[DECISION NEEDED]** Analytics/crash reporting vendor (e.g., PostHog vs. Sentry-only) is not selected — stub an analytics interface (`packages/shared/analytics.ts`) so a vendor can be wired in without touching call sites.

---

## 3. Repository Structure

```
thayam/
├── AGENTS.md
├── Thayam_PRD.md
├── design.md
├── turbo.json
├── pnpm-workspace.yaml
├── packages/
│   ├── rules-engine/        # pure TS, zero deps on React/Three — the single source of truth
│   │   ├── src/
│   │   │   ├── board.ts          # board data model + path abstraction (see §5)
│   │   │   ├── dice.ts           # dice combination table + roll resolution (PRD §8.3)
│   │   │   ├── moves.ts          # legal-move generation
│   │   │   ├── engine.ts         # turn state machine: apply(move) -> GameState
│   │   │   ├── ai.ts             # heuristic bot (see §7)
│   │   │   └── types.ts
│   │   └── test/                 # vitest — this package carries the 100%-branch-coverage gate
│   ├── shared/               # design tokens as code, i18n keys, analytics interface, DTOs
│   │   ├── tokens/            # generated from design.md §4.2–4.3 — single source for CSS vars + 3D materials
│   │   ├── i18n/en.json
│   │   └── i18n/ta.json
│   ├── web/                  # React + Vite client
│   │   ├── src/
│   │   │   ├── scenes/            # R3F board, dice, pawn components
│   │   │   ├── ui/                # flat chrome layer (Tailwind)
│   │   │   ├── state/             # zustand stores (bind to rules-engine, never reimplement rules)
│   │   │   ├── tiers/             # perf probe + Full/Reduced/2D tier switch (design.md §5.5)
│   │   │   └── net/               # socket.io client, reconnect handling
│   │   └── public/assets/3d/      # .glb models
│   └── server/                # Fastify + socket.io, authoritative game host
│       ├── src/
│       │   ├── rooms.ts           # match/room lifecycle, reconnect grace period (PRD FR-14)
│       │   ├── authoritative.ts   # wraps rules-engine; rejects client-submitted illegal moves
│       │   └── index.ts
│       └── Dockerfile
├── .github/workflows/
│   ├── ci.yml               # lint + typecheck + unit + e2e on every PR
│   └── deploy.yml           # on merge to main: deploy web (Vercel) + server (Fly.io)
└── docs/
    └── board-data.md        # output of the board-digitization task, §6
```

---

## 4. Build Order (execute phases in sequence — do not parallelize across phases)

Each phase ends with a **Definition of Done (DoD)**. Do not start the next phase until the current one's DoD is fully met and committed.

### Phase 0 — Scaffolding
- Initialize pnpm workspace + turborepo, all five packages above with empty entry points.
- Wire up `packages/shared/tokens` from design.md §4.2 (color) and §4.3 (type) as both a CSS custom-properties file and a plain TS object (for Three.js materials to import the same hex values — one source, two consumers).
- Set up GitHub Actions `ci.yml`: install, lint, typecheck, `vitest run`, on every PR.
- **DoD:** `pnpm turbo run build` succeeds on a clean checkout; CI is green on an empty-but-structured repo.

### Phase 1 — Rules Engine (highest-priority phase; everything depends on it)
- Implement the board data model and path abstraction (§5 below).
- Implement `dice.ts` exactly per PRD §8.3, including the 0+0→12 override.
- Implement `moves.ts`: legal-move generation covering entry (roll=1), forward movement, own-pawn-occupancy block, mandatory-move rule (PRD §8.4.4).
- Implement `engine.ts` turn state machine: bonus-roll re-roll (1/5/6/12), turn-end condition, cutting (with safe-zone exemption), inner-path unlock gate (requires ≥1 cut), win condition (all 4 pawns at center).
- Write the full PRD §8.5 rule table as **executable test cases** — every row of that table must have at least one corresponding unit test.
- **DoD:** `packages/rules-engine` has 100% branch coverage on `moves.ts` and `engine.ts`; a scripted full game (4 AI-random players) can run to completion in a test without ever reaching an illegal state (fuzz test, ≥1000 simulated games, zero invariant violations — see §8).

### Phase 2 — Board Data Authoring (blocks 3D work, can run parallel to late Phase 1)
- Digitize the exact board geometry from the reference art (`thayam.png` referenced in the PRD) into the path-abstraction schema defined in §5. This is a **data-authoring task, not a rules-logic task** — the algorithm in Phase 1 must be written generically enough that plugging in the real board data doesn't require touching engine code.
- Output: `docs/board-data.md` (human-readable diagram + coordinate table) and `packages/rules-engine/src/board-data.ts` (the consumed data).
- Verify: all 4 player home positions symmetric under 90° rotation; exactly 8 safe squares including 4 homes + center + 3 others per PRD §8.2; inner-path entry point is exactly one square behind each home.
- **DoD:** board-data passes an automated symmetry/invariant check (script, not manual eyeballing) and is reviewed against `design.md` §5.1 (etched-inlay treatment expectations).

### Phase 3 — 2D Fallback Client (build this before 3D — it's the accessibility/perf floor and the fastest way to get the rules engine visibly playable)
- Flat top-down board (SVG or Canvas), same palette/iconography tokens as 3D per design.md §5.5.
- Full pass-and-play + vs-AI playable end to end.
- Wire i18n (en/ta) and the contextual-teaching pattern from design.md §6.1–6.2.
- **DoD:** a full 2–4 player local game is playable start to finish in a browser, in both languages, with zero rules-engine bugs (manual playtest checklist, ≥10 full games).

### Phase 4 — 3D Presentation Layer (Full + Reduced tiers)
- Build board/dice/pawn 3D assets and materials per design.md §5.4.
- Implement dice physics roll (§5.3) via `@react-three/rapier`.
- Implement the perf-probe tier switch (design.md §5.5) — must gracefully fall back to the Phase 3 2D client, not a broken 3D scene, on failure.
- Implement fixed-camera + turn-rotation behavior (design.md §5.2).
- **DoD:** Full-3D tier hits the ≥30fps / ≤2.5s-first-render budget on the reference device; Reduced and 2D tiers verified on low-end device emulation in Playwright.

### Phase 5 — AI Opponent
- Implement heuristic bot per §7 below, three difficulty tiers.
- **DoD:** bot never makes an illegal move (enforced by construction — it can only call `moves.ts`'s legal-move generator); difficulty tiers produce measurably different win rates against each other in a simulated tournament (Easy < Medium < Hard, ≥100 games each pairing).

### Phase 6 — Online Multiplayer
- Server hosts authoritative `rules-engine` instance per room; client submits *intended* moves, server validates and broadcasts resulting state — client-side prediction is cosmetic only, never trusted.
- Reconnect grace period per PRD FR-14; disconnect/reconnect UX per design.md §6.5.
- **DoD:** 2–4 player match playable across independent browser sessions; killing and restoring one client's network mid-match resolves per the disconnect UX spec without corrupting game state.

### Phase 7 — Hardening & Deployment
- Full accessibility pass against design.md §9 (screen-reader announcements, tap-target audit, reduced-motion behavior, text scaling).
- Run the Anti-Genericness Checklist (design.md §11) against every screen.
- Wire `deploy.yml`: merge to `main` → build + deploy `web` to Vercel, build + push Docker image + deploy `server` to Fly.io.
- **DoD:** a public URL is live, serves the production build, supports a full online multiplayer match between two real devices, and every item in §10 of this file (Final Acceptance Checklist) is checked.

---

## 5. Board & Path Data Model

The rules engine must never hardcode board geometry inline — it consumes a data object matching this schema, so Phase 2's real board data drops in without touching engine logic.

```ts
type CellType = 'outer' | 'inner' | 'home-stretch' | 'center' | 'off-board';

interface Cell {
  id: string;              // stable identifier, e.g. "outer-17"
  type: CellType;
  isSafe: boolean;          // true for the 8 safe squares (PRD §8.2)
  ownerColor?: PlayerColor;  // set for home-stretch cells and home cell
}

interface PlayerPath {
  color: PlayerColor;
  homeCellId: string;
  entryCellId: string;       // where a pawn lands on a roll of 1
  // ordered list of cell ids this color's pawns traverse, outer ring
  // (shared sequence, but each color has a different *starting offset*
  // into the shared ring) followed by that color's private home-stretch
  // cells, ending at the shared center cell.
  outerSequence: string[];
  homeStretchSequence: string[]; // private inner path, ends at 'center'
}

interface BoardData {
  cells: Record<string, Cell>;
  players: Record<PlayerColor, PlayerPath>;
  centerCellId: string;
}
```

**Movement algorithm (generic over any valid `BoardData`):**
1. A pawn's position is either `off-board` or an index into `[...outerSequence, ...homeStretchSequence]` for its owning color.
2. Moving N squares = advancing that index by N, unless it would move *past* `homeStretchSequence.length - 1` (i.e., past center) — that move is illegal (must land exactly on center or short of it; PRD §8.2 "needs to move the exact number of spaces").
3. Transition from `outerSequence` to `homeStretchSequence` is only permitted if `player.hasCutOpponent === true` for the current game (PRD §8.4.8) — enforced in `moves.ts`, not left to the UI.
4. Cutting: after a move, if the destination cell `isSafe === false` and is occupied by ≥1 opposing pawn, all opposing pawns there are sent to `off-board`.

This abstraction is deliberately board-shape-agnostic so the Phase 2 digitization task cannot accidentally require an engine rewrite.

---

## 6. Board Digitization Task (Phase 2 detail)

The PRD references a reference image (`thayam.png`) showing the color/direction layout but exact per-cell coordinates were not extracted during requirements-gathering. Before Phase 2:

1. Import the reference image into `docs/`.
2. Manually (or via an assisted grid-overlay script) map each of the 49 grid cells to a `Cell` per the schema in §5, confirming against PRD §8.2's textual description: 7×7 grid, 4 colored home squares at edge midpoints, 8 safe spots (crosses) including all 4 homes, entry-arrow cell one square behind each home, center cell as shared destination.
3. Produce `docs/board-data.md` with an ASCII or image rendering of the finished mapping for human sign-off **before** wiring it into `board-data.ts` — this is a cheap human-review checkpoint on a task that's otherwise hard to unit-test for "is this what the real game looks like."

---

## 7. AI Opponent Specification

Heuristic, not ML — the branching factor per turn (which pawn to move, given a roll) is small enough that a scored-move heuristic is both sufficient and fully deterministic/testable.

**Move scoring (highest score wins, per difficulty tier weight table):**

| Factor | Description | Weight (Easy / Medium / Hard) |
|---|---|---|
| Completes a cut | Move lands on an opponent's pawn on a non-safe cell | 1 / 3 / 5 |
| Escapes a threatened cell | Move takes a pawn off a cell an opponent could reach next turn | 0 / 2 / 4 |
| Advances toward inner-unlock | Prioritizes any cut opportunity if `hasCutOpponent === false` | 0 / 3 / 5 |
| Enters a new pawn on a roll of 1 | Bring a pawn into play rather than advance an existing one | 1 / 1 / 2 |
| Moves onto a safe cell | Defensive positioning | 0 / 1 / 3 |
| Raw distance advanced | Tiebreaker only | 1 / 1 / 1 |

- **Easy:** weights above + 40% chance to ignore the top-scored move and pick randomly among legal moves (simulates a beginner).
- **Medium:** weights above, always picks top-scored move, no lookahead.
- **Hard:** weights above + 1-ply lookahead (simulate the resulting board state and re-score for immediate opponent threat before committing).

All three tiers call the exact same `moves.ts` legal-move generator used by the human client and the multiplayer server — an AI illegal move is impossible by construction, not by testing.

---

## 8. Fuzz / Invariant Testing (required, not optional)

Write a fuzz harness in `packages/rules-engine/test/fuzz.test.ts`:
- Simulate ≥1000 full 2–4 player games with random-legal-move AI.
- After every single move application, assert invariants:
  - No non-safe cell holds >1 pawn.
  - No pawn is on `homeStretchSequence` for a player with `hasCutOpponent === false`.
  - Total pawn count per player is always exactly 4 across (off-board + in-play + home).
  - Game terminates (no infinite loop) within a reasonable move ceiling (flag, don't silently pass, if any simulated game exceeds e.g. 2000 moves — investigate before Phase 1 DoD is signed off).

This harness is what actually earns the "provably correct" claim in §1 — code review alone will not catch every edge case in the bonus-roll/mandatory-move interaction.

---

## 9. Coding Standards

- TypeScript strict mode everywhere, no `any` in `rules-engine` or `server` packages.
- `rules-engine` package has **zero runtime dependencies** outside the TS standard library — this is what guarantees it behaves identically on client and server.
- Conventional commits (`feat:`, `fix:`, `test:`, `chore:`) — CI can later gate semantic-release off this if needed.
- One PR per phase-subtask, not one PR per file; PR description must state which DoD item(s) it advances.
- No screen ships without being checked against the Anti-Genericness Checklist (design.md §11) — paste the checked checklist into the PR description for any UI-touching PR.
- All user-facing strings go through the i18n key system from the first line of code that renders them — never hardcode an English string in a component, even temporarily.

---

## 10. Final Acceptance Checklist (deployment-ready = every box checked)

- [ ] Live URL serves the production client build over HTTPS.
- [ ] Server deployment is live, health-checked, and auto-restarts on crash (Fly.io process config).
- [ ] Full game playable start-to-finish in: vs-AI, local pass-and-play, and online multiplayer modes.
- [ ] Rules engine: 100% branch coverage + fuzz harness (§8) passing at ≥1000 simulated games with zero invariant violations.
- [ ] All three 3D performance tiers verified on real or emulated reference devices (design.md §5.5).
- [ ] English and Tamil fully functional, switchable at any time, no untranslated strings (automated i18n-key-coverage check in CI).
- [ ] Accessibility: screen-reader announcements, tap-target audit, `prefers-reduced-motion` behavior, dynamic-type scaling all verified (design.md §9).
- [ ] Anti-Genericness Checklist (design.md §11) passes on every shipped screen.
- [ ] CI pipeline green on `main`; deploy pipeline has run successfully at least once end-to-end (not just dry-run).
- [ ] No secrets/keys committed; server env vars documented in `packages/server/.env.example`.
- [ ] `README.md` at repo root (write this last) gives a stakeholder: what this is, how to run it locally, and the live URL.

---

*End of Document*# AGENTS.md
## Build Contract — Thayam (Dayakattai) Digital Game

This file is the operating manual for any coding agent (Claude Code or equivalent) working in this repository. It is written to be sufficient, on its own plus the two companion documents below, to take this project from empty repo to a deployed, playable, rules-accurate product without further clarification. Where a decision is genuinely open, it is marked **[DECISION NEEDED]** — everything else is locked and should not be re-litigated mid-build.

**Read these three files, in this order, before writing any code:**
1. `Thayam_PRD.md` — product requirements, full rules specification (Section 8 is the authoritative rules source)
2. `design.md` — visual identity, 3D system, UX flows, motion/accessibility rules
3. `AGENTS.md` (this file) — how to actually build it

If any implementation choice conflicts with `design.md` or `Thayam_PRD.md`, those two win; this file governs *process and architecture*, not visual or rules decisions.

---

## 1. Mission & Non-Negotiables

Build a deployment-ready, cross-platform (web + responsive mobile web) implementation of Classic Thayam (Section 6.1 of the PRD: 4 pawns, 2–4 players, 7×7 board) with:
- A **provably correct rules engine**, unit-tested to the rule set in PRD Section 8, shared identically between client (local/AI play) and server (online multiplayer) so no client can cheat.
- A **tiered 3D presentation** per `design.md` Section 5.5 (Full 3D / Reduced 3D / 2D Fallback), never blocking gameplay on device capability.
- **Bilingual (English/Tamil)** UI from the first commit, not bolted on later.
- A **real CI/CD pipeline** ending in a live, reachable deployment — "done" means there is a URL a stakeholder can open and play, not a `localhost` demo.

**Non-negotiable gates (a phase is not complete until these pass):**
- Rules engine: 100% branch coverage on cutting, safe-zone, inner-path-unlock, and win-condition logic.
- No gameplay-critical state conveyed by color or motion alone (design.md §9).
- Full-3D tier holds ≥30fps steady-state on the reference mid-tier device profile (design.md §5.5) — if it doesn't, ship that build on Reduced 3D, don't lower the bar.
- Every PR includes updated/passing tests before merge; no direct pushes to `main`.

---

## 2. Tech Stack (locked)

| Layer | Choice | Why |
|---|---|---|
| Monorepo tooling | `pnpm` workspaces + `turborepo` | Shared rules-engine package consumed by both client and server without duplication or drift |
| Rules engine | TypeScript, framework-agnostic, zero UI dependencies | Must run identically in-browser (AI/local play) and on the server (authoritative multiplayer) |
| Client framework | React 18 + TypeScript + Vite | Fast dev loop, wide hiring pool, first-class Three.js interop |
| 3D rendering | `three.js` via `@react-three/fiber` + `@react-three/drei` | Declarative R3F integrates cleanly with React state; drei covers loaders/helpers |
| Dice physics | `@react-three/rapier` (Rapier physics) | Real rigid-body cuboid dice roll per design.md §5.3, WASM-based, performant on mobile |
| Client state | `zustand` | Minimal boilerplate, easy to slice game-state vs. UI-state, testable outside React |
| Styling (flat UI layer) | Tailwind CSS, configured from the design-token file (design.md §10) | Tokens-as-code requirement; utility classes keep the "chrome" layer fast to build correctly |
| i18n | `i18next` + `react-i18next` | Mature, supports the en/ta key-based pipeline required in design.md §10 |
| Multiplayer transport | `socket.io` (client + server) | Reliable reconnect handling (PRD FR-14) out of the box |
| Server | Node.js 20 LTS + TypeScript + Fastify | Lightweight, fast startup, good WS support alongside HTTP |
| AI opponent | Pure TS module in `packages/rules-engine`, heuristic (not ML) for v1 | Dice-variance-heavy game; a tuned heuristic bot (move-priority scoring) is sufficient and testable — see §7 |
| Testing | `vitest` (unit/integration), `playwright` (e2e) | Fast TS-native unit runner; Playwright for cross-browser + mobile viewport e2e |
| CI/CD | GitHub Actions | Standard, free for public/small private repos, wide support |
| Client hosting | Vercel (static + edge) | Zero-config Vite deploys, preview URLs per PR |
| Server hosting | Fly.io (Dockerized Fastify + socket.io) | WebSocket-friendly, simple multi-region if needed later |
| Asset pipeline | Blender → glTF (`.glb`), Draco-compressed via `gltf-transform` | Meets the ≤8MB total 3D payload budget in design.md §10 |

**[DECISION NEEDED]** Analytics/crash reporting vendor (e.g., PostHog vs. Sentry-only) is not selected — stub an analytics interface (`packages/shared/analytics.ts`) so a vendor can be wired in without touching call sites.

---

## 3. Repository Structure

```
thayam/
├── AGENTS.md
├── Thayam_PRD.md
├── design.md
├── turbo.json
├── pnpm-workspace.yaml
├── packages/
│   ├── rules-engine/        # pure TS, zero deps on React/Three — the single source of truth
│   │   ├── src/
│   │   │   ├── board.ts          # board data model + path abstraction (see §5)
│   │   │   ├── dice.ts           # dice combination table + roll resolution (PRD §8.3)
│   │   │   ├── moves.ts          # legal-move generation
│   │   │   ├── engine.ts         # turn state machine: apply(move) -> GameState
│   │   │   ├── ai.ts             # heuristic bot (see §7)
│   │   │   └── types.ts
│   │   └── test/                 # vitest — this package carries the 100%-branch-coverage gate
│   ├── shared/               # design tokens as code, i18n keys, analytics interface, DTOs
│   │   ├── tokens/            # generated from design.md §4.2–4.3 — single source for CSS vars + 3D materials
│   │   ├── i18n/en.json
│   │   └── i18n/ta.json
│   ├── web/                  # React + Vite client
│   │   ├── src/
│   │   │   ├── scenes/            # R3F board, dice, pawn components
│   │   │   ├── ui/                # flat chrome layer (Tailwind)
│   │   │   ├── state/             # zustand stores (bind to rules-engine, never reimplement rules)
│   │   │   ├── tiers/             # perf probe + Full/Reduced/2D tier switch (design.md §5.5)
│   │   │   └── net/               # socket.io client, reconnect handling
│   │   └── public/assets/3d/      # .glb models
│   └── server/                # Fastify + socket.io, authoritative game host
│       ├── src/
│       │   ├── rooms.ts           # match/room lifecycle, reconnect grace period (PRD FR-14)
│       │   ├── authoritative.ts   # wraps rules-engine; rejects client-submitted illegal moves
│       │   └── index.ts
│       └── Dockerfile
├── .github/workflows/
│   ├── ci.yml               # lint + typecheck + unit + e2e on every PR
│   └── deploy.yml           # on merge to main: deploy web (Vercel) + server (Fly.io)
└── docs/
    └── board-data.md        # output of the board-digitization task, §6
```

---

## 4. Build Order (execute phases in sequence — do not parallelize across phases)

Each phase ends with a **Definition of Done (DoD)**. Do not start the next phase until the current one's DoD is fully met and committed.

### Phase 0 — Scaffolding
- Initialize pnpm workspace + turborepo, all five packages above with empty entry points.
- Wire up `packages/shared/tokens` from design.md §4.2 (color) and §4.3 (type) as both a CSS custom-properties file and a plain TS object (for Three.js materials to import the same hex values — one source, two consumers).
- Set up GitHub Actions `ci.yml`: install, lint, typecheck, `vitest run`, on every PR.
- **DoD:** `pnpm turbo run build` succeeds on a clean checkout; CI is green on an empty-but-structured repo.

### Phase 1 — Rules Engine (highest-priority phase; everything depends on it)
- Implement the board data model and path abstraction (§5 below).
- Implement `dice.ts` exactly per PRD §8.3, including the 0+0→12 override.
- Implement `moves.ts`: legal-move generation covering entry (roll=1), forward movement, own-pawn-occupancy block, mandatory-move rule (PRD §8.4.4).
- Implement `engine.ts` turn state machine: bonus-roll re-roll (1/5/6/12), turn-end condition, cutting (with safe-zone exemption), inner-path unlock gate (requires ≥1 cut), win condition (all 4 pawns at center).
- Write the full PRD §8.5 rule table as **executable test cases** — every row of that table must have at least one corresponding unit test.
- **DoD:** `packages/rules-engine` has 100% branch coverage on `moves.ts` and `engine.ts`; a scripted full game (4 AI-random players) can run to completion in a test without ever reaching an illegal state (fuzz test, ≥1000 simulated games, zero invariant violations — see §8).

### Phase 2 — Board Data Authoring (blocks 3D work, can run parallel to late Phase 1)
- Digitize the exact board geometry from the reference art (`thayam.png` referenced in the PRD) into the path-abstraction schema defined in §5. This is a **data-authoring task, not a rules-logic task** — the algorithm in Phase 1 must be written generically enough that plugging in the real board data doesn't require touching engine code.
- Output: `docs/board-data.md` (human-readable diagram + coordinate table) and `packages/rules-engine/src/board-data.ts` (the consumed data).
- Verify: all 4 player home positions symmetric under 90° rotation; exactly 8 safe squares including 4 homes + center + 3 others per PRD §8.2; inner-path entry point is exactly one square behind each home.
- **DoD:** board-data passes an automated symmetry/invariant check (script, not manual eyeballing) and is reviewed against `design.md` §5.1 (etched-inlay treatment expectations).

### Phase 3 — 2D Fallback Client (build this before 3D — it's the accessibility/perf floor and the fastest way to get the rules engine visibly playable)
- Flat top-down board (SVG or Canvas), same palette/iconography tokens as 3D per design.md §5.5.
- Full pass-and-play + vs-AI playable end to end.
- Wire i18n (en/ta) and the contextual-teaching pattern from design.md §6.1–6.2.
- **DoD:** a full 2–4 player local game is playable start to finish in a browser, in both languages, with zero rules-engine bugs (manual playtest checklist, ≥10 full games).

### Phase 4 — 3D Presentation Layer (Full + Reduced tiers)
- Build board/dice/pawn 3D assets and materials per design.md §5.4.
- Implement dice physics roll (§5.3) via `@react-three/rapier`.
- Implement the perf-probe tier switch (design.md §5.5) — must gracefully fall back to the Phase 3 2D client, not a broken 3D scene, on failure.
- Implement fixed-camera + turn-rotation behavior (design.md §5.2).
- **DoD:** Full-3D tier hits the ≥30fps / ≤2.5s-first-render budget on the reference device; Reduced and 2D tiers verified on low-end device emulation in Playwright.

### Phase 5 — AI Opponent
- Implement heuristic bot per §7 below, three difficulty tiers.
- **DoD:** bot never makes an illegal move (enforced by construction — it can only call `moves.ts`'s legal-move generator); difficulty tiers produce measurably different win rates against each other in a simulated tournament (Easy < Medium < Hard, ≥100 games each pairing).

### Phase 6 — Online Multiplayer
- Server hosts authoritative `rules-engine` instance per room; client submits *intended* moves, server validates and broadcasts resulting state — client-side prediction is cosmetic only, never trusted.
- Reconnect grace period per PRD FR-14; disconnect/reconnect UX per design.md §6.5.
- **DoD:** 2–4 player match playable across independent browser sessions; killing and restoring one client's network mid-match resolves per the disconnect UX spec without corrupting game state.

### Phase 7 — Hardening & Deployment
- Full accessibility pass against design.md §9 (screen-reader announcements, tap-target audit, reduced-motion behavior, text scaling).
- Run the Anti-Genericness Checklist (design.md §11) against every screen.
- Wire `deploy.yml`: merge to `main` → build + deploy `web` to Vercel, build + push Docker image + deploy `server` to Fly.io.
- **DoD:** a public URL is live, serves the production build, supports a full online multiplayer match between two real devices, and every item in §10 of this file (Final Acceptance Checklist) is checked.

---

## 5. Board & Path Data Model

The rules engine must never hardcode board geometry inline — it consumes a data object matching this schema, so Phase 2's real board data drops in without touching engine logic.

```ts
type CellType = 'outer' | 'inner' | 'home-stretch' | 'center' | 'off-board';

interface Cell {
  id: string;              // stable identifier, e.g. "outer-17"
  type: CellType;
  isSafe: boolean;          // true for the 8 safe squares (PRD §8.2)
  ownerColor?: PlayerColor;  // set for home-stretch cells and home cell
}

interface PlayerPath {
  color: PlayerColor;
  homeCellId: string;
  entryCellId: string;       // where a pawn lands on a roll of 1
  // ordered list of cell ids this color's pawns traverse, outer ring
  // (shared sequence, but each color has a different *starting offset*
  // into the shared ring) followed by that color's private home-stretch
  // cells, ending at the shared center cell.
  outerSequence: string[];
  homeStretchSequence: string[]; // private inner path, ends at 'center'
}

interface BoardData {
  cells: Record<string, Cell>;
  players: Record<PlayerColor, PlayerPath>;
  centerCellId: string;
}
```

**Movement algorithm (generic over any valid `BoardData`):**
1. A pawn's position is either `off-board` or an index into `[...outerSequence, ...homeStretchSequence]` for its owning color.
2. Moving N squares = advancing that index by N, unless it would move *past* `homeStretchSequence.length - 1` (i.e., past center) — that move is illegal (must land exactly on center or short of it; PRD §8.2 "needs to move the exact number of spaces").
3. Transition from `outerSequence` to `homeStretchSequence` is only permitted if `player.hasCutOpponent === true` for the current game (PRD §8.4.8) — enforced in `moves.ts`, not left to the UI.
4. Cutting: after a move, if the destination cell `isSafe === false` and is occupied by ≥1 opposing pawn, all opposing pawns there are sent to `off-board`.

This abstraction is deliberately board-shape-agnostic so the Phase 2 digitization task cannot accidentally require an engine rewrite.

---

## 6. Board Digitization Task (Phase 2 detail)

The PRD references a reference image (`thayam.png`) showing the color/direction layout but exact per-cell coordinates were not extracted during requirements-gathering. Before Phase 2:

1. Import the reference image into `docs/`.
2. Manually (or via an assisted grid-overlay script) map each of the 49 grid cells to a `Cell` per the schema in §5, confirming against PRD §8.2's textual description: 7×7 grid, 4 colored home squares at edge midpoints, 8 safe spots (crosses) including all 4 homes, entry-arrow cell one square behind each home, center cell as shared destination.
3. Produce `docs/board-data.md` with an ASCII or image rendering of the finished mapping for human sign-off **before** wiring it into `board-data.ts` — this is a cheap human-review checkpoint on a task that's otherwise hard to unit-test for "is this what the real game looks like."

---

## 7. AI Opponent Specification

Heuristic, not ML — the branching factor per turn (which pawn to move, given a roll) is small enough that a scored-move heuristic is both sufficient and fully deterministic/testable.

**Move scoring (highest score wins, per difficulty tier weight table):**

| Factor | Description | Weight (Easy / Medium / Hard) |
|---|---|---|
| Completes a cut | Move lands on an opponent's pawn on a non-safe cell | 1 / 3 / 5 |
| Escapes a threatened cell | Move takes a pawn off a cell an opponent could reach next turn | 0 / 2 / 4 |
| Advances toward inner-unlock | Prioritizes any cut opportunity if `hasCutOpponent === false` | 0 / 3 / 5 |
| Enters a new pawn on a roll of 1 | Bring a pawn into play rather than advance an existing one | 1 / 1 / 2 |
| Moves onto a safe cell | Defensive positioning | 0 / 1 / 3 |
| Raw distance advanced | Tiebreaker only | 1 / 1 / 1 |

- **Easy:** weights above + 40% chance to ignore the top-scored move and pick randomly among legal moves (simulates a beginner).
- **Medium:** weights above, always picks top-scored move, no lookahead.
- **Hard:** weights above + 1-ply lookahead (simulate the resulting board state and re-score for immediate opponent threat before committing).

All three tiers call the exact same `moves.ts` legal-move generator used by the human client and the multiplayer server — an AI illegal move is impossible by construction, not by testing.

---

## 8. Fuzz / Invariant Testing (required, not optional)

Write a fuzz harness in `packages/rules-engine/test/fuzz.test.ts`:
- Simulate ≥1000 full 2–4 player games with random-legal-move AI.
- After every single move application, assert invariants:
  - No non-safe cell holds >1 pawn.
  - No pawn is on `homeStretchSequence` for a player with `hasCutOpponent === false`.
  - Total pawn count per player is always exactly 4 across (off-board + in-play + home).
  - Game terminates (no infinite loop) within a reasonable move ceiling (flag, don't silently pass, if any simulated game exceeds e.g. 2000 moves — investigate before Phase 1 DoD is signed off).

This harness is what actually earns the "provably correct" claim in §1 — code review alone will not catch every edge case in the bonus-roll/mandatory-move interaction.

---

## 9. Coding Standards

- TypeScript strict mode everywhere, no `any` in `rules-engine` or `server` packages.
- `rules-engine` package has **zero runtime dependencies** outside the TS standard library — this is what guarantees it behaves identically on client and server.
- Conventional commits (`feat:`, `fix:`, `test:`, `chore:`) — CI can later gate semantic-release off this if needed.
- One PR per phase-subtask, not one PR per file; PR description must state which DoD item(s) it advances.
- No screen ships without being checked against the Anti-Genericness Checklist (design.md §11) — paste the checked checklist into the PR description for any UI-touching PR.
- All user-facing strings go through the i18n key system from the first line of code that renders them — never hardcode an English string in a component, even temporarily.

---

## 10. Final Acceptance Checklist (deployment-ready = every box checked)

- [ ] Live URL serves the production client build over HTTPS.
- [ ] Server deployment is live, health-checked, and auto-restarts on crash (Fly.io process config).
- [ ] Full game playable start-to-finish in: vs-AI, local pass-and-play, and online multiplayer modes.
- [ ] Rules engine: 100% branch coverage + fuzz harness (§8) passing at ≥1000 simulated games with zero invariant violations.
- [ ] All three 3D performance tiers verified on real or emulated reference devices (design.md §5.5).
- [ ] English and Tamil fully functional, switchable at any time, no untranslated strings (automated i18n-key-coverage check in CI).
- [ ] Accessibility: screen-reader announcements, tap-target audit, `prefers-reduced-motion` behavior, dynamic-type scaling all verified (design.md §9).
- [ ] Anti-Genericness Checklist (design.md §11) passes on every shipped screen.
- [ ] CI pipeline green on `main`; deploy pipeline has run successfully at least once end-to-end (not just dry-run).
- [ ] No secrets/keys committed; server env vars documented in `packages/server/.env.example`.
- [ ] `README.md` at repo root (write this last) gives a stakeholder: what this is, how to run it locally, and the live URL.

---

*End of Document*# AGENTS.md
## Build Contract — Thayam (Dayakattai) Digital Game

This file is the operating manual for any coding agent (Claude Code or equivalent) working in this repository. It is written to be sufficient, on its own plus the two companion documents below, to take this project from empty repo to a deployed, playable, rules-accurate product without further clarification. Where a decision is genuinely open, it is marked **[DECISION NEEDED]** — everything else is locked and should not be re-litigated mid-build.

**Read these three files, in this order, before writing any code:**
1. `Thayam_PRD.md` — product requirements, full rules specification (Section 8 is the authoritative rules source)
2. `design.md` — visual identity, 3D system, UX flows, motion/accessibility rules
3. `AGENTS.md` (this file) — how to actually build it

If any implementation choice conflicts with `design.md` or `Thayam_PRD.md`, those two win; this file governs *process and architecture*, not visual or rules decisions.

---

## 1. Mission & Non-Negotiables

Build a deployment-ready, cross-platform (web + responsive mobile web) implementation of Classic Thayam (Section 6.1 of the PRD: 4 pawns, 2–4 players, 7×7 board) with:
- A **provably correct rules engine**, unit-tested to the rule set in PRD Section 8, shared identically between client (local/AI play) and server (online multiplayer) so no client can cheat.
- A **tiered 3D presentation** per `design.md` Section 5.5 (Full 3D / Reduced 3D / 2D Fallback), never blocking gameplay on device capability.
- **Bilingual (English/Tamil)** UI from the first commit, not bolted on later.
- A **real CI/CD pipeline** ending in a live, reachable deployment — "done" means there is a URL a stakeholder can open and play, not a `localhost` demo.

**Non-negotiable gates (a phase is not complete until these pass):**
- Rules engine: 100% branch coverage on cutting, safe-zone, inner-path-unlock, and win-condition logic.
- No gameplay-critical state conveyed by color or motion alone (design.md §9).
- Full-3D tier holds ≥30fps steady-state on the reference mid-tier device profile (design.md §5.5) — if it doesn't, ship that build on Reduced 3D, don't lower the bar.
- Every PR includes updated/passing tests before merge; no direct pushes to `main`.

---

## 2. Tech Stack (locked)

| Layer | Choice | Why |
|---|---|---|
| Monorepo tooling | `pnpm` workspaces + `turborepo` | Shared rules-engine package consumed by both client and server without duplication or drift |
| Rules engine | TypeScript, framework-agnostic, zero UI dependencies | Must run identically in-browser (AI/local play) and on the server (authoritative multiplayer) |
| Client framework | React 18 + TypeScript + Vite | Fast dev loop, wide hiring pool, first-class Three.js interop |
| 3D rendering | `three.js` via `@react-three/fiber` + `@react-three/drei` | Declarative R3F integrates cleanly with React state; drei covers loaders/helpers |
| Dice physics | `@react-three/rapier` (Rapier physics) | Real rigid-body cuboid dice roll per design.md §5.3, WASM-based, performant on mobile |
| Client state | `zustand` | Minimal boilerplate, easy to slice game-state vs. UI-state, testable outside React |
| Styling (flat UI layer) | Tailwind CSS, configured from the design-token file (design.md §10) | Tokens-as-code requirement; utility classes keep the "chrome" layer fast to build correctly |
| i18n | `i18next` + `react-i18next` | Mature, supports the en/ta key-based pipeline required in design.md §10 |
| Multiplayer transport | `socket.io` (client + server) | Reliable reconnect handling (PRD FR-14) out of the box |
| Server | Node.js 20 LTS + TypeScript + Fastify | Lightweight, fast startup, good WS support alongside HTTP |
| AI opponent | Pure TS module in `packages/rules-engine`, heuristic (not ML) for v1 | Dice-variance-heavy game; a tuned heuristic bot (move-priority scoring) is sufficient and testable — see §7 |
| Testing | `vitest` (unit/integration), `playwright` (e2e) | Fast TS-native unit runner; Playwright for cross-browser + mobile viewport e2e |
| CI/CD | GitHub Actions | Standard, free for public/small private repos, wide support |
| Client hosting | Vercel (static + edge) | Zero-config Vite deploys, preview URLs per PR |
| Server hosting | Fly.io (Dockerized Fastify + socket.io) | WebSocket-friendly, simple multi-region if needed later |
| Asset pipeline | Blender → glTF (`.glb`), Draco-compressed via `gltf-transform` | Meets the ≤8MB total 3D payload budget in design.md §10 |

**[DECISION NEEDED]** Analytics/crash reporting vendor (e.g., PostHog vs. Sentry-only) is not selected — stub an analytics interface (`packages/shared/analytics.ts`) so a vendor can be wired in without touching call sites.

---

## 3. Repository Structure

```
thayam/
├── AGENTS.md
├── Thayam_PRD.md
├── design.md
├── turbo.json
├── pnpm-workspace.yaml
├── packages/
│   ├── rules-engine/        # pure TS, zero deps on React/Three — the single source of truth
│   │   ├── src/
│   │   │   ├── board.ts          # board data model + path abstraction (see §5)
│   │   │   ├── dice.ts           # dice combination table + roll resolution (PRD §8.3)
│   │   │   ├── moves.ts          # legal-move generation
│   │   │   ├── engine.ts         # turn state machine: apply(move) -> GameState
│   │   │   ├── ai.ts             # heuristic bot (see §7)
│   │   │   └── types.ts
│   │   └── test/                 # vitest — this package carries the 100%-branch-coverage gate
│   ├── shared/               # design tokens as code, i18n keys, analytics interface, DTOs
│   │   ├── tokens/            # generated from design.md §4.2–4.3 — single source for CSS vars + 3D materials
│   │   ├── i18n/en.json
│   │   └── i18n/ta.json
│   ├── web/                  # React + Vite client
│   │   ├── src/
│   │   │   ├── scenes/            # R3F board, dice, pawn components
│   │   │   ├── ui/                # flat chrome layer (Tailwind)
│   │   │   ├── state/             # zustand stores (bind to rules-engine, never reimplement rules)
│   │   │   ├── tiers/             # perf probe + Full/Reduced/2D tier switch (design.md §5.5)
│   │   │   └── net/               # socket.io client, reconnect handling
│   │   └── public/assets/3d/      # .glb models
│   └── server/                # Fastify + socket.io, authoritative game host
│       ├── src/
│       │   ├── rooms.ts           # match/room lifecycle, reconnect grace period (PRD FR-14)
│       │   ├── authoritative.ts   # wraps rules-engine; rejects client-submitted illegal moves
│       │   └── index.ts
│       └── Dockerfile
├── .github/workflows/
│   ├── ci.yml               # lint + typecheck + unit + e2e on every PR
│   └── deploy.yml           # on merge to main: deploy web (Vercel) + server (Fly.io)
└── docs/
    └── board-data.md        # output of the board-digitization task, §6
```

---

## 4. Build Order (execute phases in sequence — do not parallelize across phases)

Each phase ends with a **Definition of Done (DoD)**. Do not start the next phase until the current one's DoD is fully met and committed.

### Phase 0 — Scaffolding
- Initialize pnpm workspace + turborepo, all five packages above with empty entry points.
- Wire up `packages/shared/tokens` from design.md §4.2 (color) and §4.3 (type) as both a CSS custom-properties file and a plain TS object (for Three.js materials to import the same hex values — one source, two consumers).
- Set up GitHub Actions `ci.yml`: install, lint, typecheck, `vitest run`, on every PR.
- **DoD:** `pnpm turbo run build` succeeds on a clean checkout; CI is green on an empty-but-structured repo.

### Phase 1 — Rules Engine (highest-priority phase; everything depends on it)
- Implement the board data model and path abstraction (§5 below).
- Implement `dice.ts` exactly per PRD §8.3, including the 0+0→12 override.
- Implement `moves.ts`: legal-move generation covering entry (roll=1), forward movement, own-pawn-occupancy block, mandatory-move rule (PRD §8.4.4).
- Implement `engine.ts` turn state machine: bonus-roll re-roll (1/5/6/12), turn-end condition, cutting (with safe-zone exemption), inner-path unlock gate (requires ≥1 cut), win condition (all 4 pawns at center).
- Write the full PRD §8.5 rule table as **executable test cases** — every row of that table must have at least one corresponding unit test.
- **DoD:** `packages/rules-engine` has 100% branch coverage on `moves.ts` and `engine.ts`; a scripted full game (4 AI-random players) can run to completion in a test without ever reaching an illegal state (fuzz test, ≥1000 simulated games, zero invariant violations — see §8).

### Phase 2 — Board Data Authoring (blocks 3D work, can run parallel to late Phase 1)
- Digitize the exact board geometry from the reference art (`thayam.png` referenced in the PRD) into the path-abstraction schema defined in §5. This is a **data-authoring task, not a rules-logic task** — the algorithm in Phase 1 must be written generically enough that plugging in the real board data doesn't require touching engine code.
- Output: `docs/board-data.md` (human-readable diagram + coordinate table) and `packages/rules-engine/src/board-data.ts` (the consumed data).
- Verify: all 4 player home positions symmetric under 90° rotation; exactly 8 safe squares including 4 homes + center + 3 others per PRD §8.2; inner-path entry point is exactly one square behind each home.
- **DoD:** board-data passes an automated symmetry/invariant check (script, not manual eyeballing) and is reviewed against `design.md` §5.1 (etched-inlay treatment expectations).

### Phase 3 — 2D Fallback Client (build this before 3D — it's the accessibility/perf floor and the fastest way to get the rules engine visibly playable)
- Flat top-down board (SVG or Canvas), same palette/iconography tokens as 3D per design.md §5.5.
- Full pass-and-play + vs-AI playable end to end.
- Wire i18n (en/ta) and the contextual-teaching pattern from design.md §6.1–6.2.
- **DoD:** a full 2–4 player local game is playable start to finish in a browser, in both languages, with zero rules-engine bugs (manual playtest checklist, ≥10 full games).

### Phase 4 — 3D Presentation Layer (Full + Reduced tiers)
- Build board/dice/pawn 3D assets and materials per design.md §5.4.
- Implement dice physics roll (§5.3) via `@react-three/rapier`.
- Implement the perf-probe tier switch (design.md §5.5) — must gracefully fall back to the Phase 3 2D client, not a broken 3D scene, on failure.
- Implement fixed-camera + turn-rotation behavior (design.md §5.2).
- **DoD:** Full-3D tier hits the ≥30fps / ≤2.5s-first-render budget on the reference device; Reduced and 2D tiers verified on low-end device emulation in Playwright.

### Phase 5 — AI Opponent
- Implement heuristic bot per §7 below, three difficulty tiers.
- **DoD:** bot never makes an illegal move (enforced by construction — it can only call `moves.ts`'s legal-move generator); difficulty tiers produce measurably different win rates against each other in a simulated tournament (Easy < Medium < Hard, ≥100 games each pairing).

### Phase 6 — Online Multiplayer
- Server hosts authoritative `rules-engine` instance per room; client submits *intended* moves, server validates and broadcasts resulting state — client-side prediction is cosmetic only, never trusted.
- Reconnect grace period per PRD FR-14; disconnect/reconnect UX per design.md §6.5.
- **DoD:** 2–4 player match playable across independent browser sessions; killing and restoring one client's network mid-match resolves per the disconnect UX spec without corrupting game state.

### Phase 7 — Hardening & Deployment
- Full accessibility pass against design.md §9 (screen-reader announcements, tap-target audit, reduced-motion behavior, text scaling).
- Run the Anti-Genericness Checklist (design.md §11) against every screen.
- Wire `deploy.yml`: merge to `main` → build + deploy `web` to Vercel, build + push Docker image + deploy `server` to Fly.io.
- **DoD:** a public URL is live, serves the production build, supports a full online multiplayer match between two real devices, and every item in §10 of this file (Final Acceptance Checklist) is checked.

---

## 5. Board & Path Data Model

The rules engine must never hardcode board geometry inline — it consumes a data object matching this schema, so Phase 2's real board data drops in without touching engine logic.

```ts
type CellType = 'outer' | 'inner' | 'home-stretch' | 'center' | 'off-board';

interface Cell {
  id: string;              // stable identifier, e.g. "outer-17"
  type: CellType;
  isSafe: boolean;          // true for the 8 safe squares (PRD §8.2)
  ownerColor?: PlayerColor;  // set for home-stretch cells and home cell
}

interface PlayerPath {
  color: PlayerColor;
  homeCellId: string;
  entryCellId: string;       // where a pawn lands on a roll of 1
  // ordered list of cell ids this color's pawns traverse, outer ring
  // (shared sequence, but each color has a different *starting offset*
  // into the shared ring) followed by that color's private home-stretch
  // cells, ending at the shared center cell.
  outerSequence: string[];
  homeStretchSequence: string[]; // private inner path, ends at 'center'
}

interface BoardData {
  cells: Record<string, Cell>;
  players: Record<PlayerColor, PlayerPath>;
  centerCellId: string;
}
```

**Movement algorithm (generic over any valid `BoardData`):**
1. A pawn's position is either `off-board` or an index into `[...outerSequence, ...homeStretchSequence]` for its owning color.
2. Moving N squares = advancing that index by N, unless it would move *past* `homeStretchSequence.length - 1` (i.e., past center) — that move is illegal (must land exactly on center or short of it; PRD §8.2 "needs to move the exact number of spaces").
3. Transition from `outerSequence` to `homeStretchSequence` is only permitted if `player.hasCutOpponent === true` for the current game (PRD §8.4.8) — enforced in `moves.ts`, not left to the UI.
4. Cutting: after a move, if the destination cell `isSafe === false` and is occupied by ≥1 opposing pawn, all opposing pawns there are sent to `off-board`.

This abstraction is deliberately board-shape-agnostic so the Phase 2 digitization task cannot accidentally require an engine rewrite.

---

## 6. Board Digitization Task (Phase 2 detail)

The PRD references a reference image (`thayam.png`) showing the color/direction layout but exact per-cell coordinates were not extracted during requirements-gathering. Before Phase 2:

1. Import the reference image into `docs/`.
2. Manually (or via an assisted grid-overlay script) map each of the 49 grid cells to a `Cell` per the schema in §5, confirming against PRD §8.2's textual description: 7×7 grid, 4 colored home squares at edge midpoints, 8 safe spots (crosses) including all 4 homes, entry-arrow cell one square behind each home, center cell as shared destination.
3. Produce `docs/board-data.md` with an ASCII or image rendering of the finished mapping for human sign-off **before** wiring it into `board-data.ts` — this is a cheap human-review checkpoint on a task that's otherwise hard to unit-test for "is this what the real game looks like."

---

## 7. AI Opponent Specification

Heuristic, not ML — the branching factor per turn (which pawn to move, given a roll) is small enough that a scored-move heuristic is both sufficient and fully deterministic/testable.

**Move scoring (highest score wins, per difficulty tier weight table):**

| Factor | Description | Weight (Easy / Medium / Hard) |
|---|---|---|
| Completes a cut | Move lands on an opponent's pawn on a non-safe cell | 1 / 3 / 5 |
| Escapes a threatened cell | Move takes a pawn off a cell an opponent could reach next turn | 0 / 2 / 4 |
| Advances toward inner-unlock | Prioritizes any cut opportunity if `hasCutOpponent === false` | 0 / 3 / 5 |
| Enters a new pawn on a roll of 1 | Bring a pawn into play rather than advance an existing one | 1 / 1 / 2 |
| Moves onto a safe cell | Defensive positioning | 0 / 1 / 3 |
| Raw distance advanced | Tiebreaker only | 1 / 1 / 1 |

- **Easy:** weights above + 40% chance to ignore the top-scored move and pick randomly among legal moves (simulates a beginner).
- **Medium:** weights above, always picks top-scored move, no lookahead.
- **Hard:** weights above + 1-ply lookahead (simulate the resulting board state and re-score for immediate opponent threat before committing).

All three tiers call the exact same `moves.ts` legal-move generator used by the human client and the multiplayer server — an AI illegal move is impossible by construction, not by testing.

---

## 8. Fuzz / Invariant Testing (required, not optional)

Write a fuzz harness in `packages/rules-engine/test/fuzz.test.ts`:
- Simulate ≥1000 full 2–4 player games with random-legal-move AI.
- After every single move application, assert invariants:
  - No non-safe cell holds >1 pawn.
  - No pawn is on `homeStretchSequence` for a player with `hasCutOpponent === false`.
  - Total pawn count per player is always exactly 4 across (off-board + in-play + home).
  - Game terminates (no infinite loop) within a reasonable move ceiling (flag, don't silently pass, if any simulated game exceeds e.g. 2000 moves — investigate before Phase 1 DoD is signed off).

This harness is what actually earns the "provably correct" claim in §1 — code review alone will not catch every edge case in the bonus-roll/mandatory-move interaction.

---

## 9. Coding Standards

- TypeScript strict mode everywhere, no `any` in `rules-engine` or `server` packages.
- `rules-engine` package has **zero runtime dependencies** outside the TS standard library — this is what guarantees it behaves identically on client and server.
- Conventional commits (`feat:`, `fix:`, `test:`, `chore:`) — CI can later gate semantic-release off this if needed.
- One PR per phase-subtask, not one PR per file; PR description must state which DoD item(s) it advances.
- No screen ships without being checked against the Anti-Genericness Checklist (design.md §11) — paste the checked checklist into the PR description for any UI-touching PR.
- All user-facing strings go through the i18n key system from the first line of code that renders them — never hardcode an English string in a component, even temporarily.

---

## 10. Final Acceptance Checklist (deployment-ready = every box checked)

- [ ] Live URL serves the production client build over HTTPS.
- [ ] Server deployment is live, health-checked, and auto-restarts on crash (Fly.io process config).
- [ ] Full game playable start-to-finish in: vs-AI, local pass-and-play, and online multiplayer modes.
- [ ] Rules engine: 100% branch coverage + fuzz harness (§8) passing at ≥1000 simulated games with zero invariant violations.
- [ ] All three 3D performance tiers verified on real or emulated reference devices (design.md §5.5).
- [ ] English and Tamil fully functional, switchable at any time, no untranslated strings (automated i18n-key-coverage check in CI).
- [ ] Accessibility: screen-reader announcements, tap-target audit, `prefers-reduced-motion` behavior, dynamic-type scaling all verified (design.md §9).
- [ ] Anti-Genericness Checklist (design.md §11) passes on every shipped screen.
- [ ] CI pipeline green on `main`; deploy pipeline has run successfully at least once end-to-end (not just dry-run).
- [ ] No secrets/keys committed; server env vars documented in `packages/server/.env.example`.
- [ ] `README.md` at repo root (write this last) gives a stakeholder: what this is, how to run it locally, and the live URL.

---

*End of Document*