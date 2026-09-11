const fs = require('fs');
const path = require('path');

const webDist = path.resolve(__dirname, '../../web/dist');
const targetRenderer = path.resolve(__dirname, '../renderer');

if (!fs.existsSync(webDist)) {
  console.error(`Error: ${webDist} does not exist. Please run 'pnpm --filter @thayam/web run build' first.`);
  process.exit(1);
}

if (fs.existsSync(targetRenderer)) {
  fs.rmSync(targetRenderer, { recursive: true, force: true });
}

fs.cpSync(webDist, targetRenderer, { recursive: true });
console.log(`Successfully copied web dist assets from ${webDist} to ${targetRenderer}`);
