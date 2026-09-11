/**
 * moves.ts — Legal move generator
 *
 * legalMoves(state, rollValue): Move[]
 *
 * Covers all PRD §8.4 sub-rules:
 * 1. Entry: pawn enters at home on roll of 1 only
 * 2. Forward movement by exact roll value
 * 3. Cannot move pawn past center (exact landing required)
 * 4. Cannot land on own-pawn-occupied cell (non-safe)
 * 5. Inner-path transition only if player.hasCutOpponent === true
 * 6. Mandatory-move: if any legal move exists, player must take one
 * 7. Multiple opponent pawns cut in one move (if cell is non-safe)
 * 8. Safe cells: can always land, even if opponents present
 *
 * Zero runtime dependencies.
 */

import type {
  GameState,
  Move,
  PawnState,
  PlayerColor,
  BoardData,
  PlayerPath,
} from './types.js';
import { OFF_BOARD, isAtCenter, isOnHomeStretch, pathLength } from './types.js';

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Returns all legal moves for the current player given a roll value.
 * Returns [] if no legal moves exist (forced pass is handled by engine.ts).
 */
export function legalMoves(state: GameState, rollValue: number): Move[] {
  const player = state.players[state.turnOrder[state.currentPlayerIndex]];
  const path = state.board.players[player.color];
  const moves: Move[] = [];

  for (const pawn of player.pawns) {
    const movesForPawn = movesForPawnWithRoll(
      state,
      pawn,
      path,
      player.color,
      player.hasCutOpponent,
      rollValue,
    );
    moves.push(...movesForPawn);
  }

  return moves;
}

// ─── Internal ──────────────────────────────────────────────────────────────

function movesForPawnWithRoll(
  state: GameState,
  pawn: PawnState,
  path: PlayerPath,
  color: PlayerColor,
  hasCutOpponent: boolean,
  rollValue: number,
): Move[] {
  // PRD §8.4.1: only roll of 1 can enter an off-board pawn
  if (pawn.position === OFF_BOARD) {
    if (rollValue !== 1) return [];
    return tryEntryMove(state, pawn, path, color);
  }

  // Pawn already at center — no movement possible
  if (isAtCenter(pawn.position, path)) return [];

  // Try moving forward by rollValue steps
  return tryForwardMove(state, pawn, path, color, hasCutOpponent, rollValue);
}

/** Entry move: place pawn on home cell (outerSequence[0]) */
function tryEntryMove(
  state: GameState,
  pawn: PawnState,
  path: PlayerPath,
  color: PlayerColor,
): Move[] {
  // Entry position is index 0 in the player's outerSequence (the home cell)
  const toPosition = 0;
  const toCellId = path.outerSequence[0];
  const toCell = state.board.cells[toCellId];

  // PRD §8.4.6: cannot land on a non-safe cell occupied by own pawn
  if (!toCell.isSafe && isOccupiedByOwn(state, color, toPosition, path)) {
    return [];
  }

  const cuts = toCell.isSafe ? [] : findCuts(state, color, toCellId);

  return [
    {
      playerColor: color,
      pawnId: pawn.id,
      rollValue: 1,
      toPosition,
      entersHomeStretch: false,
      cutsPawnIds: cuts,
    },
  ];
}

/** Forward move: advance pawn by rollValue steps along its path */
function tryForwardMove(
  state: GameState,
  pawn: PawnState,
  path: PlayerPath,
  color: PlayerColor,
  hasCutOpponent: boolean,
  rollValue: number,
): Move[] {
  const currentPos = pawn.position;
  const outerLen = path.outerSequence.length;
  const totalLen = pathLength(path); // outer + homeStretch
  const centerPos = totalLen - 1;

  // Check if pawn is currently on the outer ring
  const onOuter = !isOnHomeStretch(currentPos, path);

  // Calculate raw destination
  const rawDest = currentPos + rollValue;

  // Case 1: pawn stays on outer ring
  if (onOuter) {
    if (rawDest < outerLen) {
      return tryLandAt(state, pawn, path, color, rawDest, false);
    }

    // rawDest >= outerLen: pawn reaches or passes inner path entry point
    if (hasCutOpponent) {
      // Transition into homeStretch
      const hsPos = rawDest;
      if (hsPos > centerPos) return []; // overshoot center — illegal
      return tryLandAt(state, pawn, path, color, hsPos, true);
    } else {
      // PRD §8.4.8: Until cut is made, pawns continue circling the outer ring
      const wrappedPos = rawDest % outerLen;
      return tryLandAt(state, pawn, path, color, wrappedPos, false);
    }
  }

  // Case 2: pawn already on home stretch — move further toward center
  const dest = currentPos + rollValue;
  if (dest > centerPos) return []; // overshoot — illegal
  return tryLandAt(state, pawn, path, color, dest, false);
}

/** Attempt to land at toPosition; return the move if legal, else []. */
function tryLandAt(
  state: GameState,
  pawn: PawnState,
  path: PlayerPath,
  color: PlayerColor,
  toPosition: number,
  entersHomeStretch: boolean,
): Move[] {
  const toCellId = getCellIdAtPosition(path, toPosition);
  const toCell = state.board.cells[toCellId];

  if (!toCell) return []; // safety guard

  // PRD §8.4.6: cannot land on a non-safe cell already occupied by own pawn
  if (!toCell.isSafe && isOccupiedByOwn(state, color, toPosition, path)) {
    return [];
  }

  const cuts = toCell.isSafe ? [] : findCuts(state, color, toCellId);

  return [
    {
      playerColor: color,
      pawnId: pawn.id,
      rollValue: pawn.position === OFF_BOARD ? 1 : toPosition - pawn.position,
      toPosition,
      entersHomeStretch,
      cutsPawnIds: cuts,
    },
  ];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Get the cell ID at a given path position index */
export function getCellIdAtPosition(path: PlayerPath, position: number): string {
  if (position < path.outerSequence.length) {
    return path.outerSequence[position];
  }
  const hsIndex = position - path.outerSequence.length;
  return path.homeStretchSequence[hsIndex];
}

/** True if any of the current player's ON-BOARD pawns occupy this path position */
function isOccupiedByOwn(
  state: GameState,
  color: PlayerColor,
  position: number,
  path: PlayerPath,
): boolean {
  const cellId = getCellIdAtPosition(path, position);
  return state.players[color].pawns.some(
    (p) => p.position !== OFF_BOARD && getCellIdAtPosition(path, p.position) === cellId,
  );
}

/**
 * Find all opponent pawns on the given cell (which must be non-safe).
 * Returns array of { owner, pawnId } for each opponent pawn that would be cut.
 * PRD §8.4.7: all opponent pawns on the cell are cut.
 */
function findCuts(
  state: GameState,
  movingColor: PlayerColor,
  cellId: string,
): Array<{ owner: PlayerColor; pawnId: number }> {
  const cuts: Array<{ owner: PlayerColor; pawnId: number }> = [];
  for (const [opponentColor, opponentPlayer] of Object.entries(state.players)) {
    if (opponentColor === movingColor) continue;
    const oppPath = state.board.players[opponentColor as PlayerColor];
    for (const pawn of opponentPlayer.pawns) {
      if (pawn.position === OFF_BOARD) continue;
      const pawnCellId = getCellIdAtPosition(oppPath, pawn.position);
      if (pawnCellId === cellId) {
        cuts.push({ owner: opponentColor as PlayerColor, pawnId: pawn.id });
      }
    }
  }
  return cuts;
}

/**
 * Whether no legal move exists for the current player (forced pass).
 * Used by engine to auto-advance turn.
 */
export function hasNoLegalMoves(state: GameState, rollValue: number): boolean {
  return legalMoves(state, rollValue).length === 0;
}
