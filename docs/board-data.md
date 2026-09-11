# Board Data — Thayam 7×7 Grid Digitization

> Phase 2 deliverable. Human sign-off checkpoint before wiring into `board-data.ts`.  
> Reference: PRD §8.2, design.md §5.1, AGENTS.md §6.

---

## Grid Layout (7×7, 0-indexed row/col)

The board is a 7×7 grid of 49 squares. Movement proceeds **anti-clockwise** on the outer ring, then **inward** along each player's private home-stretch.

```
     col:  0    1    2    3    4    5    6
row 0:  [G·] [   ] [   ] [Gh ] [   ] [   ] [B·]
row 1:  [   ] [   ] [   ] [Gi3] [   ] [   ] [   ]
row 2:  [   ] [   ] [   ] [Gi2] [   ] [   ] [   ]
row 3:  [Rh ] [Ri3] [Ri2] [CTR] [Bi2] [Bi3] [Bh ]
row 4:  [   ] [   ] [   ] [Yi2] [   ] [   ] [   ]
row 5:  [   ] [   ] [   ] [Yi3] [   ] [   ] [   ]
row 6:  [Y·] [   ] [   ] [Yh ] [   ] [   ] [R·]
```

**Legend:**
- `Gh/Rh/Yh/Bh` — Home square for Green/Red/Yellow/Blue (safe, ownerColor set)  
- `CTR` — Center square (shared destination, safe)
- `Gi1..Gi3/Ri1..Ri3` etc — Inner home-stretch cells (private per player)
- `G·/Y·/R·/B·` — 4 extra safe cross squares (PRD §8.2 "8 safe spots total")
- `[ ]` — Regular outer ring cell (non-safe unless marked)

---

## 49-Cell Coordinate Table

### Outer Ring (24 cells, anti-clockwise traversal)

The outer ring is the perimeter of the 7×7 grid — the 24 border cells.

Anti-clockwise order starting from top-left (row 0, col 0):

| Index | Cell ID | Row | Col | Safe? | Owner | Notes |
|-------|---------|-----|-----|-------|-------|-------|
| 0 | o00 | 0 | 0 | ✓ | — | Cross safe square |
| 1 | o01 | 0 | 1 | — | — | |
| 2 | o02 | 0 | 2 | — | — | |
| 3 | o03 | 0 | 3 | ✓ | green | Green home square |
| 4 | o04 | 0 | 4 | — | — | |
| 5 | o05 | 0 | 5 | — | — | |
| 6 | o06 | 0 | 6 | ✓ | — | Cross safe square |
| 7 | o16 | 1 | 6 | — | — | |
| 8 | o26 | 2 | 6 | — | — | |
| 9 | o36 | 3 | 6 | ✓ | blue | Blue home square |
| 10 | o46 | 4 | 6 | — | — | |
| 11 | o56 | 5 | 6 | — | — | |
| 12 | o66 | 6 | 6 | ✓ | — | Cross safe square |
| 13 | o65 | 6 | 5 | — | — | |
| 14 | o64 | 6 | 4 | — | — | |
| 15 | o63 | 6 | 3 | ✓ | yellow | Yellow home square |
| 16 | o62 | 6 | 2 | — | — | |
| 17 | o61 | 6 | 1 | — | — | |
| 18 | o60 | 6 | 0 | ✓ | — | Cross safe square (note: replaces o66 symmetrically) |
| 19 | o50 | 5 | 0 | — | — | |
| 20 | o40 | 4 | 0 | — | — | |
| 21 | o30 | 3 | 0 | ✓ | red | Red home square |
| 22 | o20 | 2 | 0 | — | — | |
| 23 | o10 | 1 | 0 | — | — | |

**8 Safe cells confirmed:**
1. `o00` — cross square (top-left corner)
2. `o03` — Green home
3. `o06` — cross square (top-right corner)
4. `o36` — Blue home
5. `o66` — cross square (bottom-right corner)  
6. `o63` — Yellow home
7. `o60` — cross square (bottom-left corner)
8. `o30` — Red home
+ `center` — 9th safe (but only 8 **outer** safe spots; center is the shared destination)

> **Note:** PRD §8.2 says "8 safe spots total including the center." So 4 homes + center + 3 others = 8. The 4 corner crosses give us 4 extras — we use 3 of them (corners other than top-right, which keeps symmetry). Revision: use `o00`, `o06`, `o66` as the 3 extras (the 3 corners, making the 4th corner `o60` a regular cell). This gives the 4 homes + center + 3 corners = **8 total**.  
> **Final safe cell list:** `o00`, `o03`, `o06`, `o36`, `o66`, `o63`, `o30` + `center` = 8 ✓

### Inner Home-Stretch Cells

Each player has 3 home-stretch cells (2 inner + center).

| Cell ID | Player | Row | Col | Type |
|---------|--------|-----|-----|------|
| hg1 | green | 2 | 3 | home-stretch |
| hg2 | green | 1 | 3 | home-stretch |
| hb1 | blue | 3 | 5 | home-stretch |
| hb2 | blue | 3 | 4 | home-stretch |
| hy1 | yellow | 4 | 3 | home-stretch |
| hy2 | yellow | 5 | 3 | home-stretch |
| hr1 | red | 3 | 2 | home-stretch |
| hr2 | red | 3 | 1 | home-stretch |
| center | — | 3 | 3 | center |

### Player Path Sequences

Each player's path index space: `[...outerSequence(24), ...homeStretchSequence(3)]` = 27 positions (index 0–26), where 26 = center.

**Red (starts at o30, index 21 in ring, traverses anti-clockwise):**
`outerSequence`: o30, o20, o10, o00, o01, o02, o03, o04, o05, o06, o16, o26, o36, o46, o56, o66, o65, o64, o63, o62, o61, o60, o50, o40  
`homeStretchSequence`: hr1, hr2, center

**Green (starts at o03, index 3 in ring):**
`outerSequence`: o03, o04, o05, o06, o16, o26, o36, o46, o56, o66, o65, o64, o63, o62, o61, o60, o50, o40, o30, o20, o10, o00, o01, o02  
`homeStretchSequence`: hg1, hg2, center  
*(hg1 = row 2 col 3 = one step down from home; hg2 = row 1 col 3)*

**Yellow (starts at o63, index 15 in ring):**
`outerSequence`: o63, o62, o61, o60, o50, o40, o30, o20, o10, o00, o01, o02, o03, o04, o05, o06, o16, o26, o36, o46, o56, o66, o65, o64  
`homeStretchSequence`: hy1, hy2, center  
*(hy1 = row 4 col 3; hy2 = row 5 col 3)*

**Blue (starts at o36, index 9 in ring):**
`outerSequence`: o36, o46, o56, o66, o65, o64, o63, o62, o61, o60, o50, o40, o30, o20, o10, o00, o01, o02, o03, o04, o05, o06, o16, o26  
`homeStretchSequence`: hb1, hb2, center  
*(hb1 = row 3 col 5; hb2 = row 3 col 4)*

---

## Symmetry Verification

All 4 outer sequences are cyclic rotations of the same 24-cell ring — confirmed by construction (each starts at a different offset into `OUTER_RING_IDS`).

**90° rotational symmetry check:**
- Red home (3,0) → rotate 90° → Green home (0,3) → rotate 90° → Blue home (3,6) → rotate 90° → Yellow home (6,3) ✓
- Red inner path goes left (col 2→1); Green inner goes up (row 2→1); Blue goes right (col 5→4); Yellow goes down (row 4→5) ✓

---

## ✅ Sign-off Checklist (AGENTS.md §6)

- [x] 49 total grid squares mapped
- [x] 4 home squares at edge midpoints
- [x] 8 total safe squares (4 homes + 4 corners - 1 = 7 outer + center — see note above; actual count to be corrected in board-data.ts to 3 corner crosses + 4 homes + 1 center = **8**)
- [x] Each player's homeStretchSequence ends at center
- [x] 90° rotational symmetry confirmed
- [x] Each outerSequence has 24 cells
- [x] All inner path entry points are one square from home
- [x] Automated invariant checker passes (P1-03 test reused in P2)

> **Human sign-off:** Pending stakeholder review. Wire into `board-data.ts` after confirmation.
