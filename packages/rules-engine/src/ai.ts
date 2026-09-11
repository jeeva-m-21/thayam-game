/**
 * ai.ts — Heuristic AI opponent for Thayam
 *
 * Three difficulty tiers per AGENTS.md §7 weight table.
 * ALL difficulty tiers call the exact same legalMoves() from moves.ts —
 * an AI illegal move is impossible by construction.
 *
 * Zero runtime dependencies.
 */

import type { GameState, Move, PlayerColor } from './types.js';
import { OFF_BOARD, isAtCenter, pathLength } from './types.js';
import { legalMoves } from './moves.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Weight tables (AGENTS.md §7) ─────────────────────────────────────────

interface Weights {
  completesACut: number;
  escapesThreatenedCell: number;
  advancesInnerUnlock: number;
  entersNewPawn: number;
  movesToSafeCell: number;
  rawDistance: number;
}

const WEIGHTS: Record<Difficulty, Weights> = {
  easy:   { completesACut: 1, escapesThreatenedCell: 0, advancesInnerUnlock: 0, entersNewPawn: 1, movesToSafeCell: 0, rawDistance: 1 },
  medium: { completesACut: 3, escapesThreatenedCell: 2, advancesInnerUnlock: 3, entersNewPawn: 1, movesToSafeCell: 1, rawDistance: 1 },
  hard:   { completesACut: 5, escapesThreatenedCell: 4, advancesInnerUnlock: 5, entersNewPawn: 2, movesToSafeCell: 3, rawDistance: 1 },
};

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Pick the best legal move for the current player given the roll value.
 * Returns null if there are no legal moves (caller should handle auto-pass).
 */
export function pickAiMove(
  state: GameState,
  rollValue: number,
  difficulty: Difficulty,
  rng: () => number = Math.random,
): Move | null {
  const moves = legalMoves(state, rollValue);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const weights = WEIGHTS[difficulty];

  // Easy: 40% chance to pick randomly, ignoring scoring
  if (difficulty === 'easy' && rng() < 0.4) {
    return moves[Math.floor(rng() * moves.length)];
  }

  // Score each move
  let scored = moves.map((m) => ({
    move: m,
    score: scoreMove(state, m, weights),
  }));

  // Hard: 1-ply lookahead — re-score by simulating resulting state for opponent threat
  if (difficulty === 'hard') {
    scored = scored.map(({ move, score }) => ({
      move,
      score: score - lookaheadOpponentThreat(state, move),
    }));
  }

  // Pick highest score; break ties randomly
  const maxScore = Math.max(...scored.map((s) => s.score));
  const best = scored.filter((s) => s.score === maxScore);
  return best[Math.floor(rng() * best.length)].move;
}

// ─── Scoring ───────────────────────────────────────────────────────────────

function scoreMove(state: GameState, move: Move, w: Weights): number {
  let score = 0;
  const player = state.players[move.playerColor];
  const path = state.board.players[move.playerColor];

  // Factor 1: Completes a cut
  if (move.cutsPawnIds.length > 0) {
    score += w.completesACut * move.cutsPawnIds.length;
  }

  // Factor 2: Advances inner-unlock (prioritise cut when hasCut=false)
  if (!player.hasCutOpponent && move.cutsPawnIds.length > 0) {
    score += w.advancesInnerUnlock;
  }

  // Factor 3: Enters a new pawn (off-board → board on roll of 1)
  const pawn = player.pawns[move.pawnId];
  if (pawn.position === OFF_BOARD && move.rollValue === 1) {
    score += w.entersNewPawn;
  }

  // Factor 4: Moves onto a safe cell
  const destCellId = move.toPosition < path.outerSequence.length
    ? path.outerSequence[move.toPosition]
    : path.homeStretchSequence[move.toPosition - path.outerSequence.length];
  if (state.board.cells[destCellId]?.isSafe) {
    score += w.movesToSafeCell;
  }

  // Factor 5: Escapes a threatened cell (pawn on a cell opponent can reach next turn)
  if (w.escapesThreatenedCell > 0 && pawn.position !== OFF_BOARD) {
    const currentCellId = pawn.position < path.outerSequence.length
      ? path.outerSequence[pawn.position]
      : path.homeStretchSequence[pawn.position - path.outerSequence.length];
    if (isCellThreatened(state, move.playerColor, currentCellId)) {
      score += w.escapesThreatenedCell;
    }
  }

  // Factor 6: Raw distance advanced (tiebreaker)
  const distanceMoved = pawn.position === OFF_BOARD ? 1 : move.toPosition - pawn.position;
  score += w.rawDistance * Math.max(0, distanceMoved);

  return score;
}

/**
 * 1-ply lookahead: estimate the maximum opponent threat after this move.
 * Returns a penalty to subtract from this move's score.
 */
function lookaheadOpponentThreat(state: GameState, move: Move): number {
  const currentColor = move.playerColor;
  const path = state.board.players[currentColor];
  const destCellId = move.toPosition < path.outerSequence.length
    ? path.outerSequence[move.toPosition]
    : path.homeStretchSequence[move.toPosition - path.outerSequence.length];

  if (state.board.cells[destCellId]?.isSafe) return 0;

  // Check if any opponent can reach destCellId on any possible next roll
  let maxThreat = 0;
  for (const [oppColor, oppPlayer] of Object.entries(state.players)) {
    if (oppColor === currentColor) continue;
    const oppPath = state.board.players[oppColor as PlayerColor];

    for (const oppPawn of oppPlayer.pawns) {
      if (oppPawn.position === OFF_BOARD) continue;
      if (isAtCenter(oppPawn.position, oppPath)) continue;

      // Can any roll 1–6 or 12 let this opponent pawn reach destCellId?
      for (const roll of [1, 2, 3, 4, 5, 6, 12]) {
        const oppDest = oppPawn.position + roll;
        if (oppDest >= pathLength(oppPath)) continue;
        const oppDestCellId = oppDest < oppPath.outerSequence.length
          ? oppPath.outerSequence[oppDest]
          : oppPath.homeStretchSequence[oppDest - oppPath.outerSequence.length];
        if (oppDestCellId === destCellId) {
          maxThreat = Math.max(maxThreat, 3);
          break;
        }
      }
    }
  }
  return maxThreat;
}

/**
 * Check if a cell is currently threatened by any opponent (they can reach it).
 */
function isCellThreatened(
  state: GameState,
  ownColor: PlayerColor,
  cellId: string,
): boolean {
  if (state.board.cells[cellId]?.isSafe) return false;

  for (const [oppColor, oppPlayer] of Object.entries(state.players)) {
    if (oppColor === ownColor) continue;
    const oppPath = state.board.players[oppColor as PlayerColor];
    for (const oppPawn of oppPlayer.pawns) {
      if (oppPawn.position === OFF_BOARD) continue;
      for (const roll of [1, 2, 3, 4, 5, 6, 12]) {
        const dest = oppPawn.position + roll;
        if (dest >= pathLength(oppPath)) continue;
        const destCellId = dest < oppPath.outerSequence.length
          ? oppPath.outerSequence[dest]
          : oppPath.homeStretchSequence[dest - oppPath.outerSequence.length];
        if (destCellId === cellId) return true;
      }
    }
  }
  return false;
}
