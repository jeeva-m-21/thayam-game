import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.resolve(__dirname, '../i18n/en.json');
const taPath = path.resolve(__dirname, '../i18n/ta.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ta = JSON.parse(fs.readFileSync(taPath, 'utf-8'));

function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const enKeys = getKeys(en);
const taKeys = getKeys(ta);

let error = false;

for (const k of enKeys) {
  if (!taKeys.includes(k)) {
    console.error(`Missing key in ta.json: ${k}`);
    error = true;
  }
}

for (const k of taKeys) {
  if (!enKeys.includes(k)) {
    console.error(`Unexpected key in ta.json: ${k}`);
    error = true;
  }
}

if (!error) {
  console.log(`✓ 1:1 i18n key parity verified (${enKeys.length} keys in en.json and ta.json).`);
  process.exit(0);
} else {
  process.exit(1);
}
