/**
 * build-og.mjs — Genereer een 1200x630 OG-share image voor sociale
 * previews. Donkere brand-achtergrond + echte Froseo-logo + tagline.
 *
 * Aanpak: SVG voor de tekst-elementen + grid-pattern, sharp composite
 * voor het logo (librsvg ondersteunt geen externe rasters in <image>).
 *
 * Run met: node scripts/build-og.mjs
 * Output:  public/og-froseo.png
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const W = 1200;
const H = 630;

/* Brand-tokens 1-op-1 uit tokens.css. */
const NAVY = '#1B0B3B';
const NAVY_DEEP = '#0A0018';
const YELLOW = '#FCD34D';
const CREAM = '#F4EEE0';

/* Logo: brand-asset, white-on-transparent. Resize naar 420px breed
   zodat er ruim plek is voor tagline + reviews-regel onder. */
const LOGO_W = 420;
const logoPath = resolve(root, 'src/assets/brand/froseo-logo-wit.webp');
const logoBuf = await sharp(logoPath)
  .resize({ width: LOGO_W })
  .png()
  .toBuffer();
const { height: logoH } = await sharp(logoBuf).metadata();

/* Verticale uitlijning: logo + tagline + reviews-row als één visueel
   blok gecentreerd verticaal in het frame. */
const LOGO_X = 80;
const LOGO_Y = 110;

const TAGLINE_Y_TOP = LOGO_Y + (logoH ?? 120) + 70;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${NAVY}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${NAVY_DEEP}" stop-opacity="1"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>

  <text x="${LOGO_X}" y="${TAGLINE_Y_TOP}"
        font-family="'Outfit', system-ui, sans-serif"
        font-size="56" font-weight="800"
        fill="${CREAM}" opacity="0.94">
    Webdesign &amp; SEO
  </text>
  <text x="${LOGO_X}" y="${TAGLINE_Y_TOP + 68}"
        font-family="'Outfit', system-ui, sans-serif"
        font-size="56" font-weight="800"
        fill="${YELLOW}">
    uit Utrecht.
  </text>

  <text x="${LOGO_X}" y="${H - 90}"
        font-family="'Inter Tight', system-ui, sans-serif"
        font-size="24" font-weight="500"
        fill="${CREAM}" opacity="0.7">
    Voor ambitieuze ondernemers. 15+ jaar ervaring, 80+ projecten live.
  </text>
  <text x="${LOGO_X}" y="${H - 50}"
        font-family="'Inter Tight', system-ui, sans-serif"
        font-size="22" font-weight="700"
        fill="${YELLOW}">
    ★★★★★ 5/5 op Google reviews
  </text>
</svg>
`;

const outPath = resolve(root, 'public/og-froseo.png');

await sharp(Buffer.from(svg))
  .composite([{ input: logoBuf, left: LOGO_X, top: LOGO_Y }])
  .png({ quality: 90 })
  .toFile(outPath);

console.log(`✓ OG image written: ${outPath} (${W}x${H})`);
