/**
 * build-hero-combos.mjs — Genereer per service-pagina een hero-mockup
 * waarin desktop én mobile van twee verschillende klanten gecombineerd
 * worden in het Froseo mock-up template.
 *
 * Hergebruikt dezelfde alpha-detection + fit-to-screen logica als
 * scripts/build-mockup.mjs, maar dan met twee aparte source-slugs.
 *
 * Output: src/assets/hero/<out>.webp per pagina.
 *
 * Run:
 *   node scripts/build-hero-combos.mjs
 *
 * Combinaties staan onderaan in COMBOS — pas die aan om nieuwe
 * hero-mockups te genereren of bestaande te overschrijven.
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const mockupTemplate = resolve(repoRoot, '_reference/mock-up-v2.png');
const screenshotsRoot = resolve(repoRoot, '_reference/screenshots');
const heroOutDir = resolve(repoRoot, 'src/assets/hero');

/* === Slug-aliases — vang rename-mismatches af zonder folders te
   hoeven verplaatsen. Bv. de oude `rex-agency` folder bestaat nog
   terwijl de case-slug nu `rex-the-agency` is. */
const SLUG_ALIASES = {
  'rex-the-agency': 'rex-agency',
};

function screenshotPath(slug, kind) {
  const candidates = [slug, SLUG_ALIASES[slug]].filter(Boolean);
  for (const s of candidates) {
    const p = resolve(screenshotsRoot, s, `${kind}.png`);
    if (existsSync(p)) return p;
  }
  return null;
}

/* === Alpha-detection: zoek de 2 transparante zones in het template. */
async function findScreenAreas(mockupPath) {
  const { data, info } = await sharp(mockupPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const regions = [];

  const isTransparent = (x, y) => data[(y * width + x) * 4 + 3] === 0;

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
  if (regions.length < 2) throw new Error(`Expected 2+ transparent regions, found ${regions.length}`);
  return { canvasWidth: width, canvasHeight: height, regions };
}

/* === Crop top-portion van screenshot zodat aspect-ratio matcht en
   resize naar exact W x H. Mobile krijgt optioneel een rounded-corner
   masker (alleen onderaan; bovenaan zit de status-bar van het template). */
async function fitToScreen(screenshotPath, targetW, targetH, cornerRadius = 0) {
  const meta = await sharp(screenshotPath).metadata();
  const srcAspect = meta.width / meta.height;
  const targetAspect = targetW / targetH;
  let cropW, cropH;
  if (srcAspect > targetAspect) {
    cropH = meta.height;
    cropW = Math.round(meta.height * targetAspect);
  } else {
    cropW = meta.width;
    cropH = Math.round(meta.width / targetAspect);
  }
  const resized = await sharp(screenshotPath)
    .extract({ left: 0, top: 0, width: cropW, height: cropH })
    .resize(targetW, targetH, { fit: 'fill' })
    .toBuffer();
  if (cornerRadius <= 0) return resized;
  const r = cornerRadius, w = targetW, h = targetH;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="M 0 0 H ${w} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} Z" fill="white"/></svg>`,
  );
  return sharp(resized).composite([{ input: mask, blend: 'dest-in' }]).toBuffer();
}

/* === Pagina → { desktop-slug, mobile-slug, out-filename }
   Het uit-bestand komt in src/assets/hero/<out>.webp en wordt per pagina
   geïmporteerd in de Astro-template. */
const COMBOS = [
  { page: 'webdesign',                   desktop: 'rex-the-agency',             mobile: 'renovatie-totaal',          out: 'webdesign-hero' },
  { page: 'website-abonnement',          desktop: 'club12',                     mobile: 'prime-performance',         out: 'website-abonnement-hero' },
  { page: 'website-opfrissen',           desktop: 'studio-contenido',           mobile: 'rex-the-agency',            out: 'website-opfrissen-hero' },
  { page: 'website-onderhoud',           desktop: 'renovatie-totaal',           mobile: 'theo-mackaay',              out: 'website-onderhoud-hero' },
  { page: 'website-optimalisatie',       desktop: 'independent-artists-agency', mobile: 'studio-contenido',          out: 'website-optimalisatie-hero' },
  { page: 'seo',                         desktop: 'dakdekkersbedrijf-dkh-ede',  mobile: 'renovatie-totaal',          out: 'seo-hero' },
  { page: 'lokale-seo',                  desktop: 'club12',                     mobile: 'renovatie-totaal',          out: 'lokale-seo-hero' },
  { page: 'content-abonnement',          desktop: 'balderstone',                mobile: 'studio-contenido',          out: 'content-abonnement-hero' },
  { page: 'paid-media',                  desktop: 'renovatie-totaal',           mobile: 'dakdekkersbedrijf-dkh-ede', out: 'paid-media-hero' },
  { page: 'seo-bureau-utrecht',          desktop: 'kroostwijk',                 mobile: 'renovatie-totaal',          out: 'seo-bureau-utrecht-hero' },
  { page: 'website-laten-maken-utrecht', desktop: 'theo-mackaay',               mobile: 'studio-contenido',          out: 'website-laten-maken-utrecht-hero' },
  { page: 'website-laten-maken-zzp',     desktop: 'steunder',                   mobile: 'prime-performance',         out: 'website-laten-maken-zzp-hero' },
  { page: 'wordpress-website-onderhoud', desktop: 'millstreet',                 mobile: 'steunder',                  out: 'wordpress-website-onderhoud-hero' },
  { page: 'maarssen',                    desktop: 'theo-mackaay',               mobile: 'steunder',                  out: 'maarssen-hero' },
  { page: 'website-laten-maken-amersfoort', desktop: 'club12',                  mobile: 'studio-contenido',          out: 'website-laten-maken-amersfoort-hero' },
  { page: 'website-optimalisatie-utrecht',  desktop: 'renovatie-totaal',        mobile: 'independent-artists-agency', out: 'website-optimalisatie-utrecht-hero' },
];

console.log(`Scanning mock-up template for screen-areas…`);
const { canvasWidth, canvasHeight, regions } = await findScreenAreas(mockupTemplate);
const [browserArea, phoneArea] = regions;
console.log(`  Browser: ${browserArea.width}x${browserArea.height} @ (${browserArea.left},${browserArea.top})`);
console.log(`  Phone:   ${phoneArea.width}x${phoneArea.height} @ (${phoneArea.left},${phoneArea.top})\n`);

await mkdir(heroOutDir, { recursive: true });

const phoneRadius = Math.round(phoneArea.width * 0.1);

let okCount = 0;
let failCount = 0;

for (const { page, desktop, mobile, out } of COMBOS) {
  const desktopPath = screenshotPath(desktop, 'desktop');
  const mobilePath = screenshotPath(mobile, 'mobile');
  if (!desktopPath) { console.error(`✗ [${page}] missing desktop screenshot for "${desktop}"`); failCount++; continue; }
  if (!mobilePath) { console.error(`✗ [${page}] missing mobile screenshot for "${mobile}"`); failCount++; continue; }

  process.stdout.write(`[${page}] ${desktop} (desktop) × ${mobile} (mobile)… `);

  const desktopBuf = await fitToScreen(desktopPath, browserArea.width, browserArea.height, 0);
  const mobileBuf = await fitToScreen(mobilePath, phoneArea.width, phoneArea.height, phoneRadius);

  const outPath = resolve(heroOutDir, `${out}.webp`);
  await sharp({
    create: { width: canvasWidth, height: canvasHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: desktopBuf, left: browserArea.left, top: browserArea.top },
      { input: mobileBuf, left: phoneArea.left, top: phoneArea.top },
      { input: mockupTemplate, left: 0, top: 0 },
    ])
    .webp({ quality: 92 })
    .toFile(outPath);

  console.log(`→ ${out}.webp`);
  okCount++;
}

console.log(`\nDone. ${okCount} ok, ${failCount} failed.`);
