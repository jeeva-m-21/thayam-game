# V-Model Test Strategy

> Maps every development slice to its verification layer. Tests are written **before or alongside** implementation, never after.

---

## V-Model Layers

```
Requirements (PRD §8)          ←→  Acceptance Tests (E2E Playwright)
  ↓                                       ↑
Architecture (AGENTS.md §5)    ←→  Integration Tests (cross-package)
  ↓                                       ↑
Module Design (per-file)       ←→  Unit Tests (vitest, per-file)
  ↓                                       ↑
Code Implementation            ←→  Fuzz / Invariant Harness (§8)
```

---

## Per-Slice Test Mapping

### Phase 0 — Scaffolding
| Slice | Implementation | Verification |
|-------|---------------|--------------|
| P0-01 | Monorepo scaffold | `pnpm turbo run build` exits 0 |
| P0-02 | Design tokens | Token import script validates hex values match design.md |
| P0-03 | i18n scaffolding | Type-check script validates en/ta key parity |
| P0-04 | CI pipeline | PR goes green end-to-end |

### Phase 1 — Rules Engine
| Slice | Implementation | Unit Tests | Invariant Tests |
|-------|---------------|------------|-----------------|
| P1-01 | `types.ts` | Compiles standalone (type-level test) | — |
| P1-02 | `dice.ts` | All 16 die combinations (table-driven) | — |
| P1-03 | `board-data.ts` (placeholder) | Symmetry/invariant checker | — |
| P1-04 | `moves.ts` | One test per PRD §8.4 sub-rule (9 tests min) | — |
| P1-05 | `engine.ts` | Cut, safe-zone, bonus-roll, turn-end | — |
| P1-06 | Inner-path gate | Pre-cut blocked, post-cut allowed | — |
| P1-07 | Win detection | Drive to win, reject further moves | — |
| P1-08 | Fuzz harness | — | 1000 games × 4 invariants |
| P1-09 | Coverage gate | — | 100% branch on moves.ts + engine.ts |

### Phase 2 — Board Data
| Slice | Implementation | Verification |
|-------|---------------|--------------|
| P2-01 | Reference image | Visual presence check |
| P2-02 | Cell mapping (49 cells) | Automated: 90° rotational symmetry, 8 safe cells, path continuity |
| P2-03 | `board-data.md` | Manual stakeholder sign-off checkpoint |
| P2-04 | Replace placeholder | Full Phase 1 test suite re-run (zero engine changes) |

### Phase 3 — 2D Client
| Slice | Implementation | Unit/Integration | E2E |
|-------|---------------|-----------------|-----|
| P3-01 | Vite+React+Tailwind | Build succeeds, tokens load | — |
| P3-02 | Board renderer | Renders all cells from BoardData | — |
| P3-03 | Pawn + tap handling | State store reflects engine state | — |
| P3-04 | Dice tray UI | Roll→bonus→turn-end flow | — |
| P3-05 | i18n + teaching | No hardcoded EN strings (grep), both langs render | — |
| P3-06 | Pass-and-play + AI | — | 10 full games manual checklist |

### Phase 4 — 3D Layer
| Slice | Implementation | Verification |
|-------|---------------|--------------|
| P4-01 | 3D assets | ≤8MB total, Draco-compressed |
| P4-02 | R3F board scene | Renders, camera correct |
| P4-03 | Dice physics | Settle 0.9–1.3s, result readable |
| P4-04 | Pawn animations | Arc-hop, cut slide-off |
| P4-05 | Tier probe + switch | Fallback chain: Full→Reduced→2D |
| P4-06 | Camera rotation | 400ms eased, `prefers-reduced-motion` snap |

### Phase 5 — AI
| Slice | Implementation | Verification |
|-------|---------------|--------------|
| P5-01 | Scoring function | Weight table unit tests |
| P5-02 | Easy + Medium | Win-rate ordering |
| P5-03 | Hard (1-ply) | Win-rate: Hard > Medium |
| P5-04 | Integration | 100 games/pairing, zero illegal moves |

### Phase 6 — Multiplayer
| Slice | Implementation | Verification |
|-------|---------------|--------------|
| P6-01 | Fastify + rooms | Room create/join/leave |
| P6-02 | Authoritative engine | Illegal move rejection |
| P6-03 | Reconnect | Grace period + state sync |
| P6-04 | Client networking | Cross-browser full match |

### Phase 7 — Hardening
| Slice | Implementation | Verification |
|-------|---------------|--------------|
| P7-01 | Accessibility | Screen reader, tap targets, 130% scaling |
| P7-02 | Anti-genericness | Checklist per screen |
| P7-03 | Deploy pipeline | Vercel + Fly.io live |
| P7-04 | Secrets audit | No committed secrets |
| P7-05 | README | Stakeholder-facing |
| P7-06 | Final acceptance | AGENTS.md §10 full checklist against live URL |

---

## Test Infrastructure

| Layer | Tool | Location |
|-------|------|----------|
| Unit | vitest | `packages/*/test/` |
| Fuzz/Invariant | vitest (custom harness) | `packages/rules-engine/test/fuzz.test.ts` |
| Integration | vitest | `packages/*/test/integration/` |
| E2E | Playwright | `packages/web/e2e/` |
| Coverage | vitest --coverage (v8) | CI gate on `moves.ts`, `engine.ts` |
| i18n parity | custom script | `packages/shared/scripts/check-i18n.ts` |
| Token parity | custom script | `packages/shared/scripts/check-tokens.ts` |

---

## Slice Execution Contract

1. **Read** the slice description from `plan.md`
2. **Write tests first** (or alongside, for UI slices)
3. **Implement** until tests pass
4. **Verify** the slice-specific check from the table above
5. **Commit** with conventional commit referencing the task ID
6. **Check the box** in `plan.md` only after verification passes
