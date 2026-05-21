/**
 * Screenshot-script voor portfolio/case mock-ups.
 *
 * Usage:
 *   node scripts/screenshot.mjs <url> <slug>
 *
 * Output:
 *   _reference/screenshots/<slug>/desktop.png  (1440x900 viewport, full-page)
 *   _reference/screenshots/<slug>/mobile.png   (390x844 viewport, full-page)
 *
 * Daarna kan build-mockup.mjs de screenshots in het mock-up template plakken.
 */

import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const [, , url, slug] = process.argv;

if (!url || !slug) {
  console.error('Usage: node scripts/screenshot.mjs <url> <slug>');
  process.exit(1);
}

const outDir = resolve(repoRoot, '_reference/screenshots', slug);
await mkdir(outDir, { recursive: true });

/**
 * Probeer een cookie-consent-banner weg te klikken zodat 'ie niet op de
 * screenshot eindigt. We proberen een serie tekst-matches op buttons (NL +
 * EN, accept-varianten). Eerste match wint. Silent fail wanneer geen banner.
 */
async function dismissCookieBanner(page) {
  const acceptTexts = [
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
  for (const text of acceptTexts) {
    try {
      const btn = page.getByRole('button', { name: new RegExp(`^${text}$`, 'i') }).first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(600);
        return true;
      }
    } catch (_) {
      // try next variant
    }
  }
  return false;
}

const browser = await chromium.launch();

try {
  // Desktop — 1440x900 viewport, full-page screenshot (long scroll).
  console.log(`[${slug}] Desktop screenshot…`);
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await desktopPage.waitForTimeout(1200);
  const desktopDismissed = await dismissCookieBanner(desktopPage);
  if (desktopDismissed) await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: resolve(outDir, 'desktop.png'),
    fullPage: true,
  });
  await desktopCtx.close();

  // Mobile — iPhone 14 Pro user-agent/touch, custom 393x844 viewport.
  // Playwright's default iPhone 14 Pro preset zet viewport op 393x660
  // (na Safari-chrome simulatie) → aspect 0.595, veel breder dan het
  // mock-up phone-frame aspect (~0.468). Door viewport handmatig op
  // 393x844 te zetten matcht de screenshot-aspect het mock-up frame
  // bijna exact, zonder horizontale crop.
  //
  // BEWUST viewport-only (geen fullPage). Bij fullPage rendert Playwright
  // fixed-positioned elementen op een vreemde positie in de stitched output.
  console.log(`[${slug}] Mobile screenshot…`);
  const mobileCtx = await browser.newContext({
    ...devices['iPhone 14 Pro'],
    viewport: { width: 393, height: 765 },
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await mobilePage.waitForTimeout(1200);
  const mobileDismissed = await dismissCookieBanner(mobilePage);
  if (mobileDismissed) await mobilePage.waitForTimeout(800);
  // Extra wachttijd voor sites met video-hero. Door mobile op een ander
  // moment te shooten dan desktop krijgen we 2 verschillende video-frames,
  // wat de mockup levendiger maakt. Voor statische sites geen effect.
  await mobilePage.waitForTimeout(4500);
  await mobilePage.screenshot({
    path: resolve(outDir, 'mobile.png'),
    fullPage: false,
  });
  await mobileCtx.close();

  console.log(`[${slug}] Klaar → ${outDir}`);
} finally {
  await browser.close();
}
