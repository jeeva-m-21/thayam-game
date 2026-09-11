/**
 * fullMatchSimulation.test.ts — P7-10: End-to-end full match simulation tests
 *
 * Verifies that 2, 3, and 4-player matches run start-to-finish with AI bots across
 * Easy, Medium, and Hard heuristic intelligences without deadlocks or state drift.
 */
import { describe, it, expect } from 'vitest';
import {
  createGame,
  applyRoll,
  applyMove,
  legalMoves,
  rollDice,
  pickAiMove,
  DEFAULT_BOARD,
  assertGameInvariants,
  isAtCenter,
} from '@thayam/rules-engine';
import type { GameState, PlayerColor } from '@thayam/rules-engine';

describe('Full Match Simulation Tests', () => {
  it('simulates 20 complete 2-player matches (Red vs Green) to victory without invariant violations', () => {
    for (let i = 0; i < 20; i++) {
      let state = createGame(DEFAULT_BOARD, ['red', 'green']);
      let turns = 0;
      const MAX_TURNS = 2500;

      while (state.phase !== 'game-over' && turns < MAX_TURNS) {
        turns++;
        if (state.phase === 'waiting-for-roll') {
          const roll = rollDice();
          state = applyRoll(state, roll);
        } else if (state.phase === 'waiting-for-move') {
          const rollVal = state.currentRoll!.value;
          const moves = legalMoves(state, rollVal);
          expect(moves.length).toBeGreaterThan(0);
          const chosen = pickAiMove(state, rollVal, 'medium');
          expect(chosen).not.toBeNull();
          state = applyMove(state, chosen!);
        }
        assertGameInvariants(state);
      }

      expect(state.phase).toBe('game-over');
      expect(state.winner).toBeTruthy();
      const path = state.board.players[state.winner!];
      const winnerPawns = state.players[state.winner!].pawns;
      expect(winnerPawns.every((p) => isAtCenter(p.position, path))).toBe(true);
    }
  });

  it('simulates 15 complete 3-player matches (Red vs Green vs Blue) with mixed AI bots', () => {
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

    for (let i = 0; i < 15; i++) {
      let state = createGame(DEFAULT_BOARD, ['red', 'green', 'blue']);
      let turns = 0;
      const MAX_TURNS = 3500;

      while (state.phase !== 'game-over' && turns < MAX_TURNS) {
        turns++;
        if (state.phase === 'waiting-for-roll') {
          const roll = rollDice();
          state = applyRoll(state, roll);
        } else if (state.phase === 'waiting-for-move') {
          const rollVal = state.currentRoll!.value;
          const moves = legalMoves(state, rollVal);
          expect(moves.length).toBeGreaterThan(0);
          const botDiff = difficulties[state.currentPlayerIndex % 3];
          const chosen = pickAiMove(state, rollVal, botDiff);
          expect(chosen).not.toBeNull();
          state = applyMove(state, chosen!);
        }
        assertGameInvariants(state);
      }

      expect(state.phase).toBe('game-over');
      expect(['red', 'green', 'blue']).toContain(state.winner);
      const path = state.board.players[state.winner!];
      const winnerPawns = state.players[state.winner!].pawns;
      expect(winnerPawns.every((p) => isAtCenter(p.position, path))).toBe(true);
    }
  });

  it('simulates 15 complete 4-player matches (Full Board) verifying turn rotation and cuts', () => {
    let totalCutsRecorded = 0;

    for (let i = 0; i < 15; i++) {
      let state = createGame(DEFAULT_BOARD, ['red', 'green', 'blue', 'yellow']);
      let turns = 0;
      const MAX_TURNS = 4500;

      while (state.phase !== 'game-over' && turns < MAX_TURNS) {
        turns++;
        const currPlayer = state.turnOrder[state.currentPlayerIndex];
        const wasUnlockedBefore = state.players[currPlayer].hasCutOpponent;

        if (state.phase === 'waiting-for-roll') {
          const roll = rollDice();
          state = applyRoll(state, roll);
        } else if (state.phase === 'waiting-for-move') {
          const rollVal = state.currentRoll!.value;
          const moves = legalMoves(state, rollVal);
          expect(moves.length).toBeGreaterThan(0);
          const chosen = pickAiMove(state, rollVal, 'hard');
          expect(chosen).not.toBeNull();
          state = applyMove(state, chosen!);

          if (!wasUnlockedBefore && state.players[currPlayer].hasCutOpponent) {
            totalCutsRecorded++;
          }
        }
        assertGameInvariants(state);
      }

      expect(state.phase).toBe('game-over');
      expect(state.winner).toBeDefined();
      expect(state.players[state.winner!].hasCutOpponent).toBe(true);
    }

    // In 15 four-player matches, multiple players definitely unlock the inner track via cuts
    expect(totalCutsRecorded).toBeGreaterThan(10);
  });
});
