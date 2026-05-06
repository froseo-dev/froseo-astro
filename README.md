# Froseo 2026

Astro-site voor [Froseo Digital Agency](https://froseo.nl). Comic / neo-brutalism design, statische output, deploy naar Cloudflare Pages.

## Snel beginnen

```bash
npm install
npm run dev          # http://localhost:4321
```

## Verken het project

- **`PROGRESS.md`** — wat er is, wat de volgende stap is, open vragen.
- **`docs/STRUCTURE.md`** — mappenstructuur, conventies, hoe dingen werken.
- **`_reference/`** — originele design-handover + raw image bronnen (read-only).

## Routes

- `/` — productie homepage
- `/lab/` — variant-dashboard
- `/lab/v1` — eerste variant

## Commando's

| Script | Doel |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | productie build (`dist/`) |
| `npm run preview` | preview de build |
| `npm run check` | type-check + content schema check |
| `npm run assets` | PNG/JPG bronnen converteren naar WebP |
