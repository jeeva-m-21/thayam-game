/**
 * fuzz.test.ts — P1-08: invariant fuzz harness
 *
 * AGENTS.md §8: simulate ≥1000 full 2–4 player games with random-legal-move AI.
 * After EVERY move, assert all 4 invariants:
 *   1. No non-safe cell holds >1 pawn of the same color
 *   2. No pawn is on homeStretchSequence for a player with hasCutOpponent=false
 *   3. Total pawn count per player always exactly 4 (off-board + in-play + center)
 *   4. Game terminates within 2000 moves (flag if exceeded)
 */
import { describe, it, expect } from 'vitest';
import { createGame, applyMove, applyRoll, assertGameInvariants } from '../src/engine.js';
import { legalMoves } from '../src/moves.js';
import { rollDice } from '../src/dice.js';
import { DEFAULT_BOARD } from '../src/board-data.js';
import { OFF_BOARD } from '../src/types.js';
import type { GameState, PlayerColor } from '../src/types.js';

const NUM_GAMES = 1000;
const MAX_MOVES_PER_GAME = 2000;

/** Seeded RNG for reproducible fuzz (LCG) */
function makeRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Pick a random element from an array */
function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Run a single full game with random-legal-move AI; return move count */
function runGame(playerCount: 2 | 3 | 4, seed: number): number {
  const allColors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
  const colors = allColors.slice(0, playerCount);
  const rng = makeRng(seed);

  let state: GameState = createGame(DEFAULT_BOARD, colors);
  let moveCount = 0;

  while (state.phase !== 'game-over') {
    if (moveCount >= MAX_MOVES_PER_GAME) {
      throw new Error(
        `Game seed=${seed} players=${playerCount} exceeded ${MAX_MOVES_PER_GAME} moves — investigate rules engine`,
      );
    }

    if (state.phase === 'waiting-for-roll') {
      const roll = rollDice(rng);
      state = applyRoll(state, roll);
      assertGameInvariants(state);
      // Count only actual moves (not just rolls)
    } else if (state.phase === 'waiting-for-move') {
      const roll = state.currentRoll!;
      const moves = legalMoves(state, roll.value);

      if (moves.length === 0) {
        // Should not reach here — applyRoll should handle no-legal-move case
        throw new Error(
          `Reached waiting-for-move with 0 legal moves (seed=${seed}, move=${moveCount})`,
        );
      }

      const chosen = pickRandom(moves, rng);
      state = applyMove(state, chosen);
      moveCount++;

      // Assert all invariants after every single move
      assertGameInvariants(state);

      // Extra invariant: total pawn count per player = 4
      for (const color of colors) {
        const count = state.players[color].pawns.length;
        if (count !== 4) {
          throw new Error(`${color} pawn count is ${count} (expected 4) at move ${moveCount}`);
        }
      }
    }
  }

  // Final invariant: winner's pawns are all at center
  if (state.winner) {
    const path = state.board.players[state.winner];
    const centerPos = path.outerSequence.length + path.homeStretchSequence.length - 1;
    const allAtCenter = state.players[state.winner].pawns.every(
      (p) => p.position === centerPos,
    );
    if (!allAtCenter) {
      throw new Error(`Winner ${state.winner} declared but not all pawns at center`);
    }
  }

  return moveCount;
}

describe(`fuzz — ${NUM_GAMES} full games, zero invariant violations [P1-08]`, () => {
  it('2-player games', () => {
    let totalMoves = 0;
    for (let i = 0; i < NUM_GAMES / 2; i++) {
      totalMoves += runGame(2, i + 1);
    }
    expect(totalMoves).toBeGreaterThan(0);
  });

  it('4-player games', () => {
    let totalMoves = 0;
    for (let i = 0; i < NUM_GAMES / 2; i++) {
      totalMoves += runGame(4, i + 10001);
    }
    expect(totalMoves).toBeGreaterThan(0);
  });

  it('3-player games (50 games — asymmetric case)', () => {
    let totalMoves = 0;
    for (let i = 0; i < 50; i++) {
      totalMoves += runGame(3, i + 20001);
    }
    expect(totalMoves).toBeGreaterThan(0);
  });
});
