/**
 * dice.ts — Daayam (Thayam dice) simulation
 *
 * Two cuboid dice, each face: 0 (blank), 1, 2, 3.
 * Roll value = dieA + dieB, with ONE override: 0+0 → 12 (not 0).
 * PRD §8.3 — combination table is authoritative.
 *
 * Zero runtime dependencies.
 */

import type { DieFace, DiceRoll } from './types.js';
import { BONUS_ROLL_VALUES } from './types.js';

/**
 * Resolve two raw die faces into the game roll value.
 * This implements the exact PRD §8.3 combination table.
 */
export function resolveRoll(dieA: DieFace, dieB: DieFace): number {
  if (dieA === 0 && dieB === 0) return 12; // Special override per PRD §8.3
  return dieA + dieB;
}

/**
 * Create a DiceRoll from two raw die faces.
 */
export function makeDiceRoll(dieA: DieFace, dieB: DieFace): DiceRoll {
  return { dieA, dieB, value: resolveRoll(dieA, dieB) };
}

/**
 * Roll the dice using a provided random source (default: Math.random).
 * Accepts an optional rng for deterministic testing.
 */
export function rollDice(rng: () => number = Math.random): DiceRoll {
  const faces: DieFace[] = [0, 1, 2, 3];
  const dieA = faces[Math.floor(rng() * 4)] as DieFace;
  const dieB = faces[Math.floor(rng() * 4)] as DieFace;
  return makeDiceRoll(dieA, dieB);
}

/** All 16 possible (dieA, dieB) combinations with their resolved values */
export const ALL_ROLL_COMBINATIONS: ReadonlyArray<DiceRoll> = ((): DiceRoll[] => {
  const combos: DiceRoll[] = [];
  const faces: DieFace[] = [0, 1, 2, 3];
  for (const a of faces) {
    for (const b of faces) {
      combos.push(makeDiceRoll(a, b));
    }
  }
  return combos;
})();

/** Valid roll values that can come from the dice (7–11 are impossible) */
export const VALID_ROLL_VALUES = new Set([1, 2, 3, 4, 5, 6, 12]);

export function isValidRollValue(value: number): boolean {
  return VALID_ROLL_VALUES.has(value);
}

export function isBonusRollValue(value: number): boolean {
  return BONUS_ROLL_VALUES.includes(value);
}
