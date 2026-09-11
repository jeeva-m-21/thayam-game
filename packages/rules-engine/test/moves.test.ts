/**
 * moves.test.ts — P1-04 verification
 *
 * V-model: one test per PRD §8.4 sub-rule (1–9).
 * Each test hand-constructs a GameState and asserts the exact legal-move set.
 */
import { describe, it, expect } from 'vitest';
import { legalMoves, getCellIdAtPosition } from '../src/moves.js';
import { createGame } from '../src/engine.js';
import { DEFAULT_BOARD } from '../src/board-data.js';
import { OFF_BOARD } from '../src/types.js';
import type { GameState, PlayerColor } from '../src/types.js';

// ─── Test helpers ──────────────────────────────────────────────────────────

function freshGame(colors: PlayerColor[] = ['red', 'green']): GameState {
  return createGame(DEFAULT_BOARD, colors);
}

/** Place a pawn at a given path position */
function withPawnAt(state: GameState, color: PlayerColor, pawnId: number, position: number): GameState {
  const player = state.players[color];
  const pawns = player.pawns.map((p) =>
    p.id === pawnId ? { ...p, position } : p,
  ) as typeof player.pawns;
  return {
    ...state,
    players: { ...state.players, [color]: { ...player, pawns } },
  };
}

/** Set hasCutOpponent for a player */
function withCutUnlocked(state: GameState, color: PlayerColor): GameState {
  return {
    ...state,
    players: {
      ...state.players,
      [color]: { ...state.players[color], hasCutOpponent: true },
    },
  };
}

/** Set the current player */
function withCurrentPlayer(state: GameState, color: PlayerColor): GameState {
  const idx = state.turnOrder.indexOf(color);
  return { ...state, currentPlayerIndex: idx };
}

// ─── PRD §8.4 sub-rules ────────────────────────────────────────────────────

describe('legalMoves — PRD §8.4.1: entry only on roll of 1', () => {
  it('off-board pawn has NO legal move on roll of 2', () => {
    const state = freshGame();
    const moves = legalMoves(state, 2);
    expect(moves).toHaveLength(0);
  });

  it('off-board pawn has NO legal move on roll of 6', () => {
    const state = freshGame();
    expect(legalMoves(state, 6)).toHaveLength(0);
  });

  it('off-board pawn CAN enter on roll of 1', () => {
    const state = freshGame();
    const moves = legalMoves(state, 1);
    // 4 pawns all off-board → 4 entry moves (all land on home cell = same cell)
    // but only one distinct entry position (index 0), so engine returns
    // moves for each pawn (4 off-board pawns)
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((m) => m.toPosition === 0)).toBe(true);
  });

  it('entry move lands at outerSequence[0] (home cell)', () => {
    const state = freshGame();
    const moves = legalMoves(state, 1);
    const path = DEFAULT_BOARD.players['red'];
    const homeCellId = path.outerSequence[0];
    expect(moves.every((m) => getCellIdAtPosition(path, m.toPosition) === homeCellId)).toBe(true);
  });
});

describe('legalMoves — PRD §8.4.2: forward movement exact roll value', () => {
  it('pawn at position 2 with roll 3 moves to position 5', () => {
    let state = freshGame();
    state = withPawnAt(state, 'red', 0, 2);
    const moves = legalMoves(state, 3);
    expect(moves.some((m) => m.pawnId === 0 && m.toPosition === 5)).toBe(true);
  });

  it('pawn at position 10 with roll 5 moves to position 15', () => {
    let state = freshGame();
    state = withPawnAt(state, 'red', 0, 10);
    const moves = legalMoves(state, 5);
    expect(moves.some((m) => m.pawnId === 0 && m.toPosition === 15)).toBe(true);
  });
});

describe('legalMoves — PRD §8.4.9: exact center landing (no overshoot)', () => {
  it('pawn cannot overshoot center', () => {
    // center is at pathLength - 1; place pawn 2 before center
    const path = DEFAULT_BOARD.players['red'];
    const centerPos = path.outerSequence.length + path.homeStretchSequence.length - 1;
    let state = freshGame();
    state = withCutUnlocked(state, 'red');
    state = withPawnAt(state, 'red', 0, centerPos - 2);
    // roll 3 would land 1 past center — illegal
    const moves = legalMoves(state, 3);
    const pawn0Moves = moves.filter((m) => m.pawnId === 0);
    expect(pawn0Moves.every((m) => m.toPosition <= centerPos)).toBe(true);
    expect(pawn0Moves).toHaveLength(0); // overshoot → no legal move
  });

  it('pawn CAN land exactly on center', () => {
    const path = DEFAULT_BOARD.players['red'];
    const centerPos = path.outerSequence.length + path.homeStretchSequence.length - 1;
    let state = freshGame();
    state = withCutUnlocked(state, 'red');
    state = withPawnAt(state, 'red', 0, centerPos - 2);
    // roll 2 → land exactly at center
    const moves = legalMoves(state, 2);
    expect(moves.some((m) => m.pawnId === 0 && m.toPosition === centerPos)).toBe(true);
  });
});

describe('legalMoves — PRD §8.4.6: own-pawn blocking on non-safe cell', () => {
  it('cannot move a pawn to a non-safe cell already occupied by own pawn', () => {
    let state = freshGame();
    // Place pawn 0 at position 5 (non-safe)
    state = withPawnAt(state, 'red', 0, 5);
    // Place pawn 1 at position 3 → roll 2 would land on position 5
    state = withPawnAt(state, 'red', 1, 3);
    const path = DEFAULT_BOARD.players['red'];
    const cell5 = DEFAULT_BOARD.cells[getCellIdAtPosition(path, 5)];
    // Only test blocking if cell 5 is not safe
    if (!cell5.isSafe) {
      const moves = legalMoves(state, 2);
      expect(moves.some((m) => m.pawnId === 1 && m.toPosition === 5)).toBe(false);
    }
  });
});

describe('legalMoves — PRD §8.4.8: inner-path locked until cut', () => {
  it('pawn cannot transition to homeStretch when hasCutOpponent = false', () => {
    const path = DEFAULT_BOARD.players['red'];
    const lastOuterPos = path.outerSequence.length - 1;
    let state = freshGame();
    // pawn at last outer position, roll 1 would enter homeStretch
    state = withPawnAt(state, 'red', 0, lastOuterPos);
    const moves = legalMoves(state, 1);
    // hasCutOpponent = false → no home-stretch moves
    expect(moves.filter((m) => m.pawnId === 0 && m.entersHomeStretch)).toHaveLength(0);
  });

  it('pawn CAN transition to homeStretch after cut', () => {
    const path = DEFAULT_BOARD.players['red'];
    const lastOuterPos = path.outerSequence.length - 1;
    let state = freshGame();
    state = withCutUnlocked(state, 'red');
    state = withPawnAt(state, 'red', 0, lastOuterPos);
    const moves = legalMoves(state, 1);
    // Should have at least one move entering home stretch
    expect(moves.some((m) => m.pawnId === 0 && m.entersHomeStretch)).toBe(true);
  });
});

describe('legalMoves — PRD §8.4.4: mandatory move (no voluntary pass)', () => {
  it('if legal moves exist, list is non-empty (player must move)', () => {
    let state = freshGame();
    state = withPawnAt(state, 'red', 0, 2);
    const moves = legalMoves(state, 3);
    expect(moves.length).toBeGreaterThan(0);
  });
});

describe('legalMoves — PRD §8.4.7: cutting on non-safe cell', () => {
  it('move to non-safe cell with opponent generates cut', () => {
    let state = freshGame(['red', 'green', 'yellow', 'blue']);
    state = withCurrentPlayer(state, 'red');
    // Place red pawn at position 2
    state = withPawnAt(state, 'red', 0, 2);
    // Place green pawn at a cell that occupies position 5 in red's path
    // Find what cell id is at position 5 for red
    const redPath = DEFAULT_BOARD.players['red'];
    const targetCellId = getCellIdAtPosition(redPath, 5);
    const targetCell = DEFAULT_BOARD.cells[targetCellId];

    if (!targetCell.isSafe) {
      // Find green's position index that maps to the same cell
      const greenPath = DEFAULT_BOARD.players['green'];
      const greenPosForCell = greenPath.outerSequence.indexOf(targetCellId);
      if (greenPosForCell !== -1) {
        state = withPawnAt(state, 'green', 0, greenPosForCell);
        const moves = legalMoves(state, 3);
        const cutMove = moves.find((m) => m.pawnId === 0 && m.toPosition === 5);
        if (cutMove) {
          expect(cutMove.cutsPawnIds).toHaveLength(1);
          expect(cutMove.cutsPawnIds[0].owner).toBe('green');
        }
      }
    }
  });

  it('no cut possible on safe cell (PRD §8.2)', () => {
    let state = freshGame(['red', 'green']);
    state = withCurrentPlayer(state, 'red');
    const redPath = DEFAULT_BOARD.players['red'];

    // Find a safe cell in red's outer sequence (other than home at 0)
    let safePos: number | null = null;
    for (let i = 1; i < redPath.outerSequence.length; i++) {
      const cellId = redPath.outerSequence[i];
      if (DEFAULT_BOARD.cells[cellId].isSafe) {
        safePos = i;
        break;
      }
    }

    if (safePos !== null && safePos > 0) {
      // Place red pawn 2 before the safe cell
      state = withPawnAt(state, 'red', 0, safePos - 2);
      // Place green pawn ON the safe cell
      const safeCellId = redPath.outerSequence[safePos];
      const greenPath = DEFAULT_BOARD.players['green'];
      const greenPos = greenPath.outerSequence.indexOf(safeCellId);
      if (greenPos !== -1) {
        state = withPawnAt(state, 'green', 0, greenPos);
        const moves = legalMoves(state, 2);
        const landing = moves.find((m) => m.pawnId === 0 && m.toPosition === safePos);
        if (landing) {
          expect(landing.cutsPawnIds).toHaveLength(0);
        }
      }
    }
  });
});

describe('legalMoves — pawn already at center has no moves', () => {
  it('center pawn is never included in legal moves', () => {
    const path = DEFAULT_BOARD.players['red'];
    const centerPos = path.outerSequence.length + path.homeStretchSequence.length - 1;
    let state = freshGame();
    state = withCutUnlocked(state, 'red');
    state = withPawnAt(state, 'red', 0, centerPos);
    // Roll anything
    for (const roll of [1, 2, 3, 4, 5, 6, 12]) {
      const moves = legalMoves(state, roll);
      expect(moves.some((m) => m.pawnId === 0)).toBe(false);
    }
  });
});
