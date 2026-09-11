import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokensPath = path.resolve(__dirname, '../tokens/tokens.json');
const tokensRaw = fs.readFileSync(tokensPath, 'utf-8');
const tokens = JSON.parse(tokensRaw);

// 1. Generate tokens.ts (TypeScript constants for Three.js & client code)
const tsContent = `// Auto-generated from tokens.json - DO NOT EDIT MANUALLY
export const TOKENS = ${JSON.stringify(tokens, null, 2)} as const;

export const COLORS = TOKENS.colors;
export const TYPOGRAPHY = TOKENS.typography;
export const MOTION = TOKENS.motion;
export const ACCESSIBILITY = TOKENS.accessibility;

export type ColorTokenKey = keyof typeof COLORS;
`;

fs.writeFileSync(path.resolve(__dirname, '../src/tokens.ts'), tsContent, 'utf-8');

// 2. Generate tokens.css (CSS Custom Properties for Tailwind & CSS)
const cssLines = [
  '/* Auto-generated from tokens.json - DO NOT EDIT MANUALLY */',
  ':root {',
  '  /* Colors */',
  `  --floor-oxide: ${tokens.colors.floorOxide};`,
  `  --floor-oxide-dark: ${tokens.colors.floorOxideDark};`,
  `  --kolam-chalk: ${tokens.colors.kolamChalk};`,
  `  --brass: ${tokens.colors.brass};`,
  `  --brass-bright: ${tokens.colors.brassBright};`,
  `  --pawn-red: ${tokens.colors.pawnRed};`,
  `  --pawn-green: ${tokens.colors.pawnGreen};`,
  `  --pawn-yellow: ${tokens.colors.pawnYellow};`,
  `  --pawn-blue: ${tokens.colors.pawnBlue};`,
  `  --stone-ink: ${tokens.colors.stoneInk};`,
  '',
  '  /* Typography */',
  `  --font-display-en: ${tokens.typography.fontFamilyDisplayEn};`,
  `  --font-display-ta: ${tokens.typography.fontFamilyDisplayTa};`,
  `  --font-body: ${tokens.typography.fontFamilyBody};`,
  `  --font-numerals: ${tokens.typography.fontFamilyNumerals};`,
  `  --base-font-size: ${tokens.typography.baseFontSize};`,
  `  --line-height-body: ${tokens.typography.lineHeightBody};`,
  `  --line-height-display: ${tokens.typography.lineHeightDisplay};`,
  '',
  '  /* Motion */',
  `  --motion-dice-settle-min: ${tokens.motion.diceSettleMinMs}ms;`,
  `  --motion-dice-settle-max: ${tokens.motion.diceSettleMaxMs}ms;`,
  `  --motion-turn-camera-rotate: ${tokens.motion.turnCameraRotateMs}ms;`,
  `  --motion-screen-transition: ${tokens.motion.screenTransitionMs}ms;`,
  '',
  '  /* Accessibility */',
  `  --min-tap-target: ${tokens.accessibility.minTapTargetDp}px;`,
  '}',
  ''
];

fs.writeFileSync(path.resolve(__dirname, '../tokens/tokens.css'), cssLines.join('\n'), 'utf-8');
console.log('Successfully generated tokens.ts and tokens.css from tokens.json');
