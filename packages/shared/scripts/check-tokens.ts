import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../tokens/tokens.json'), 'utf-8'));

// Exact values from design.md §4.2
const EXPECTED_COLORS: Record<string, string> = {
  floorOxide: '#7C3B2E',
  floorOxideDark: '#4A211A',
  kolamChalk: '#F4EEDD',
  brass: '#AD8A4E',
  brassBright: '#D9B876',
  pawnRed: '#B2312F',
  pawnGreen: '#4B7A46',
  pawnYellow: '#D9A22A',
  pawnBlue: '#2E4C74',
  stoneInk: '#2A2320',
};

let errors = 0;
for (const [key, expectedVal] of Object.entries(EXPECTED_COLORS)) {
  const actual = tokensJson.colors[key];
  if (actual !== expectedVal) {
    console.error(`Mismatch for token ${key}: expected ${expectedVal}, got ${actual}`);
    errors++;
  }
}

if (errors === 0) {
  console.log('✓ All token values match design.md §4.2 exactly (10/10 colors verified).');
  process.exit(0);
} else {
  console.error(`✗ ${errors} token verification errors.`);
  process.exit(1);
}
