/**
 * board-invariants.test.ts — P1-03 + P2-02 board invariant checker
 *
 * V-model verify: structural invariants of ANY BoardData.
 * Phase 1 runs this against the placeholder; Phase 2 runs the same
 * checker against the real digitized board — zero engine code changes required.
 *
 * Checks:
 * - Exactly 8 safe cells (PRD §8.2)
 * - All 4 home cells exist and are safe
 * - Center cell exists and is safe
 * - Each player path: outerSequence length = 24, homeStretchSequence ends at center
 * - 90° rotational symmetry: all 4 player outer sequences are rotations of each other
 * - No duplicate cell IDs within any player path
 * - All cell IDs referenced in paths exist in cells map
 */
import { describe, it, expect } from 'vitest';
import { PLACEHOLDER_BOARD } from '../src/board-data.js';
import type { BoardData, PlayerColor } from '../src/types.js';
import { ALL_PLAYER_COLORS } from '../src/types.js';

/** Reusable invariant checker — call with any BoardData */
export function assertBoardInvariants(board: BoardData, label = 'board'): void {
  const { cells, players, centerCellId } = board;

  // 1. Center cell exists and is safe
  expect(cells[centerCellId], `${label}: center cell missing`).toBeDefined();
  expect(cells[centerCellId].isSafe, `${label}: center must be safe`).toBe(true);
  expect(cells[centerCellId].type).toBe('center');

  // 2. Exactly 8 safe cells total (PRD §8.2)
  const safeCells = Object.values(cells).filter((c) => c.isSafe);
  expect(safeCells.length, `${label}: must have exactly 8 safe cells`).toBe(8);

  // 3. All 4 home cells exist and are safe
  for (const color of ALL_PLAYER_COLORS) {
    const path = players[color];
    expect(path, `${label}: missing player path for ${color}`).toBeDefined();
    const homeCell = cells[path.homeCellId];
    expect(homeCell, `${label}: home cell ${path.homeCellId} for ${color} missing`).toBeDefined();
    expect(homeCell.isSafe, `${label}: home cell for ${color} must be safe`).toBe(true);
  }

  // 4. Each player's homeStretchSequence ends at centerCellId
  for (const color of ALL_PLAYER_COLORS) {
    const hs = players[color].homeStretchSequence;
    expect(hs.length, `${label}: ${color} homeStretch must have ≥1 cell`).toBeGreaterThan(0);
    expect(
      hs[hs.length - 1],
      `${label}: ${color} homeStretch last cell must be center`,
    ).toBe(centerCellId);
  }

  // 5. All cell IDs in paths exist in cells map
  for (const color of ALL_PLAYER_COLORS) {
    const path = players[color];
    for (const id of [...path.outerSequence, ...path.homeStretchSequence]) {
      expect(cells[id], `${label}: cell "${id}" in ${color} path not in cells map`).toBeDefined();
    }
  }

  // 6. No duplicates within each player's own full path
  for (const color of ALL_PLAYER_COLORS) {
    const path = players[color];
    const full = [...path.outerSequence, ...path.homeStretchSequence];
    // Center is shared — exclude it from duplicate check within home stretch
    const withoutCenter = full.filter((id) => id !== centerCellId);
    const unique = new Set(withoutCenter);
    expect(
      unique.size,
      `${label}: ${color} path has duplicate cell IDs`,
    ).toBe(withoutCenter.length);
  }

  // 7. Rotational symmetry: all 4 outer sequences are the same length
  const outerLengths = ALL_PLAYER_COLORS.map((c) => players[c].outerSequence.length);
  const refLength = outerLengths[0];
  for (const [i, len] of outerLengths.entries()) {
    expect(len, `${label}: ${ALL_PLAYER_COLORS[i]} outerSequence length mismatch`).toBe(refLength);
  }

  // 8. All 4 outer sequences are cyclic rotations of each other (same set of cells)
  const refSet = new Set(players['red'].outerSequence);
  for (const color of ALL_PLAYER_COLORS) {
    const pathSet = new Set(players[color].outerSequence);
    expect(
      pathSet.size,
      `${label}: ${color} outerSequence size mismatch`,
    ).toBe(refSet.size);
    for (const id of pathSet) {
      expect(refSet.has(id), `${label}: ${color} outerSequence cell ${id} not in red's sequence`).toBe(true);
    }
  }
}

describe('board-data — PLACEHOLDER_BOARD structural invariants [P1-03]', () => {
  it('passes all board invariants', () => {
    assertBoardInvariants(PLACEHOLDER_BOARD, 'PLACEHOLDER_BOARD');
  });

  it('outer ring has 24 cells', () => {
    const redOuter = PLACEHOLDER_BOARD.players.red.outerSequence;
    expect(redOuter).toHaveLength(24);
  });

  it('each player home-stretch has 3 cells (2 inner + center)', () => {
    for (const color of ALL_PLAYER_COLORS) {
      expect(
        PLACEHOLDER_BOARD.players[color].homeStretchSequence,
      ).toHaveLength(3);
    }
  });

  it('total cells in map = 24 outer + 8 home-stretch + 1 center = 33', () => {
    expect(Object.keys(PLACEHOLDER_BOARD.cells)).toHaveLength(33);
  });

  it('4 home cells are correctly identified as safe and have ownerColor', () => {
    const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
    for (const color of colors) {
      const homeId = PLACEHOLDER_BOARD.players[color].homeCellId;
      const cell = PLACEHOLDER_BOARD.cells[homeId];
      expect(cell.isSafe).toBe(true);
      expect(cell.ownerColor).toBe(color);
    }
  });

  it('home cell is outerSequence[0] for each player (entry on roll of 1 lands at home)', () => {
    for (const color of ALL_PLAYER_COLORS) {
      const path = PLACEHOLDER_BOARD.players[color];
      expect(path.outerSequence[0]).toBe(path.homeCellId);
    }
  });
});
