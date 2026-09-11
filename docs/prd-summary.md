# Thayam PRD — Working Summary

> Extracted from `Thayam_PRD.md` for quick agent reference. The PRD itself remains authoritative.

---

## Game Setup

- **Board:** 7×7 grid (49 cells)
- **Players:** 2–4, each with 4 pawns (Red, Green, Yellow, Blue)
- **2-player:** players on opposite sides
- **Turn order:** clockwise among players
- **Pawns start:** off-board

---

## Dice Mechanics (§8.3)

Two cuboid dice, each face: 0, 1, 2, 3. Roll value = sum, except **0+0 = 12**.

| Die A \ Die B | 0    | 1 | 2 | 3 |
|---------------|------|---|---|---|
| **0**         | **12** | 1 | 2 | 3 |
| **1**         | 1    | 2 | 3 | 4 |
| **2**         | 2    | 3 | 4 | 5 |
| **3**         | 3    | 4 | 5 | 6 |

**Valid outcomes:** 1, 2, 3, 4, 5, 6, 12 (7–11 are impossible)

**Bonus rolls:** 1, 5, 6, 12 → player rolls again (same turn, chains allowed)

---

## Movement Rules (§8.4)

1. **Entry:** pawn enters at own home square on roll of exactly 1
2. **Forward only:** move exactly the roll value
3. **Direction:** anti-clockwise (outer ring) → clockwise (inner path)
4. **Own-pawn blocking:** cannot land on cell with own pawn (non-safe)
5. **Mandatory move:** if any legal move exists, must take it
6. **No legal move:** turn ends (but bonus roll still granted if 1/5/6/12)
7. **Cutting:** land on opponent's pawn on non-safe cell → opponent sent off-board
8. **Inner path unlock:** must have cut ≥1 opponent before any pawn enters inner path
9. **Exact center landing:** must land exactly on center (no overshoot)

---

## Board Layout (§8.2)

- **Home squares:** center of each edge, color-coded, safe
- **Center square:** shared destination, safe
- **8 safe spots total:** 4 homes + center + 3 others (marked with ✕)
- **Safe spots:** no cutting allowed, multi-occupancy allowed (any player)
- **Inner path entry:** one square behind each player's home square
- **Non-safe squares:** single occupancy only

---

## Win Condition

First player to move **all 4 pawns** to center square wins. Game terminates immediately.

---

## Edge Cases Checklist

| # | Edge Case | Rule |
|---|-----------|------|
| 1 | 0+0 override | Produces 12, not 0 |
| 2 | Bonus roll w/o legal move | Roll again granted even if no move was possible |
| 3 | Mandatory move | Cannot voluntarily pass if legal move exists |
| 4 | Own-pawn blocking | Cannot land on own pawn on non-safe cell |
| 5 | Safe multi-occupancy | Any player pawns can coexist on safe spots |
| 6 | Inner-path gate | ≥1 cut required; until then, pawns circle outer ring |
| 7 | Cut pawn reset | Goes off-board, re-enters with roll of 1 |
| 8 | Exact center | Cannot overshoot center cell |
| 9 | Bonus chaining | 1/5/6/12 extends same turn, unlimited chaining |
| 10 | Single pawn per roll | v1: each roll applied to one pawn only |

---

## Functional Requirements Quick-Ref

| FR | Description | Priority |
|----|-------------|----------|
| FR-1 | Dice simulation per §8.3 table | P0 |
| FR-2 | Entry rule (roll of 1) | P0 |
| FR-3 | Bonus rolls (1,5,6,12) | P0 |
| FR-4 | Direction enforcement per color | P0 |
| FR-5 | Single-occupancy on non-safe | P0 |
| FR-6 | Cutting logic + off-board return | P0 |
| FR-7 | Inner-path gate (≥1 cut) | P0 |
| FR-8 | Mandatory-move rule | P0 |
| FR-9 | Win detection (4th pawn at center) | P0 |
| FR-10 | Turn order cycling | P0 |
| FR-11 | AI opponent (3 tiers) | P0 |
| FR-12 | Local pass-and-play | P0 |
| FR-13 | Online multiplayer | P1 |
| FR-14 | Reconnect handling | P1 |
| FR-15 | Tutorial (contextual) | P0 |
| FR-16 | Bilingual rules reference | P0 |
| FR-17 | Legal-move highlighting | P0 |
| FR-18 | Animated movement + cut feedback | P1 |
| FR-19 | Turn/bonus-roll indicator | P0 |
| FR-20 | Responsive layout | P0 |
| FR-21 | Colorblind-safe option | P1 |
| FR-22 | EN/TA localization | P1 |

---

## Performance Targets

- Dice roll → UI response: ≤300ms
- Move animation: ≤1s
- Uptime: ≥99.5%
- Compatibility: iOS 15+, Android 10+
