import { describe, it, expect } from 'vitest';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import { TOKENS } from '../src/tokens';

function extractKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('Shared Package Tests — Design Tokens & i18n Key Parity', () => {
  it('enforces 100% key parity between English (en.json) and Tamil (ta.json) locales', () => {
    const enKeys = extractKeys(en);
    const taKeys = extractKeys(ta);

    expect(enKeys).toEqual(taKeys);
    expect(enKeys.length).toBeGreaterThan(25);
  });

  it('guarantees critical design tokens are present and non-empty', () => {
    expect(TOKENS).toBeDefined();
    expect(TOKENS.colors).toBeDefined();
    expect(TOKENS.colors.brass).toBeTruthy();
    expect(TOKENS.colors.pawnRed).toBeTruthy();
  });
});
