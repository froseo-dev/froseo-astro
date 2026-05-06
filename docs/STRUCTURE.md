# Froseo 2026 — Project Structure

> Lees dit eerst als je nieuw bent in dit project (of als je een nieuwe Claude-sessie bent). Daarna `PROGRESS.md` voor wat er gebeurd is en wat de volgende stap is.

---

## Mappen

```
froseo-2026/
├── _reference/              ← READ-ONLY. Originele handover + raw image bronnen.
│                              Niet aanpassen; alleen lezen of als input voor het asset-script.
├── docs/
│   └── STRUCTURE.md         ← dit bestand
├── public/                  ← static files served as-is (favicon, robots.txt, og-images)
├── scripts/
│   └── process-assets.mjs   ← one-shot WebP conversie. `npm run assets` om te draaien.
├── src/
│   ├── assets/              ← BUILD-OPTIMIZED images. Astro's <Image> haalt hier responsive
│   │   │                      WebP/AVIF + srcset uit. NIET handmatig vullen — gebruik het script.
│   │   ├── brand/
│   │   ├── cases/<slug>/
│   │   └── logos/
│   ├── components/
│   │   ├── composition/     ← Page-niveau samenstellingen (Homepage.astro = alle secties).
│   │   ├── layout/          ← Topbar, Nav, Footer (alles wat op elke page staat).
│   │   ├── sections/        ← Page-secties: Hero, CasesStrip, FAQ, etc.
│   │   └── ui/              ← Kleine herbruikbare primitives (EyebrowPill, etc).
│   ├── content/
│   │   ├── cases/           ← *.md per case (Markdown + frontmatter)
│   │   ├── services/        ← *.md per dienst
│   │   └── data/
│   │       ├── faq.json     ← lijst van Q&A
│   │       └── testimonials.json
│   ├── content.config.ts    ← Zod schemas voor alle collecties
│   ├── layouts/
│   │   └── BaseLayout.astro ← <html>, <head>, fonts, og-tags. Elke page wrapt zichzelf hierin.
│   ├── pages/
│   │   ├── index.astro      ← Productie homepage
│   │   └── lab/
│   │       ├── index.astro  ← dashboard met links naar varianten
│   │       └── v1.astro     ← variant 1 (= huidige homepage)
│   ├── styles/
│   │   ├── tokens.css       ← CSS variabelen (kleuren, fonts, shadows, spacing).
│   │   │                      Theme-overrides via [data-theme="vN"] selectors.
│   │   └── global.css       ← imports tokens, daarna alle component-styling.
│   └── env.d.ts
├── astro.config.mjs
├── package.json
├── tsconfig.json            ← strict; aliases ~/, @components/, @layouts/, @assets/, @content/, @styles/
├── PROGRESS.md              ← status, beslissingen, open vragen
└── README.md
```

---

## Conventies

### CSS

- **Eén `global.css`** voor alle pagina/component styling. Find-and-replace-vriendelijk, makkelijk om holistisch te tweaken.
- **Tokens (CSS variabelen)** in `tokens.css`. Nooit hex-waardes hardcoden in `global.css` of components — altijd via `var(--color-xxx)`.
- **Theme overrides** via `[data-theme="v2"] { --color-magenta: #...; }` in `tokens.css`. Body krijgt het attribute via `<BaseLayout theme="v2">`.
- **Per-component `<style>` blokken** alleen voor scoped overrides die niet logisch in `global.css` thuishoren (bijv. positionering van een Astro `<Image>` die de oorspronkelijke `background-image` div vervangt). Markeer met `:global()` als ze door moeten naar de echte class.
- **Borders altijd 2.5px** via `var(--border)` (signature). Niet 2 of 3.
- **Hard offset shadows zonder blur** — comic-look. Format: `Xpx Ypx 0 var(--color-xxx)`.

### Components

- Klein & hergebruikbaar. Liever 5 components à 30 regels dan 1 component à 150.
- Props altijd typed (`interface Props`). Geef defaults zodat de component werkt zonder verplichte props (handig voor lab varianten).
- Composities (zoals `Homepage.astro`) doen ALLEEN sectie-volgorde + image-imports. Geen styling logica daar.
- Section-components weten zelf hun copy (defaults in props), maar mogen via props overschreven worden.

### Content

- **Cases & services** = markdown met frontmatter. Body is voor de detail-page (komt later).
- **FAQ & testimonials** = JSON. Geen long-form prose, dus markdown overkill.
- **Schema in `src/content.config.ts`** is de bron van waarheid. Wijk je af van de schema, dan errort `astro:content`.
- **Image references in frontmatter** zijn relatief paths naar `src/assets/...`. Astro's `image()` schema-helper resolved ze tot `ImageMetadata`.

### Assets

- **Bron-PNG/JPG** in `_reference/cases/...` of `_reference/brand/`.
- **Geconverteerde WebP** in `src/assets/...`. Gegenereerd door `npm run assets`.
- **Nieuwe afbeelding toevoegen?** PNG/JPG droppen in `_reference/cases/<ClientName>/`, dan `npm run assets`. Slug-mapping staat bovenin `scripts/process-assets.mjs`.
- **Hero pickregel:** bestand met "mock" in de naam wordt `hero.webp`; rest wordt `gallery-N.webp` op alfabetische volgorde.
- **Logos** in `_reference/cases/klant-logos/`. Bestandsnamen met "wit" of "white" krijgen suffix `-white.webp` (voor donkere achtergronden).

### Pages & routing

- `/` is de productie homepage.
- `/lab/*` zijn experiment-pagina's. **Niet productie**. Worden uitgesloten van robots en sitemap.
- Toevoegen van een variant: kopieer `pages/lab/v1.astro` naar `pages/lab/v2.astro`, pas theme/props aan, voeg toe aan `variants` array in `pages/lab/index.astro`.
- Voor v2 die echt anders is: maak een eigen composition (`Homepage_V2.astro`) en gebruik die ipv het gedeelde `Homepage.astro`.

---

## Veelgebruikte commando's

```bash
npm install            # eerste keer
npm run dev            # dev server
npm run build          # productie build (output: dist/)
npm run preview        # preview de productie build
npm run check          # astro check (TypeScript + content schemas)
npm run assets         # PNG/JPG bronnen → WebP in src/assets/
```

---

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+ (sharp werkt het lekkerst op 20 LTS)
- Geen environment variables nodig voor de basis-site.

---

## Snelle Q&A

**Q: Hoe voeg ik een nieuwe case toe?**
1. Drop afbeeldingen in `_reference/cases/<ClientName>/`
2. Voeg slug toe aan `CASE_SLUGS` in `scripts/process-assets.mjs`
3. `npm run assets`
4. Maak `src/content/cases/<slug>.md` met frontmatter (zie bestaande cases als template)

**Q: Hoe verander ik de hoofdkleur?**
- Zit op je hand tot we de semantische token-laag hebben. Daarna: één regel in `tokens.css`.

**Q: Hoe maak ik een tweede variant van de homepage?**
1. Kopieer `pages/lab/v1.astro` → `pages/lab/v2.astro`, zet `theme="v2"`
2. Voeg een entry toe aan `variants` in `pages/lab/index.astro`
3. Override variant tokens in `tokens.css` onder `[data-theme="v2"] { ... }`

**Q: Waar vind ik wat al gedaan is en wat de volgende stap is?**
- `PROGRESS.md` in de root.
