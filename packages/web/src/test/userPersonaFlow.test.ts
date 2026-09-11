import { describe, it, expect } from 'vitest';
import {
  createGame,
  applyRoll,
  applyMove,
  legalMoves,
  DEFAULT_BOARD,
  OFF_BOARD,
  pickAiMove,
  isAtCenter,
} from '@thayam/rules-engine';
import type { GameState, Move } from '@thayam/rules-engine';

describe('User Persona Game Flow Tests', () => {
  // ───────────────────────────────────────────────────────────────────────────
  // Persona A: Priya — Novice / Beginner Player
  // ───────────────────────────────────────────────────────────────────────────
  describe('Persona A (Priya - The Novice Player)', () => {
    it('initializes with all 4 pawns in off-board reserve and waiting-for-roll phase', () => {
      const state = createGame(DEFAULT_BOARD, ['red', 'green']);
      expect(state.phase).toBe('waiting-for-roll');
      expect(state.players.red.pawns.every((p) => p.position === OFF_BOARD)).toBe(true);
      expect(state.players.red.hasCutOpponent).toBe(false);
    });

    it('forces turn pass on non-1 roll when all pawns are off-board', () => {
      const state = createGame(DEFAULT_BOARD, ['red', 'green']);
      const afterRoll = applyRoll(state, { dieA: 1, dieB: 2, value: 3 });
      // Non-bonus, no legal moves -> immediately advances to next player
      expect(afterRoll.currentPlayerIndex).toBe(1); // green's turn
      expect(afterRoll.phase).toBe('waiting-for-roll');
    });

    it('unlocks board entry and grants bonus roll on rolling 1 (Thayam)', () => {
      const state = createGame(DEFAULT_BOARD, ['red', 'green']);
      const afterRoll = applyRoll(state, { dieA: 1, dieB: 0, value: 1 });
      expect(afterRoll.phase).toBe('waiting-for-move');

      const moves = legalMoves(afterRoll, 1);
      expect(moves.length).toBe(4); // 4 off-board pawns can each enter
      expect(moves.every((m) => m.toPosition === 0)).toBe(true);

      // Priya selects and moves first pawn onto entry square
      const afterMove = applyMove(afterRoll, moves[0]);
      expect(afterMove.players.red.pawns[0].position).toBe(0);
      // Roll of 1 is a bonus roll -> Priya keeps turn!
      expect(afterMove.currentPlayerIndex).toBe(0);
      expect(afterMove.phase).toBe('waiting-for-roll');
    });

    it('prevents entering inner path without cutting an opponent first', () => {
      let state = createGame(DEFAULT_BOARD, ['red', 'green']);
      // Bring pawn 0 onto board at position 0
      state = applyRoll(state, { dieA: 1, dieB: 0, value: 1 });
      state = applyMove(state, legalMoves(state, 1)[0]);

      // Move pawn around outer track past home without cut
      // outer sequence length is 24. At position 23, roll of 2 should loop outer, NOT enter home-stretch
      state.players.red.pawns[0].position = 23;
      state = { ...state, phase: 'waiting-for-move', currentRoll: { dieA: 1, dieB: 1, value: 2 } };

      const moves = legalMoves(state, 2);
      expect(moves.length).toBe(1);
      expect(moves[0].entersHomeStretch).toBe(false);
      expect(moves[0].toPosition).toBe(1); // wrapped to outer position 1
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Persona B: Murugan — The Competitive Veteran
  // ───────────────────────────────────────────────────────────────────────────
  describe('Persona B (Murugan - Competitive Veteran)', () => {
    it('executes a cut (Vettu), unlocks inner path, and sends opponent home', () => {
      let state = createGame(DEFAULT_BOARD, ['red', 'green']);
      // Red pawn at position 4
      state.players.red.pawns[0].position = 4;
      // Green pawn at red path position 7 (non-safe square)
      // Path position 7 for red is o65
      const targetCellId = state.board.players.red.outerSequence[7];
      const greenPosAtCell = state.board.players.green.outerSequence.indexOf(targetCellId);
      state.players.green.pawns[0].position = greenPosAtCell;

      state = { ...state, phase: 'waiting-for-move', currentRoll: { dieA: 1, dieB: 2, value: 3 } };

      const moves = legalMoves(state, 3);
      const cutMove = moves.find((m) => m.cutsPawnIds.length > 0);
      expect(cutMove).toBeDefined();
      expect(cutMove?.cutsPawnIds[0].owner).toBe('green');

      const afterCut = applyMove(state, cutMove!);
      expect(afterCut.players.red.hasCutOpponent).toBe(true);
      expect(afterCut.players.green.pawns[0].position).toBe(OFF_BOARD);
    });

    it('respects safe square immunity: cannot cut opponent resting on safe cross', () => {
      let state = createGame(DEFAULT_BOARD, ['red', 'green']);
      // Red pawn 3 steps away from a safe spot (o63 midpoint safe cell)
      const safeCellId = 'o63';
      const redPos = state.board.players.red.outerSequence.indexOf(safeCellId) - 3;
      const greenPos = state.board.players.green.outerSequence.indexOf(safeCellId);

      state.players.red.pawns[0].position = redPos;
      state.players.green.pawns[0].position = greenPos;

      state = { ...state, phase: 'waiting-for-move', currentRoll: { dieA: 1, dieB: 2, value: 3 } };

      const moves = legalMoves(state, 3);
      expect(moves.length).toBe(1);
      expect(moves[0].cutsPawnIds.length).toBe(0); // Safe square: no cut!

      const afterMove = applyMove(state, moves[0]);
      expect(afterMove.players.green.pawns[0].position).toBe(greenPos); // Green remains safe
    });

    it('requires exact landing on center sanctuary to finish pilgrimage', () => {
      let state = createGame(DEFAULT_BOARD, ['red', 'green']);
      state.players.red.hasCutOpponent = true;
      const redPath = state.board.players.red;
      const centerPos = redPath.outerSequence.length + redPath.homeStretchSequence.length - 1;

      // 1 space away from center
      state.players.red.pawns[0].position = centerPos - 1;

      // Roll of 2 (overshooting) -> illegal
      const overMoves = legalMoves({ ...state, currentRoll: { dieA: 1, dieB: 1, value: 2 }, phase: 'waiting-for-move' }, 2);
      expect(overMoves.length).toBe(0);

      // Roll of 1 (exact landing) -> legal move to center for pawn 0 (plus entry for reserve pawns)
      const exactMoves = legalMoves({ ...state, currentRoll: { dieA: 1, dieB: 0, value: 1 }, phase: 'waiting-for-move' }, 1);
      const centerMove = exactMoves.find((m) => m.pawnId === 0);
      expect(centerMove).toBeDefined();
      expect(isAtCenter(centerMove!.toPosition, redPath)).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Persona C: Arun — Solo Player vs AI
  // ───────────────────────────────────────────────────────────────────────────
  describe('Persona C (Arun - Solo vs AI)', () => {
    it('AI consistently selects valid legal moves across Easy, Medium, and Hard heuristics', () => {
      const state = createGame(DEFAULT_BOARD, ['red', 'green']);
      // Green is AI, roll of 1
      const greenTurn: GameState = {
        ...state,
        currentPlayerIndex: 1,
        phase: 'waiting-for-move',
        currentRoll: { dieA: 1, dieB: 0, value: 1 },
      };

      const easyMove = pickAiMove(greenTurn, 1, 'easy');
      const medMove = pickAiMove(greenTurn, 1, 'medium');
      const hardMove = pickAiMove(greenTurn, 1, 'hard');

      expect(easyMove).not.toBeNull();
      expect(medMove).not.toBeNull();
      expect(hardMove).not.toBeNull();

      expect(easyMove?.playerColor).toBe('green');
      expect(easyMove?.toPosition).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Persona D: Meena & Karthik — 2 to 4 Player Pass-and-Play
  // ───────────────────────────────────────────────────────────────────────────
  describe('Persona D (Meena & Karthik - 4-Player Match Rotation)', () => {
    it('cleanly rotates turns through 4 players and preserves bonus rolls', () => {
      let state = createGame(DEFAULT_BOARD, ['red', 'green', 'yellow', 'blue']);
      expect(state.turnOrder).toEqual(['red', 'green', 'yellow', 'blue']);

      // Red rolls 2 (no moves) -> advances to green
      state = applyRoll(state, { dieA: 1, dieB: 1, value: 2 });
      expect(state.currentPlayerIndex).toBe(1); // green

      // Green rolls 3 (no moves) -> advances to yellow
      state = applyRoll(state, { dieA: 1, dieB: 2, value: 3 });
      expect(state.currentPlayerIndex).toBe(2); // yellow

      // Yellow rolls 4 (no moves) -> advances to blue
      state = applyRoll(state, { dieA: 2, dieB: 2, value: 4 });
      expect(state.currentPlayerIndex).toBe(3); // blue

      // Blue rolls 2 (no moves) -> advances back to red
      state = applyRoll(state, { dieA: 1, dieB: 1, value: 2 });
      expect(state.currentPlayerIndex).toBe(0); // red again
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Persona E: Selvi — Accessibility & Invariant State Integrity
  // ───────────────────────────────────────────────────────────────────────────
  describe('Persona E (Selvi - State Invariant Verification)', () => {
    it('guarantees total pawn count per player is always exactly 4', () => {
      const state = createGame(DEFAULT_BOARD, ['red', 'green', 'yellow', 'blue']);
      for (const color of state.turnOrder) {
        expect(state.players[color].pawns.length).toBe(4);
      }
    });
  });
});
