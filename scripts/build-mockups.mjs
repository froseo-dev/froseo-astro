/**
 * Batch mockup-builder voor case+portfolio en portfolio-only klanten.
 * Roept per klant achtereenvolgens screenshot.mjs (homepage desktop +
 * mobile screenshot) en build-mockup.mjs (composite in mock-up template)
 * aan via child processes.
 *
 * Usage:
 *   node scripts/build-mockups.mjs <slug>         # single
 *   node scripts/build-mockups.mjs --all          # alle klanten met mockup
 *   node scripts/build-mockups.mjs --all --skip-existing
 */

import { spawn } from 'node:child_process';
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

function run(cmd, args) {
  return new Promise((resolveP, rejectP) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, cwd: repoRoot });
    p.on('close', (code) => {
      if (code === 0) resolveP();
      else rejectP(new Error(`${cmd} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function processKlant(klant) {
  const { slug, url, bucket } = klant;
  if (bucket !== 'case+portfolio' && bucket !== 'portfolio-only') {
    console.log(`[${slug}] skip — bucket ${bucket} heeft geen mockup nodig`);
    return;
  }
  const collection = bucket === 'portfolio-only' ? 'portfolio' : 'cases';
  const outPath = resolve(repoRoot, 'src/assets', collection, slug, 'mockup.webp');

  if (skipExisting && existsSync(outPath)) {
    console.log(`[${slug}] skip — mockup.webp bestaat al`);
    return;
  }

  console.log(`\n=== [${slug}] mockup ===`);
  await run('node', ['scripts/screenshot.mjs', url, slug]);
  await run('node', ['scripts/build-mockup.mjs', slug, collection]);
}

if (all) {
  const targets = klanten.filter(
    (k) => k.bucket === 'case+portfolio' || k.bucket === 'portfolio-only',
  );
  console.log(`Running mockup build for ${targets.length} klanten`);
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
  console.error('Usage: node scripts/build-mockups.mjs <slug> | --all [--skip-existing]');
  process.exit(1);
}
