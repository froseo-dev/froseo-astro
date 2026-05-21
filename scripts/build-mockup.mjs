/**
 * Mock-up builder.
 *
 * Pakt de desktop + mobile screenshot van een klant (gemaakt door
 * scripts/screenshot.mjs) en componeert ze in het Froseo mock-up template
 * (`_reference/MOCK-UP TRANSPARANT.png`). Schrijft de finale mock-up als
 * WebP naar `src/assets/<collection>/<slug>/mockup.webp`.
 *
 * Usage:
 *   node scripts/build-mockup.mjs <slug> <collection>
 *
 *   collection = cases | portfolio (default: portfolio)
 *
 * Hoe het werkt:
 *   1. Scan de alpha-channel van de mock-up PNG en detecteer de twee
 *      transparante rechthoeken (browser-screen + telefoon-screen).
 *   2. Crop het bovenste deel van elke screenshot zodat de aspect-ratio
 *      matcht met de screen-area. Resize naar exact W x H van de screen.
 *   3. Composite: leeg transparant canvas → desktop op browser-coords →
 *      mobile op phone-coords → mock-up PNG bovenop. De opaque randen,
 *      ronde hoeken en notch van het template dekken de screenshots af
 *      waar nodig.
 *   4. Schrijf naar WebP met quality 92 (visueel near-lossless, ~1/4 van PNG).
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const [, , slug, collectionArg] = process.argv;
const collection = collectionArg || 'portfolio';

if (!slug) {
  console.error('Usage: node scripts/build-mockup.mjs <slug> [collection]');
  console.error('  collection = cases | portfolio (default: portfolio)');
  process.exit(1);
}

const mockupTemplate = resolve(repoRoot, '_reference/mock-up-v2.png');
const screenshotDir = resolve(repoRoot, '_reference/screenshots', slug);
const desktopShot = resolve(screenshotDir, 'desktop.png');
const mobileShot = resolve(screenshotDir, 'mobile.png');

for (const p of [mockupTemplate, desktopShot, mobileShot]) {
  if (!existsSync(p)) {
    console.error(`Missing: ${p}`);
    process.exit(1);
  }
}

const outDir = resolve(repoRoot, 'src/assets', collection, slug);
await mkdir(outDir, { recursive: true });
const outPath = resolve(outDir, 'mockup.webp');

/**
 * Detect transparent rectangular regions in the alpha-channel via
 * iterative flood-fill. Returns the 2 largest regions sorted by area.
 */
async function findScreenAreas(mockupPath) {
  const { data, info } = await sharp(mockupPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const regions = [];

  const isTransparent = (x, y) => {
    const idx = (y * width + x) * 4 + 3;
    return data[idx] === 0;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y * width + x] || !isTransparent(x, y)) continue;

      let minX = x, maxX = x, minY = y, maxY = y, count = 0;
      const stack = [[x, y]];

      while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
        const vi = cy * width + cx;
        if (visited[vi] || !isTransparent(cx, cy)) continue;

        visited[vi] = 1;
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }

      if (count > 1000) {
        regions.push({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1, area: count });
      }
    }
  }

  regions.sort((a, b) => b.area - a.area);
  if (regions.length < 2) {
    throw new Error(`Expected 2+ transparent regions, found ${regions.length}`);
  }
  return { canvasWidth: width, canvasHeight: height, regions };
}

/**
 * Crop top portion of screenshot to match target aspect ratio, resize to exact
 * target dimensions, optioneel rounded-corners er overheen voor mobile-screens.
 *
 * cornerRadius (px in target-dims). 0 = scherp (default).
 */
async function fitToScreen(screenshotPath, targetW, targetH, cornerRadius = 0) {
  const meta = await sharp(screenshotPath).metadata();
  const srcW = meta.width;
  const srcH = meta.height;
  const targetAspect = targetW / targetH;
  const srcAspect = srcW / srcH;

  let cropW, cropH;
  if (srcAspect > targetAspect) {
    cropH = srcH;
    cropW = Math.round(srcH * targetAspect);
  } else {
    cropW = srcW;
    cropH = Math.round(srcW / targetAspect);
  }

  const resized = await sharp(screenshotPath)
    .extract({ left: 0, top: 0, width: cropW, height: cropH })
    .resize(targetW, targetH, { fit: 'fill' })
    .toBuffer();

  if (cornerRadius <= 0) return resized;

  // Bottom-only rounded mask via SVG-path. Top blijft strak omdat de
  // cream status-zone van het mock-up template daar al overheen ligt;
  // rounding bovenaan zou kleine gaps tussen cream-zone en screenshot
  // veroorzaken.
  const r = cornerRadius;
  const w = targetW;
  const h = targetH;
  const roundedMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <path d="M 0 0 H ${w} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} Z" fill="white"/>
     </svg>`,
  );

  return sharp(resized)
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .toBuffer();
}

console.log(`[${slug}] Scanning mock-up template for screen-areas…`);
const { canvasWidth, canvasHeight, regions } = await findScreenAreas(mockupTemplate);

const [bigger, smaller] = regions;
const browserArea = bigger;
const phoneArea = smaller;

console.log(`  Browser screen: ${browserArea.width}x${browserArea.height} @ (${browserArea.left}, ${browserArea.top})`);
console.log(`  Phone screen:   ${phoneArea.width}x${phoneArea.height} @ (${phoneArea.left}, ${phoneArea.top})`);

console.log(`[${slug}] Fitting desktop screenshot to browser-area…`);
const desktopBuf = await fitToScreen(desktopShot, browserArea.width, browserArea.height, 0);

// Mobile: corner-radius scaled relative to phone-screen width (proportioneel).
// ~10% van de schermbreedte komt overeen met de iPhone screen-radius.
const phoneRadius = Math.round(phoneArea.width * 0.1);
console.log(`[${slug}] Fitting mobile screenshot to phone-area (radius ${phoneRadius}px)…`);
const mobileBuf = await fitToScreen(mobileShot, phoneArea.width, phoneArea.height, phoneRadius);

console.log(`[${slug}] Compositing…`);
await sharp({
  create: {
    width: canvasWidth,
    height: canvasHeight,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: desktopBuf, left: browserArea.left, top: browserArea.top },
    { input: mobileBuf, left: phoneArea.left, top: phoneArea.top },
    { input: mockupTemplate, left: 0, top: 0 },
  ])
  .webp({ quality: 92 })
  .toFile(outPath);

console.log(`[${slug}] Done → ${outPath}`);
