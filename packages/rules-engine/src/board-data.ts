/**
 * board-data.ts — PLACEHOLDER board for Phase 1 engine development
 *
 * This is a synthetic 7×7 board matching the PRD §8.2 structural rules:
 * - 4 players (red, green, yellow, blue)
 * - Each player: outerSequence (shared ring) + homeStretchSequence (private inner path)
 * - 8 safe cells: 4 home squares + center + 3 outer cross squares
 * - 90° rotational symmetry across player paths
 * - Center cell is the shared final destination
 *
 * PHASE 2 REPLACES THIS FILE with digitized real board data.
 * Engine code (moves.ts, engine.ts) must NOT need changes when that swap happens.
 *
 * Board layout (7×7, 0-indexed row/col):
 *
 *   col: 0    1    2    3    4    5    6
 * row 0: [  ] [  ] [  ] [G3] [  ] [  ] [  ]
 * row 1: [  ] [  ] [  ] [G2] [  ] [  ] [  ]
 * row 2: [  ] [  ] [  ] [G1] [  ] [  ] [  ]
 * row 3: [R3] [R2] [R1] [CTR][B1] [B2] [B3]
 * row 4: [  ] [  ] [  ] [Y1] [  ] [  ] [  ]
 * row 5: [  ] [  ] [  ] [Y2] [  ] [  ] [  ]
 * row 6: [  ] [  ] [  ] [Y3] [  ] [  ] [  ]
 *
 * Outer ring (24 cells): r0c0→r0c6→r6c6→r6c0→r0c0 (anti-clockwise)
 * Each player's outerSequence starts at their entry cell (one step before home)
 * and traverses the full ring back to just-before-home.
 *
 * Home squares (edge midpoints, row 3 col 0, row 0 col 3, row 3 col 6, row 6 col 3):
 *   Red:    (3,0)
 *   Green:  (0,3)
 *   Yellow: (6,3)
 *   Blue:   (3,6)
 */

import type { BoardData, Cell, PlayerPath, PlayerColor } from './types.js';

// ─── Cell helpers ──────────────────────────────────────────────────────────

function outer(id: string, safe = false, owner?: PlayerColor): Cell {
  return { id, type: 'outer', isSafe: safe, ...(owner ? { ownerColor: owner } : {}) };
}
function hs(id: string, owner: PlayerColor): Cell {
  return { id, type: 'home-stretch', isSafe: false, ownerColor: owner };
}
function center(): Cell {
  return { id: 'center', type: 'center', isSafe: true };
}

// ─── Outer ring cell IDs (24 cells, anti-clockwise from top-left) ──────────
//
// Anti-clockwise traversal of 7×7 perimeter:
// Top row left→right:    o00,o01,o02,o03,o04,o05,o06
// Right col top→bottom:  o06 already counted, o16,o26,o36,o46,o56,o66
// Bottom row right→left: o66 already counted, o65,o64,o63,o62,o61,o60
// Left col bottom→top:   o60 already counted, o50,o40,o30,o20,o10
// Total unique: 7+6+6+5 = 24 cells ✓
//
// Named as o{row}{col}

const OUTER_RING_IDS: string[] = [
  // Top row (row 0, left to right)
  'o00','o01','o02','o03','o04','o05','o06',
  // Right col (col 6, top+1 to bottom)
  'o16','o26','o36','o46','o56','o66',
  // Bottom row (row 6, right-1 to left)
  'o65','o64','o63','o62','o61','o60',
  // Left col (col 0, bottom-1 to top+1)
  'o50','o40','o30','o20','o10',
];
// 24 cells total

// Safe cross squares on the outer ring:
// 4 home cells + 3 extra cross squares = 7 outer safe cells
// Plus 1 center = 8 total (PRD §8.2)
// Extra crosses placed symmetrically midway between homes
const OUTER_SAFE_IDS = new Set([
  // 4 home cells (also in HOME_CELLS below)
  'o30', 'o03', 'o63', 'o36',
  // 3 extra safe cross squares — placed at positions between homes
  // Row 0, col 0 (top-left corner area — between green home o03 and blue home via top)
  'o00',
  // Row 6, col 6 (bottom-right — between yellow home o63 and blue home o36 via bottom-right)
  'o66',
  // A midpoint on the left column between red home o30 and other squares
  'o60',
]);

// Home cell positions on the outer ring (edge midpoints):
//   Red:    left edge  → o30 (row 3, col 0)
//   Green:  top edge   → o03 (row 0, col 3)
//   Yellow: bottom edge→ o63 (row 6, col 3)
//   Blue:   right edge → o36 (row 3, col 6)
const HOME_CELLS: Record<PlayerColor, string> = {
  red:    'o30',
  green:  'o03',
  yellow: 'o63',
  blue:   'o36',
};

// ─── Build cell map ────────────────────────────────────────────────────────

function buildCells(): Record<string, Cell> {
  const cells: Record<string, Cell> = {};

  for (const id of OUTER_RING_IDS) {
    const isSafe = OUTER_SAFE_IDS.has(id);
    // Assign owner to home cells
    const ownerEntry = Object.entries(HOME_CELLS).find(([, hid]) => hid === id);
    const owner = ownerEntry ? (ownerEntry[0] as PlayerColor) : undefined;
    cells[id] = outer(id, isSafe, owner);
  }

  // Home-stretch cells (private inner paths)
  // Red: col 0 inner → row 3 col 1,2 then center
  cells['hr1'] = hs('hr1', 'red');
  cells['hr2'] = hs('hr2', 'red');
  // Green: row 0 inner → row 1,2 col 3 then center
  cells['hg1'] = hs('hg1', 'green');
  cells['hg2'] = hs('hg2', 'green');
  // Yellow: row 6 inner → row 5,4 col 3 then center
  cells['hy1'] = hs('hy1', 'yellow');
  cells['hy2'] = hs('hy2', 'yellow');
  // Blue: col 6 inner → row 3 col 5,4 then center
  cells['hb1'] = hs('hb1', 'blue');
  cells['hb2'] = hs('hb2', 'blue');

  // Center
  cells['center'] = center();

  return cells;
}

// ─── Build player paths ────────────────────────────────────────────────────
//
// Each player's outerSequence starts at the entry cell (one step anti-clockwise
// BEFORE their home on the ring) and proceeds for the full ring length (24 cells),
// ending one step before returning to the entry cell.
// Entry = where a pawn lands on a roll of 1 (the home square itself per PRD §8.4.1).
//
// PRD §8.4.1: "A pawn may only enter at the player's home square when a roll of 1 occurs."
// So outerSequence[0] = homeCellId.

function makeOuterSequence(startId: string): string[] {
  const startIdx = OUTER_RING_IDS.indexOf(startId);
  if (startIdx === -1) throw new Error(`Home cell ${startId} not found in outer ring`);
  const seq: string[] = [];
  for (let i = 0; i < OUTER_RING_IDS.length; i++) {
    seq.push(OUTER_RING_IDS[(startIdx + i) % OUTER_RING_IDS.length]);
  }
  return seq;
}

function buildPlayers(): Record<PlayerColor, PlayerPath> {
  return {
    red: {
      color: 'red',
      homeCellId: HOME_CELLS.red,
      outerSequence: makeOuterSequence(HOME_CELLS.red),
      homeStretchSequence: ['hr1', 'hr2', 'center'],
    },
    green: {
      color: 'green',
      homeCellId: HOME_CELLS.green,
      outerSequence: makeOuterSequence(HOME_CELLS.green),
      homeStretchSequence: ['hg1', 'hg2', 'center'],
    },
    yellow: {
      color: 'yellow',
      homeCellId: HOME_CELLS.yellow,
      outerSequence: makeOuterSequence(HOME_CELLS.yellow),
      homeStretchSequence: ['hy1', 'hy2', 'center'],
    },
    blue: {
      color: 'blue',
      homeCellId: HOME_CELLS.blue,
      outerSequence: makeOuterSequence(HOME_CELLS.blue),
      homeStretchSequence: ['hb1', 'hb2', 'center'],
    },
  };
}

// ─── Exported BoardData ────────────────────────────────────────────────────

export const PLACEHOLDER_BOARD: BoardData = {
  cells: buildCells(),
  players: buildPlayers(),
  centerCellId: 'center',
};

export const DEFAULT_BOARD = PLACEHOLDER_BOARD;
