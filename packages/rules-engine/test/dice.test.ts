/**
 * dice.test.ts — P1-02 verification
 *
 * V-model verify: All 16 die combinations from PRD §8.3 table enumerated exactly.
 * Every row is a separate assertion — 16/16 must pass.
 */
import { describe, it, expect } from 'vitest';
import {
  resolveRoll,
  makeDiceRoll,
  ALL_ROLL_COMBINATIONS,
  VALID_ROLL_VALUES,
  isBonusRollValue,
} from '../src/dice.js';
import type { DieFace } from '../src/types.js';

// PRD §8.3 combination table — exact transcription
const PRD_TABLE: Array<[DieFace, DieFace, number]> = [
  // dieA=0 row
  [0, 0, 12], // 0+0 → 12 special override
  [0, 1, 1],
  [0, 2, 2],
  [0, 3, 3],
  // dieA=1 row
  [1, 0, 1],
  [1, 1, 2],
  [1, 2, 3],
  [1, 3, 4],
  // dieA=2 row
  [2, 0, 2],
  [2, 1, 3],
  [2, 2, 4],
  [2, 3, 5],
  // dieA=3 row
  [3, 0, 3],
  [3, 1, 4],
  [3, 2, 5],
  [3, 3, 6],
];

describe('dice — PRD §8.3 combination table', () => {
  it('has exactly 16 combinations in the PRD table', () => {
    expect(PRD_TABLE).toHaveLength(16);
  });

  it.each(PRD_TABLE)(
    'resolveRoll(%i, %i) === %i',
    (dieA, dieB, expected) => {
      expect(resolveRoll(dieA, dieB)).toBe(expected);
    },
  );

  it('ALL_ROLL_COMBINATIONS contains all 16 entries matching PRD table', () => {
    expect(ALL_ROLL_COMBINATIONS).toHaveLength(16);
    for (const [dieA, dieB, expected] of PRD_TABLE) {
      const combo = ALL_ROLL_COMBINATIONS.find(
        (c) => c.dieA === dieA && c.dieB === dieB,
      );
      expect(combo, `missing (${dieA},${dieB})`).toBeDefined();
      expect(combo!.value).toBe(expected);
    }
  });
});

describe('dice — valid roll values', () => {
  it('valid set contains exactly {1,2,3,4,5,6,12}', () => {
    expect([...VALID_ROLL_VALUES].sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 12,
    ]);
  });

  it('values 7-11 are not in the valid set (impossible combinations)', () => {
    for (let v = 7; v <= 11; v++) {
      expect(VALID_ROLL_VALUES.has(v)).toBe(false);
    }
  });

  it('all 16 combinations produce valid roll values', () => {
    for (const combo of ALL_ROLL_COMBINATIONS) {
      expect(
        VALID_ROLL_VALUES.has(combo.value),
        `value ${combo.value} from (${combo.dieA},${combo.dieB}) is not valid`,
      ).toBe(true);
    }
  });
});

describe('dice — bonus rolls (PRD §8.4.3)', () => {
  it.each([1, 5, 6, 12])('roll value %i is a bonus roll', (v) => {
    expect(isBonusRollValue(v)).toBe(true);
  });

  it.each([2, 3, 4])('roll value %i is NOT a bonus roll', (v) => {
    expect(isBonusRollValue(v)).toBe(false);
  });
});

describe('dice — makeDiceRoll', () => {
  it('wraps faces and resolved value together', () => {
    const roll = makeDiceRoll(0, 0);
    expect(roll.dieA).toBe(0);
    expect(roll.dieB).toBe(0);
    expect(roll.value).toBe(12);
  });

  it('standard addition for non-special case', () => {
    const roll = makeDiceRoll(2, 3);
    expect(roll.value).toBe(5);
  });
});
