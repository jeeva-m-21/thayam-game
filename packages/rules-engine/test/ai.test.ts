import { describe, it, expect } from 'vitest';
import { createGame, applyRoll, applyMove } from '../src/engine.js';
import { DEFAULT_BOARD } from '../src/board-data.js';
import { pickAiMove } from '../src/ai.js';
import { makeDiceRoll } from '../src/dice.js';
import { legalMoves } from '../src/moves.js';

describe('ai opponent - AGENTS.md §7', () => {
  it('picks legal moves for easy, medium, and hard', () => {
    let state = createGame(DEFAULT_BOARD, ['red', 'green']);
    state = applyRoll(state, makeDiceRoll(0, 1)); // roll 1 allows pawn entry
    
    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const move = pickAiMove(state, 1, diff);
      expect(move).not.toBeNull();
      const allLegal = legalMoves(state, 1);
      const isLegal = allLegal.some(m => m.pawnId === move!.pawnId && m.toPosition === move!.toPosition);
      expect(isLegal).toBe(true);
    }
  });

  it('returns null when no legal moves available', () => {
    const state = createGame(DEFAULT_BOARD, ['red', 'green']);
    // Roll 2 when all pawns off-board -> 0 legal moves
    const move = pickAiMove(state, 2, 'medium');
    expect(move).toBeNull();
  });
});
