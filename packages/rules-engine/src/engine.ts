/**
 * engine.ts — Thayam turn state machine
 *
 * applyMove(state, move): GameState
 * applyRoll(state, roll): GameState
 * createGame(board, playerColors, turnOrder): GameState
 *
 * Handles:
 * - PRD §8.4.5: turn ends when no bonus roll and all moves exhausted
 * - PRD §8.4.3: bonus rolls on 1/5/6/12 — re-roll granted, turn continues
 * - PRD §8.4.4: mandatory move — if any legal move exists, must take it
 * - PRD §8.4.7: cutting — sends all opponent pawns on the cell off-board
 * - PRD §8.4.8: inner-path unlock — hasCutOpponent set on first successful cut
 * - PRD §8.4.9: win — all 4 pawns at center, game-over phase
 *
 * Zero runtime dependencies.
 */

import type {
  GameState,
  Move,
  DiceRoll,
  PlayerColor,
  PlayerState,
  PawnState,
  BoardData,
} from './types.js';
import {
  OFF_BOARD,
  isAtCenter,
  pathLength,
  isBonusRoll,
} from './types.js';
import { legalMoves } from './moves.js';

// ─── Factory ────────────────────────────────────────────────────────────────

export function createGame(
  board: BoardData,
  playerColors: PlayerColor[],
  turnOrder: PlayerColor[] = playerColors,
): GameState {
  const players: Record<string, PlayerState> = {};

  for (const color of playerColors) {
    const pawns: [PawnState, PawnState, PawnState, PawnState] = [
      { id: 0, owner: color, position: OFF_BOARD },
      { id: 1, owner: color, position: OFF_BOARD },
      { id: 2, owner: color, position: OFF_BOARD },
      { id: 3, owner: color, position: OFF_BOARD },
    ];
    players[color] = { color, pawns, hasCutOpponent: false };
  }

  return {
    board,
    players: players as Record<PlayerColor, PlayerState>,
    turnOrder,
    currentPlayerIndex: 0,
    phase: 'waiting-for-roll',
    currentRoll: null,
    bonusRollsRemaining: 0,
    winner: null,
  };
}

// ─── Roll ───────────────────────────────────────────────────────────────────

/**
 * Apply a dice roll to the state.
 * Transitions phase from 'waiting-for-roll' to 'waiting-for-move'.
 * If no legal moves exist → auto-advance turn (but bonus roll still granted first
 * if the value is 1/5/6/12, per PRD §8.4.3 edge case).
 */
export function applyRoll(state: GameState, roll: DiceRoll): GameState {
  if (state.phase === 'game-over') return state;
  if (state.phase !== 'waiting-for-roll') {
    throw new Error('applyRoll called when not in waiting-for-roll phase');
  }

  const withRoll: GameState = {
    ...state,
    currentRoll: roll,
    phase: 'waiting-for-move',
  };

  // If bonus roll triggers but no legal moves, immediately re-queue the bonus
  // (handled by the move application — here we just set the phase correctly)
  const moves = legalMoves(withRoll, roll.value);
  if (moves.length === 0) {
    // No legal moves with this roll
    if (isBonusRoll(roll.value)) {
      // Grant the bonus roll — turn continues, player must roll again
      return {
        ...withRoll,
        phase: 'waiting-for-roll',
        bonusRollsRemaining: state.bonusRollsRemaining + 1,
      };
    }
    // No bonus, no moves — advance turn
    return advanceTurn(withRoll);
  }

  return withRoll;
}

// ─── Move ───────────────────────────────────────────────────────────────────

/**
 * Apply a chosen move to the state.
 * Validates the move is currently legal before applying.
 * Returns the new GameState after the move.
 */
export function applyMove(state: GameState, move: Move): GameState {
  if (state.phase === 'game-over') {
    throw new Error('applyMove called after game is over');
  }
  if (state.phase !== 'waiting-for-move') {
    throw new Error('applyMove called when not in waiting-for-move phase');
  }

  const currentRoll = state.currentRoll!;
  const legal = legalMoves(state, currentRoll.value);

  // Validate the submitted move is in the legal set
  const isLegal = legal.some(
    (m) => m.playerColor === move.playerColor && m.pawnId === move.pawnId && m.toPosition === move.toPosition,
  );
  if (!isLegal) {
    throw new Error(
      `Illegal move: pawn ${move.pawnId} of ${move.playerColor} to position ${move.toPosition}`,
    );
  }

  // Apply the move: update pawn positions
  let newState = movePawn(state, move);

  // Apply cuts: send cut pawns off-board
  if (move.cutsPawnIds.length > 0) {
    newState = applyCuts(newState, move.cutsPawnIds);
    // Mark the moving player as having cut an opponent (unlocks inner path)
    newState = setHasCutOpponent(newState, move.playerColor);
  }

  // Check win condition (PRD §8.4.9)
  if (hasWon(newState, move.playerColor)) {
    return { ...newState, phase: 'game-over', winner: move.playerColor };
  }

  // Bonus roll logic (PRD §8.4.3)
  if (isBonusRoll(currentRoll.value)) {
    return {
      ...newState,
      phase: 'waiting-for-roll',
      currentRoll: null,
    };
  }

  // Normal turn end
  return advanceTurn(newState);
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function movePawn(state: GameState, move: Move): GameState {
  const playerState = state.players[move.playerColor];
  const newPawns = playerState.pawns.map((p) =>
    p.id === move.pawnId ? { ...p, position: move.toPosition } : p,
  ) as [PawnState, PawnState, PawnState, PawnState];

  return {
    ...state,
    players: {
      ...state.players,
      [move.playerColor]: { ...playerState, pawns: newPawns },
    },
  };
}

function applyCuts(
  state: GameState,
  cuts: Array<{ owner: PlayerColor; pawnId: number }>,
): GameState {
  let newState = state;
  for (const { owner, pawnId } of cuts) {
    const ownerState = newState.players[owner];
    const newPawns = ownerState.pawns.map((p) =>
      p.id === pawnId ? { ...p, position: OFF_BOARD } : p,
    ) as [PawnState, PawnState, PawnState, PawnState];
    newState = {
      ...newState,
      players: {
        ...newState.players,
        [owner]: { ...ownerState, pawns: newPawns },
      },
    };
  }
  return newState;
}

function setHasCutOpponent(state: GameState, color: PlayerColor): GameState {
  if (state.players[color].hasCutOpponent) return state; // already set
  return {
    ...state,
    players: {
      ...state.players,
      [color]: { ...state.players[color], hasCutOpponent: true },
    },
  };
}

function hasWon(state: GameState, color: PlayerColor): boolean {
  const path = state.board.players[color];
  return state.players[color].pawns.every((p) => isAtCenter(p.position, path));
}

function advanceTurn(state: GameState): GameState {
  const nextIndex = (state.currentPlayerIndex + 1) % state.turnOrder.length;
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    phase: 'waiting-for-roll',
    currentRoll: null,
    bonusRollsRemaining: 0,
  };
}

// ─── Invariant helpers (used by fuzz harness) ───────────────────────────────

export function assertGameInvariants(state: GameState): void {
  for (const color of state.turnOrder) {
    const player = state.players[color];
    const path = state.board.players[color];

    // PRD: total pawn count per player always exactly 4
    if (player.pawns.length !== 4) {
      throw new Error(`${color}: pawn count is ${player.pawns.length}, expected 4`);
    }

    for (const pawn of player.pawns) {
      const pos = pawn.position;

      // Inner-path pawns require hasCutOpponent
      if (pos !== OFF_BOARD && pos >= path.outerSequence.length && !player.hasCutOpponent) {
        throw new Error(
          `${color} pawn ${pawn.id} is on home-stretch at position ${pos} but hasCutOpponent is false`,
        );
      }
    }

    // No non-safe cell should hold >1 pawn from any single player
    const cellCounts = new Map<string, number>();
    for (const pawn of player.pawns) {
      if (pawn.position === OFF_BOARD) continue;
      const cellId = pawn.position < path.outerSequence.length
        ? path.outerSequence[pawn.position]
        : path.homeStretchSequence[pawn.position - path.outerSequence.length];
      const cell = state.board.cells[cellId];
      if (!cell.isSafe) {
        cellCounts.set(cellId, (cellCounts.get(cellId) ?? 0) + 1);
        if ((cellCounts.get(cellId) ?? 0) > 1) {
          throw new Error(`${color}: multiple own pawns on non-safe cell ${cellId}`);
        }
      }
    }
  }
}
