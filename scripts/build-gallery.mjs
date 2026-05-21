/**
 * Gallery builder voor case/portfolio pagina's.
 *
 * Maakt 4 page-screenshots per klant, optimaliseert ze naar WebP en zet
 * ze in `src/assets/<collection>/<slug>/gallery-{1..4}.webp`. Die files
 * worden gebruikt als gallery-array in de case-frontmatter, en als bron
 * voor de lightbox-thumb/main/full varianten via Astro's getImage.
 *
 * Page-selectie:
 *   - Index 0 is altijd de homepage (`/`)
 *   - Index 1-3: paths uit klanten-config (`pages`) of auto-extracted
 *     uit de homepage-nav als pages leeg is.
 *   - Bij minder dan 4 paths: rest gevuld met homepage-scrolled-down shots
 *     (op 25%, 50%, 75% scrollY) zodat we toch 4 visueel verschillende
 *     beelden hebben.
 *
 * Usage:
 *   node scripts/build-gallery.mjs <slug>           # single klant
 *   node scripts/build-gallery.mjs --all            # alle case/portfolio
 *   node scripts/build-gallery.mjs --all --skip-existing  # alleen nieuwe
 *
 * Screenshots zijn viewport-only (1440x900 desktop @ DPR 2 = 2880x1800)
 * met cookie-banner auto-dismissed. Niet full-page omdat lange screenshots
 * in lightbox vooral klein gerenderd worden.
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { klanten } from './klanten-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
const all = args.includes('--all');
const skipExisting = args.includes('--skip-existing');
const targetSlug = args.find((a) => !a.startsWith('--'));

const ACCEPT_BUTTONS = [
  'Alles toestaan',
  'Alles accepteren',
  'Accepteren',
  'Accept all',
  'Accept All Cookies',
  'Accept all cookies',
  'Accepteer alles',
  'Akkoord',
  'Ik ga akkoord',
  'Sta alles toe',
  'Allow all',
  'Toestaan',
  'OK',
  'Got it',
];

async function dismissCookieBanner(page) {
  for (const text of ACCEPT_BUTTONS) {
    try {
      const btn = page.getByRole('button', { name: new RegExp(`^${text}$`, 'i') }).first();
      if (await btn.isVisible({ timeout: 700 })) {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(500);
        return true;
      }
    } catch (_) {}
  }
  return false;
}

/**
 * Vind tot 3 interne paths in de nav. Filtert externe links, anchors,
 * tel- en mailto:-links eruit. Dedupe.
 */
async function autoNavPaths(page) {
  const origin = new URL(page.url()).origin;
  const raw = await page.$$eval('header a, nav a', (els) =>
    els.map((el) => el.getAttribute('href') || ''),
  );
  const paths = [];
  for (let href of raw) {
    if (!href) continue;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('#')) continue;
    try {
      const url = new URL(href, origin);
      if (url.origin !== origin) continue;
      let path = url.pathname;
      if (!path.endsWith('/')) path += '/';
      if (path === '/') continue;
      if (paths.includes(path)) continue;
      paths.push(path);
      if (paths.length >= 3) break;
    } catch (_) {}
  }
  return paths;
}

async function captureViewport(page, outPng) {
  // Scroll heel de pagina door om lazy-loaded images te triggeren, dan
  // terug naar boven en wachten zodat alles ingeladen is voordat we
  // de viewport-screenshot maken.
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: outPng, fullPage: false });
}

async function captureScrolled(page, scrollFrac, outPng) {
  await page.evaluate((frac) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.max(0, max * frac));
  }, scrollFrac);
  await page.waitForTimeout(600);
  await page.screenshot({ path: outPng, fullPage: false });
}

async function processKlant(klant) {
  const { slug, url, bucket, pages = [] } = klant;
  if (bucket === 'logo-only') {
    console.log(`[${slug}] skip — logo-only`);
    return;
  }
  const collection = bucket === 'portfolio-only' ? 'portfolio' : 'cases';
  const outDir = resolve(repoRoot, 'src/assets', collection, slug);
  const screensDir = resolve(repoRoot, '_reference/screenshots', slug, 'gallery');

  if (skipExisting && existsSync(resolve(outDir, 'gallery-4.webp'))) {
    console.log(`[${slug}] skip — gallery-4.webp bestaat al`);
    return;
  }

  await mkdir(outDir, { recursive: true });
  await mkdir(screensDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();

    console.log(`[${slug}] homepage: ${url}/`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    } catch (e) {
      console.warn(`[${slug}] networkidle timeout, retry with 'load'`);
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    }
    await page.waitForTimeout(1500);
    const dismissed = await dismissCookieBanner(page);
    if (dismissed) await page.waitForTimeout(700);

    // Bepaal pages: config of auto-detect
    let paths = pages.length > 0 ? pages.slice() : ['/'];
    if (paths.length < 4) {
      // Auto-extract overige paths uit nav als ze niet in config staan
      const navPaths = await autoNavPaths(page);
      for (const p of navPaths) {
        if (!paths.includes(p) && paths.length < 4) paths.push(p);
      }
    }
    while (paths.length < 4) paths.push('__scrolled__');

    console.log(`[${slug}] paths:`, paths);

    for (let i = 0; i < 4; i++) {
      const path = paths[i];
      const pngPath = resolve(screensDir, `page-${i + 1}.png`);

      if (path === '__scrolled__') {
        // Geen extra page beschikbaar: scroll-positie van homepage
        const scrollFrac = 0.25 * i;
        console.log(`[${slug}] page-${i + 1}: homepage scrolled ${Math.round(scrollFrac * 100)}%`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1000);
        const dis2 = await dismissCookieBanner(page);
        if (dis2) await page.waitForTimeout(700);
        await captureScrolled(page, scrollFrac, pngPath);
      } else if (i === 0 && path === '/') {
        // Homepage: gebruik huidige page state
        await captureViewport(page, pngPath);
      } else {
        const fullUrl = url + (path.startsWith('/') ? path : `/${path}`);
        console.log(`[${slug}] page-${i + 1}: ${fullUrl}`);
        try {
          const resp = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
          const status = resp ? resp.status() : 0;
          if (status >= 400) {
            throw new Error(`HTTP ${status}`);
          }
          await page.waitForTimeout(1000);
          const dis2 = await dismissCookieBanner(page);
          if (dis2) await page.waitForTimeout(700);
          await captureViewport(page, pngPath);
        } catch (e) {
          console.warn(`[${slug}] page-${i + 1} failed (${e.message}), fallback to homepage scroll ${i * 25}%`);
          await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
          await page.waitForTimeout(1000);
          await captureScrolled(page, 0.25 * i, pngPath);
        }
      }

      // Optimize naar webp en zet in src/assets
      const webpPath = resolve(outDir, `gallery-${i + 1}.webp`);
      await sharp(pngPath).webp({ quality: 88 }).toFile(webpPath);
    }

    await ctx.close();
    console.log(`[${slug}] ✓ done`);
  } finally {
    await browser.close();
  }
}

if (all) {
  const targets = klanten.filter((k) => k.bucket !== 'logo-only');
  console.log(`Running gallery build for ${targets.length} klanten`);
  for (const k of targets) {
    try {
      await processKlant(k);
    } catch (e) {
      console.error(`[${k.slug}] ERROR:`, e.message);
    }
  }
} else if (targetSlug) {
  const k = klanten.find((x) => x.slug === targetSlug);
  if (!k) {
    console.error(`Slug niet gevonden: ${targetSlug}`);
    process.exit(1);
  }
  await processKlant(k);
} else {
  console.error('Usage: node scripts/build-gallery.mjs <slug> | --all [--skip-existing]');
  process.exit(1);
}
