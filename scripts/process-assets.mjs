#!/usr/bin/env node
/**
 * One-shot asset pipeline:
 *   _reference/cases/<Client>/*.{jpg,jpeg,png}  →  src/assets/cases/<slug>/{hero,gallery-N}.webp
 *   _reference/cases/klant-logos/*.png          →  src/assets/logos/<normalized>.webp
 *   _reference/brand/*.png                      →  src/assets/brand/<normalized>.webp
 *
 * Run:  npm run assets
 *
 * Idempotent: re-runs overwrite outputs but never delete additional files.
 * Tweak `WEBP_QUALITY` and `MAX_WIDTH` below if you need different output.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_REFERENCE = path.join(ROOT, '_reference');
const OUT_ASSETS = path.join(ROOT, 'src', 'assets');

const WEBP_QUALITY = 82;
const MAX_WIDTH = 1800; // never bigger than this; smaller passes through

/* ----- per-folder config -----
   `slug` is the output folder under src/assets/cases/<slug>/.
   `heroHint` (optional) is a regex that must match the FIRST file we'll
   promote to hero.webp. If unset / no match, we fall back to: sfeer →
   website-1 → homepage → first non-mockup → first file. The mockup is
   never picked as hero (Calvin's request). */
const CASE_CONFIG = {
  'Alignment Club':   { slug: 'alignment-club',              heroHint: /^alignment club 1\b/i },
  Club12:             { slug: 'club12' },
  HDG:                { slug: 'top-dakdekker',               heroHint: /dakdekker zeist 1\b/i },
  IAA:                { slug: 'independent-artists-agency', heroHint: /independent artists agency\.jpe?g/i },
  Millstreet:         { slug: 'millstreet',                  heroHint: /public-shows-millstreet|^millstreet 1\b/i },
  'Renovatie Totaal': { slug: 'renovatie-totaal',            heroHint: /website 1/i },
  'Rex The Agency':   { slug: 'rex-agency',                  heroHint: /sfeer/i },
  Steunder:           { slug: 'steunder',                    heroHint: /emvi website/i },
  'Studio Max Dance': { slug: 'studio-max',                  heroHint: /sfeer/i },
  'Theo Mackaay':     { slug: 'theo-mackaay',                heroHint: /sfeer/i },
};

const isLogoFile = (f) => /\blogo\b/i.test(f);
const isMockup = (f) => /mock(\s|-)?up/i.test(f);

/* ----- one-off assets that don't belong in cases/logos/brand -----
   Source files live directly in `_reference/` (or a subfolder), output
   lands under `src/assets/<targetDir>/`. Add new entries here as Calvin
   drops more "loose" images that map to specific UI slots. */
const LOOSE_ASSETS = [
  {
    source: 'Bas Bertrams Eigenaar Renovatie Totaal.jpg',
    target: 'testimonials/bas-bertrams.webp',
    maxWidth: 600,
  },
  {
    source: 'Renovatie Totaal website en seo case.jpg',
    target: 'testimonials/renovatie-totaal-bg.webp',
    maxWidth: 1920,
  },
  {
    source: 'mock-up-froseo-v2.png',
    target: 'hero/froseo-mockup.webp',
    maxWidth: 1800,
  },
];

/* ----- helpers ----- */

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });

const isImage = (file) => /\.(jpe?g|png)$/i.test(file);

async function convert(input, output) {
  const meta = await sharp(input).metadata();
  const pipeline = sharp(input);
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline.resize({ width: MAX_WIDTH });
  }
  await pipeline.webp({ quality: WEBP_QUALITY }).toFile(output);
  return { from: meta.width, to: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH) };
}

/* ----- pipelines ----- */

async function processCases() {
  console.log('\n→ Cases');
  for (const [folder, config] of Object.entries(CASE_CONFIG)) {
    const { slug, heroHint } = config;
    const srcDir = path.join(SRC_REFERENCE, 'cases', folder);
    const outDir = path.join(OUT_ASSETS, 'cases', slug);
    let files;
    try {
      files = (await fs.readdir(srcDir)).filter(isImage).filter((f) => !isLogoFile(f));
    } catch {
      console.log(`  · skip "${folder}" (folder missing)`);
      continue;
    }
    if (files.length === 0) {
      console.log(`  · skip "${folder}" (no images)`);
      continue;
    }
    await ensureDir(outDir);

    // hero pick priority: explicit hint → sfeer → website-1 → homepage → any non-mockup → first
    const heroSrc =
      (heroHint && files.find((f) => heroHint.test(f))) ||
      files.find((f) => /sfeer/i.test(f)) ||
      files.find((f) => /website[\s_-]*1\b/i.test(f)) ||
      files.find((f) => /homepage/i.test(f)) ||
      files.find((f) => !isMockup(f)) ||
      files[0];

    // gallery: everything else, sorted; mockup at the end
    const rest = files
      .filter((f) => f !== heroSrc)
      .sort((a, b) => Number(isMockup(a)) - Number(isMockup(b)) || a.localeCompare(b));

    let count = 0;
    await convert(path.join(srcDir, heroSrc), path.join(outDir, 'hero.webp'));
    count++;
    for (let i = 0; i < rest.length; i++) {
      await convert(path.join(srcDir, rest[i]), path.join(outDir, `gallery-${i + 1}.webp`));
      count++;
    }
    console.log(`  ✓ ${slug.padEnd(28)} hero=${heroSrc.padEnd(40)} (+${count - 1} gallery)`);
  }
}

async function processLogos() {
  console.log('\n→ Client logos');
  const srcDir = path.join(SRC_REFERENCE, 'cases', 'klant-logos');
  const outDir = path.join(OUT_ASSETS, 'logos');
  let files;
  try {
    files = (await fs.readdir(srcDir)).filter(isImage);
  } catch {
    console.log('  · skip (folder missing)');
    return;
  }
  await ensureDir(outDir);
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const isWhite = /\bwit\b|white/i.test(base);
    const cleaned = base
      .replace(/\blogo\b/gi, '')
      .replace(/\b(wit|white)\b/gi, '')
      .trim();
    const name = slugify(cleaned) + (isWhite ? '-white' : '') + '.webp';
    await convert(path.join(srcDir, file), path.join(outDir, name));
    console.log(`  ✓ ${name}`);
  }
}

async function processBrand() {
  console.log('\n→ Brand');
  const srcDir = path.join(SRC_REFERENCE, 'brand');
  const outDir = path.join(OUT_ASSETS, 'brand');
  let files;
  try {
    files = (await fs.readdir(srcDir)).filter(isImage);
  } catch {
    console.log('  · skip (folder missing)');
    return;
  }
  await ensureDir(outDir);
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const name = slugify(base) + '.webp';
    /* Brand logo is rendered at ~32px tall in the nav (~140px wide max).
       Cap at 400px so the asset is right-sized — was 1800px source. */
    const meta = await sharp(path.join(srcDir, file)).metadata();
    const pipeline = sharp(path.join(srcDir, file));
    if (meta.width && meta.width > 400) pipeline.resize({ width: 400 });
    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(path.join(outDir, name));
    console.log(`  ✓ ${name}`);
  }
}

async function processLooseAssets() {
  console.log('\n→ Loose assets');
  for (const asset of LOOSE_ASSETS) {
    const srcFile = path.join(SRC_REFERENCE, asset.source);
    const outFile = path.join(OUT_ASSETS, asset.target);
    try {
      await fs.access(srcFile);
    } catch {
      console.log(`  · skip "${asset.source}" (not found)`);
      continue;
    }
    await ensureDir(path.dirname(outFile));
    const meta = await sharp(srcFile).metadata();
    const pipeline = sharp(srcFile);
    const cap = asset.maxWidth ?? MAX_WIDTH;
    if (meta.width && meta.width > cap) pipeline.resize({ width: cap });
    await pipeline.webp({ quality: WEBP_QUALITY }).toFile(outFile);
    console.log(`  ✓ ${asset.target}`);
  }
}

/* ----- run ----- */

(async () => {
  console.log('Froseo asset pipeline · sharp → WebP');
  console.log(`  source:  ${SRC_REFERENCE}`);
  console.log(`  output:  ${OUT_ASSETS}`);
  console.log(`  quality: ${WEBP_QUALITY}, max width: ${MAX_WIDTH}px`);

  await processCases();
  await processLogos();
  await processBrand();
  await processLooseAssets();

  console.log('\nDone.');
})().catch((err) => {
  console.error('\nAsset pipeline failed:', err);
  process.exit(1);
});
