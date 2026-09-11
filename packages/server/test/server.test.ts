import { describe, it, expect } from 'vitest';
import { createGame, applyRoll, applyMove, legalMoves, DEFAULT_BOARD } from '@thayam/rules-engine';

describe('Server Authoritative Logic Tests', () => {
  it('initializes a fresh multiplayer room with valid authoritative game state', () => {
    const gameState = createGame(DEFAULT_BOARD, ['red', 'green']);
    expect(gameState).toBeDefined();
    expect(gameState.turnOrder).toEqual(['red', 'green']);
    expect(gameState.phase).toBe('waiting-for-roll');
    expect(gameState.winner).toBeNull();
  });

  it('rejects illegal or out-of-turn move attempts authoritatively', () => {
    let state = createGame(DEFAULT_BOARD, ['red', 'green']);
    // Fake a roll of 2 for red
    state = applyRoll(state, { dieA: 1, dieB: 1, value: 2 });

    // Since red has no pawns on board, roll of 2 passes turn immediately to green
    expect(state.turnOrder[state.currentPlayerIndex]).toBe('green');
    expect(state.phase).toBe('waiting-for-roll');

    // Trying to move when phase is 'waiting-for-roll' must throw
    expect(() => {
      applyMove(state, {
        playerColor: 'red',
        pawnId: 0,
        fromPosition: -1,
        toPosition: 0,
        cutsPawnIds: [],
        entersBoard: true,
      });
    }).toThrow();
  });

  it('validates legal moves when roll is 1 (Thayam) and applies them cleanly', () => {
    let state = createGame(DEFAULT_BOARD, ['red', 'green']);
    state = applyRoll(state, { dieA: 1, dieB: 0, value: 1 });

    expect(state.phase).toBe('waiting-for-move');
    const legal = legalMoves(state, 1);
    expect(legal.length).toBe(4);

    const firstMove = legal[0];
    const nextState = applyMove(state, firstMove);
    expect(nextState.players.red.pawns[0].position).toBe(0);
    // 1 is a bonus roll, so phase remains waiting-for-roll for red
    expect(nextState.turnOrder[nextState.currentPlayerIndex]).toBe('red');
  });
});
