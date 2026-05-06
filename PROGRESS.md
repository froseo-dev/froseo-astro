# Froseo 2026 — Progress Log

> Bijgehouden door Claude. Elke werksessie krijgt een entry. Lees `docs/STRUCTURE.md` voor de uitleg van de mappenstructuur en conventies.

---

## Status

**Fase:** Foundation gelegd, V1 homepage live op dev — wachten op design feedback van Calvin.

**Dev server:** `npm run dev` — opent op http://localhost:4321 (of de eerstvolgende vrije poort).

**Routes die werken:**
- `/` — productie homepage (op dit moment identiek aan V1)
- `/lab/` — variant-dashboard
- `/lab/v1` — eerste variant (port van de reference HTML)

---

## Done

### 2026-05-05 — V2 polish: 2-button InlineCTA, FAQ paars, BCC teal+purple bleed (Claude / Opus 4.7)
- **InlineCTA → 2-button row**: was loud teal-button met magenta link daaronder (ze concurreerden visueel). Nu primary (teal) + ghost (white) naast elkaar, gelijk gewicht, matcht hero-pattern. Op mobile flex-wrap.
- **Testimonial overlay verwijderd**: de dark gradient over de Renovatie Totaal achtergrond is weg. Foto staat nu raw onder de testimonial card.
- **FAQ achtergrond paars**: van warm-cream naar `--color-purple-deep` (zelfde als Stats + PricingTeaser). Title-tekst → wit, em → highlight (mint/amber), em-underline → rare (magenta of teal). FAQ-item shadows aangepast naar magenta zodat de witte cards goed poppen tegen de paarse bg. Open-state shadow → highlight.
- **FAQ eyebrow** → variant "highlight" zodat hij leesbaar is op donkere bg.
- **Better Call Calvin gradient bg**: cream-to-purple linear-gradient (split rond 60-65% van section). Top is normale cream + grid, onderste 35% deep-purple. Vloeit visueel door in de FAQ-section eronder zonder zichtbare "naad".
- **BCC scoped palette overrides** via CSS custom properties — alle magenta (`--accent-rare`) wordt **teal**, en `--action-bg` voor de primary button wordt **deep-purple**:
  - Card shadow: teal
  - Title em: teal
  - Photo cirkel: teal
  - Phone-icon: teal
  - "Neem contact op" button: deep-purple bg
  - Yellow rating-shadow blijft (Calvin alleen magenta naar teal gevraagd)

`npx astro check` → 0 errors.

### 2026-05-05 — V2 reorder + paars Stats + echte testimonial assets (Claude / Opus 4.7)
**Asset pipeline uitgebreid** met `LOOSE_ASSETS` array — voor losse files in `_reference/` root die niet in cases/logos/brand-categorieën passen. Eerste twee entries:
- `Bas Bertrams Eigenaar Renovatie Totaal.jpg` → `src/assets/testimonials/bas-bertrams.webp` (max 600px)
- `Renovatie Totaal website en seo case.jpg` → `src/assets/testimonials/renovatie-totaal-bg.webp` (max 1920px)
Calvin kan in deze array nieuwe entries toevoegen voor andere losse assets.

**Testimonial visuals:**
- `avatar?: ImageMetadata` prop toegevoegd aan Testimonial component. Rendert via `<Image>` binnen de bestaande avatar-cirkel (overflow:hidden zorgt dat hij in de cirkel blijft). Fallback blijft de gekleurde placeholder als geen image.
- HomepageV2 importeert nu `bas-bertrams.webp` als avatar en `renovatie-totaal-bg.webp` als bg.

**InlineCTA**: padding-bottom 56px → **96px** (en mobile 36px → 64px). Geeft de "Geen bullshit"-blokken meer ademruimte voor de testimonial.

**Stats sectie**: was navy-purple `--surface-dark`, nu **deep purple `#270060`** — zelfde als PricingTeaser. Calvin liked de premium paarse look. Twee paarse zones op de pagina (Stats + PricingTeaser) creëren een visuele consistentie en herhalen het brand-statement.

**HomepageV2 reorder** (op Calvin's CRO-vraag, mijn advies = Optie A):
- FAQ helemaal naar onderen verhuisd (objection handling + SEO body)
- CTA-form omhoog tussen OverFroseo en Approach — zo ondervangen we de "2 CTA's achter elkaar" issue als FAQ niet meer als buffer ertussen zit
- Logica: Testimonial (proof) → Stats (cijfers) → OverFroseo (wie) → **CTA-form (eerste conversie-moment)** → Approach (proces, voor wie nog niet klikte) → PricingTeaser (laatste rationele push) → BetterCallCalvin (emotionele close) → FAQ (objections) → Footer

**Nieuwe V2 volgorde:**
```
Hero · Logos · Cases · Ticker · ServicesGrid · InlineCTA · Testimonial (bg + avatar) ·
Stats (PURPLE) · OverFroseo · CTA-form · Approach (watermark) · PricingTeaser ·
BetterCallCalvin · FAQ · Footer
```

`npx astro check` → 0 errors.

### 2026-05-05 — V2 polish: shadows + watermark + Bas Bertrams + Better Call Calvin (Claude / Opus 4.7)
- **Case-card shadow afkapping fix**: cases-row had `overflow-x: auto` waardoor de comic-shadow onderaan werd geclipped. Padding-bottom toegevoegd aan cases-row (24px) zodat de shadow binnen het scroll-viewport rendert.
- **InlineCTA versimpeld**: enkel een gecentreerde primary button + kleine secondary link "of bekijk alle diensten →" daaronder. Geen text-pill meer met magenta shadow card.
- **Approach watermark**: nieuw prop `watermark={true}`. Rendert het Froseo wit-logo (PNG) als grote `<img>` absoluut gepositioneerd in het midden van Approach. `mix-blend-mode: multiply` + `filter: brightness(0)` + opacity 0.07 + radial-fade-mask = subtiele dark watermark achter de stappen. LogoBreak component is daarmee NIET meer nodig in V2 — verwijderd uit composition.
- **PricingTeaser kleur-flip**: van amber bg → **deep purple `#270060` bg** met witte teksten. Het amount (€99) blijft amber als hero-getal voor pop. Body copy herschreven naar "Ideaal voor ondernemers die zorgeloos en zonder omkijken hun website willen hebben. Verschillende pakketten, transparant maandbedrag — vaak lager dan wat andere bureaus puur voor hosting en onderhoud rekenen." (Calvin's wens: niet "geen verborgen meerwerk" claim).
- **CTA-form versimpeld**: alleen 2 velden (Website + Email), Naam + Telefoon weg. Body copy: "Ontvang een gratis analyse met concrete verbeterpunten. Zonder verplichtingen." Features-bar uitgeschakeld via `features={[]}`. Submit-meta: "100% vrijblijvend" (geen "Binnen 48u" meer, geen "geen sales").
- **Nieuwe sectie `BetterCallCalvin.astro`** (vervangt CTA-link na FAQ):
  - Witte card met paarse shadow
  - Eyebrow "Direct met de eigenaar"
  - H2 "Better call <em>Calvin.</em>"
  - 2 paragrafen lead copy
  - Twee acties: "Neem contact op" (primary button) + telefoon-knop "★ 030 237 8053"
  - Rechts: ronde paarse photo-circle (placeholder met "C" initial — Calvin vervangt later met echte foto) + Google-rating callout (4,9 · 80+ reviews) overlappend onderaan de cirkel
  - Layout 1.4fr / 1fr op desktop, stacked op tablet/mobile
- **Testimonial bgImage**: Testimonial component accepteert nu `bgImage?: ImageMetadata` + `bgAlt?: string`. Rendert als full-cover `<Image>` achter de testimonial card, met dark-tint overlay (color-mix surface-dark 65→80%) zodat de yellow card focal blijft. V2 gebruikt `renovatie-totaal/hero.webp` als bg (Calvin kan vervangen door echte werkfoto te droppen in `_reference/cases/Renovatie Totaal/` en `npm run assets`).
- **Testimonial quote update** naar Bas Bertrams (Eigenaar Renovatie Totaal):
  > "Bij mijn vorige bureau liep de communicatie dramatisch en moest ik soms weken wachten tot er iets werd opgeleverd. Bij Froseo bel ik Calvin, die fixt het vaak al dezelfde dag. Ook komt hij zelf met creatieve ideeën om onze website mee te verbeteren. Heerlijk!"

`npx astro check` → 0 errors. V2 totaal nu ~240 KB HTML.

**Open punten voor volgende ronde:**
- Calvin's echte foto voor BetterCallCalvin photo-circle (placeholder = paarse cirkel met "C")
- Bas Bertrams avatar voor testimonial-card (huidige cream cirkel)
- Echte Renovatie Totaal werkfoto voor testimonial bg (huidige = website screenshot uit hero)
- Echte telefoon nummer voor BetterCallCalvin (huidige = "030 237 8053" uit footer)

### 2026-05-05 — V2 polish: title/USP swap, page-wide marquee, LogoBreak + PricingTeaser, breder CTAs (Claude / Opus 4.7)
**OverFroseo content:**
- Title: "Born and raised in Utrecht" → **"Utrechtse eigenzinnigheid. Landelijk effectief."** Em accent met magenta underline.
- Lead-paragraaf 1: lichtjes herzien naar "geboren en getogen" + "volop benutten" — meer Calvin's stem.
- USPs herzien (Calvin's voorstellen):
  - 01 Direct contact met je expert (kept)
  - 02 ~~Wekelijkse sprints~~ → **Geen lange wurgcontracten**
  - 03 ~~Webdesign én SEO in één hand~~ → **Volledig ontzorgd, done-for-you**
  - 04 De kracht van AI volop benut (kept)

**Cities marquee page-wide**: was geconstreind op `inner + 2*gutter` (~1360px op 1920 viewport). Nu via `width: 100vw; left: 50%; transform: translateX(-50%)` echt full-viewport. Mask blijft ervoor zorgen dat de randen mooi vervagen.

**CTA-form breder**: max-width 920px → `var(--container-max)` (1280px), padding 44/40 → 56/64, gap 36 → 56, ratio 1fr/1fr → 1.1fr/1fr. Nu visueel even breed als de Approach-sectie erboven.

**CTA-link copy + sizing matchen met form:**
- Title size clamp(24,2.4,34) → clamp(28,3.6,48) — exact match met form variant
- Text size 14px → 16px
- Card padding 36/40 → 48/56
- Background terug naar `--surface-dark` (donkere card, niet meer wit) zodat het visueel bij de form-CTA past
- Copy: "30 minuten online of in Utrecht" → **"30 minuten online — vrijblijvend, zonder sales-praatje."**
- Meta: "30 min · vrijblijvend" → "30 min · 100% online"

**FAQ andere bg**: was `--surface-page` (cream), nu `--surface-page-deep` (subtieler warm-darker tint). Breekt het visuele ritme van licht-licht-licht.

**Nieuwe sectie `LogoBreak.astro`**: decoratieve overgang met giant "FROSEO." watermark (~7% opacity, radial-fade-mask). Tussen OverFroseo (donker) en Approach (licht) — geeft visueel ademmoment + brandsignal. Light en dark variant beide ondersteund.

**Nieuwe sectie `PricingTeaser.astro`**: opvallend amber/highlight blok met **€99/maand** als hoofdgetal in display-font 72-140px. Eyebrow "Nieuw · AI-powered website", body legt uit dat dit incl. hosting + onderhoud + doorontwikkeling is. CTA-knop "Bekijk de pakketten →". Donker (`surface-dark`) button voor max contrast tegen de amber bg. Position: tussen Approach en CTA-form (vlak vóór de conversie-zone).

**Nieuwe HomepageV2 volgorde:**
1. Hero
2. Logos
3. Cases
4. ServicesTicker
5. ServicesGrid "Geen bullshit. Wel resultaat."
6. InlineCTA
7. Testimonial
8. Stats (DARK, "Webdesign & marketing uit Utrecht, voor heel Nederland")
9. OverFroseo (DARK + page-wide cities marquee)
10. **LogoBreak** ← nieuw, watermark transition
11. Approach
12. **PricingTeaser** ← nieuw, amber €99/m hook
13. CTA-form (DARK, breder, container-max)
14. FAQ (DEEPER CREAM bg)
15. CTA-link (DARK card, font sizes matchen form)
16. Footer

`npx astro check` → 0 errors.

### 2026-05-05 — V2 herontwerp: OverFroseo + InlineCTA + cleaner CTAs (Claude / Opus 4.7)
Calvin's pijnpunten over V2: WhyFroseo niet mooi, "Webdesign & SEO uit Utrecht" stond awkward midden op de pagina, CTAs te lomp/te groot, geen afwisseling/afbeelding na ServicesGrid.

**Logos sectie**: padding van 56px → 28px (compacter strip).

**Cases**: card breedte 410px → 460px, image 260px → 280px, body padding 20/24 → 28/32, gap 22px → 28px. Stap 432 → 488. Minder cards tegelijk in beeld, ruimer ademen.

**Nieuwe sectie `OverFroseo.astro`** (vervangt WhyFroseo + LocalAgency-minimal):
- DARK section (surface-dark)
- Eyebrow "★ Over Froseo"
- H2 "Born and raised in <em>Utrecht.</em>" (highlight kleur, dark blok eronder als underline)
- Body: 2 paragrafen — Calvin's "born and raised" tekst, eigenzinnigheid, Domstad, samenwerkingen in Amersfoort/Zeist/Rotterdam etc.
- Rechts: subtiele 4 USPs als numbered list met top/bottom dunne lijntjes (Direct contact, Sprints, SEO+web, AI)
- **Cities marquee onderaan**: scrollende lijst van 12 steden (Utrecht, Amersfoort, Zeist, Rotterdam, Delft, Hoorn, Doetinchem, Deventer, Amsterdam, Haarlem, Den Bosch, Eindhoven), gescheiden door highlight-stars. Geeft visuele animatie + lokaal verhaal.
- WhyFroseo CSS blijft staan (oude variant, niet gebruikt in V2 nu — kan later opgeruimd).

**LocalAgency--minimal verwijderd uit V2** — Utrecht/local verhaal zit nu volledig in OverFroseo.

**Stats herzien:**
- Title: "Webdesign & marketing uit Utrecht, voor heel Nederland." (Calvin's voorstel — captures keyword + serves as section heading)
- 4 stats: 80+ Projecten live · 25+ Plaatsen #1 ranking · 5/5 Op Google reviews · 15+ Jaar ervaring (op Calvin's input)

**Nieuwe component `InlineCTA.astro`** — compact comic-card horizontal strip met text + button. Slot tussen secties. Onder ServicesGrid: *"Niet zeker welke aanpak bij jou past? → Plan een vrijblijvend gesprek →"*. Vangt de visitor die net 4 diensten gezien heeft maar nog twijfelt.

**CTA-form subtieler:**
- Card: max-width 1100→920px, padding 64/56→44/40, shadow 12px→8px
- Title: clamp(40,5.5,76)→clamp(28,3.6,48)
- Form: padding 32→24, border-radius lg→md, shadow highlight→5px highlight, input padding 14→11px, btn padding 16→13px
- Net: ~40% kleiner in visual weight.

**CTA-link homogener (van dark slab naar witte horizontal card):**
- Was: dark column met grote heading en button
- Nu: lichte witte card met magenta shadow (matcht InlineCTA en de rest van het design), 2-koloms — links eyebrow + title + text, rechts button met meta-line
- Padding 36/40, max-width 1100, light surface

**Nieuwe HomepageV2 volgorde:**
1. Hero
2. Logos (compact)
3. Cases (breder)
4. ServicesTicker
5. ServicesGrid "Geen bullshit. Wel resultaat."
6. **InlineCTA** ← nieuw, mid-page conversion-bridge
7. Testimonial (yellow card)
8. Stats (DARK, nieuwe titel + cijfers)
9. **OverFroseo (DARK met city marquee)** ← samengevoegd verhaal
10. Approach (light)
11. CTA-form (compact, donker met form)
12. FAQ
13. CTA-link (homogene witte card)
14. Footer

`npx astro check` → 0 errors. Visuele afwisseling: light → dark → teal → dark → light → dark-stretch (Stats+OverFroseo) → light → ...

### 2026-05-05 — V2 herzien naar Calvin's volgorde (Claude / Opus 4.7)
Calvin vond V2 te stoer in begin. Herbouwd zodat de eerste schermen identiek zijn aan V1 en de variatie pas later komt.

**Nieuwe V2 sectievolgorde:**
1. Hero
2. Logos
3. Cases
4. ServicesTicker (terug naar oorspronkelijke positie)
5. ServicesGrid ("Geen bullshit. Wel resultaat.")
6. **Testimonial** — V1 styling (gele card, niet magazine), nieuwe copy "direct contact"
7. **Stats** — V1 styling (4 kaarten), niet de strip
8. **WhyFroseo** — herzien: subtieler 2x2 grid met dunne lijntjes, geen manifesto. **Nieuwe copy** (Calvin's input):
   - 01 Direct contact met je expert
   - 02 Wekelijkse sprints
   - 03 Webdesign én SEO in één hand (door mij ingevuld voor #3)
   - 04 De kracht van AI benut
9. Approach
10. **LocalAgency** (variant=minimal, met eyebrow + kleine Utrecht-kop). Houdt SEO body copy + zichtbare "Webdesign & SEO uit Utrecht" h2 voor rankings, zonder de pagina te domineren.
11. **CTA #1** (variant=form) — *Gratis website-analyse* — vóór de FAQ zodat bezoekers niet door alle vragen heen moeten voor een conversie
12. FAQ
13. **CTA #2** (variant=link) — *Plan een strategiegesprek →* — link naar `/contact` ná de FAQ voor de "ik wil sparren" intent
14. Footer

**Component changes:**
- `WhyFroseo.astro` — 4 items, 2x2 grid, dunne 1.5px lijntjes als dividers, geen kaarten, geen manifesto-grootte. Title "Waarom *Froseo.*" (subtieler dan "Eén team. Geen schuiven.").
- `LocalAgency.astro` minimal variant — uitgebreid met `EyebrowPill` + kleine `<h2>` "Webdesign & SEO uit Utrecht." Behoudt SEO-keyword in een h2 maar visueel laag-prominent.
- `CTA.astro` — nieuwe `variant: 'form' | 'link'` prop. Link variant rendert single-column met grote button + meta-line, geen formulier. Default blijft `form`.

**Twee CTA-strategie:**
- CTA #1 (form, vóór FAQ) — laagdrempelige analyse-aanvraag
- CTA #2 (link, na FAQ) — hogere intent: gesprek inplannen op `/contact`
Vangt twee verschillende intents zonder bezoekers door alle vragen te dwingen.

`npx astro check` → 0 errors. `/lab/v2` op Calvin-2 theme.

### 2026-05-05 — V2 CRO-optimized lab build + Calvin-2 theme (Claude / Opus 4.7)
Calvin's huidige build (`/`) blijft intact. Nieuwe V2 build op `/lab/v2` met CRO-research-backed sectievolgorde + 2e palette.

**Research basis (NN/g):** 74% van aandacht in eerste 2 schermen, 81% in eerste 3. Wat verkoopt moet vroeg, SEO body copy hoort onderaan.

**Nieuwe sectievolgorde V2** (ipv current):
1. Hero
2. Logos slider (trust)
3. Cases-strip (proof of outcomes)
4. **Testimonial** (variant=magazine) — verhuisd van #11 naar #5, copy aangepast naar "direct contact" angle van Calvin's fan-klant
5. **WhyFroseo** (NIEUW, manifesto-style) — 3 USPs als grote typografische statements, geen cards
6. Services-ticker
7. Services-grid
8. Approach
9. **StatsStrip** (NIEUW) — compacte inline strip ipv full section
10. **LocalAgency** (variant=minimal) — gekrompen naar 1 paragraaf SEO body copy met link
11. FAQ
12. CTA
13. Footer

**Nieuwe components:**
- `WhyFroseo.astro` — manifesto USPs met genummerde statements gescheiden door horizontale lijntjes. "Direct contact met je expert" leidend.
- `StatsStrip.astro` — 4 cijfers in horizontale strip (geen kaarten, dividers tussen items, donkere bg).

**Component variants:**
- `Testimonial` — `variant=card` (default, gele card) + `variant=magazine` (full-bleed dark, oversized quote in display-font, kleine avatar + naam inline).
- `LocalAgency` — `variant=full` (default, 2-col met USP cards) + `variant=minimal` (1 paragraaf SEO body, centered, opacity 0.75).

**Calvin-2 theme:** zelfde palet-DNA als Calvin maar warmer:
- Surface-page → warmer cream `#F5EDD8` (was cool cream)
- Surface-dark → aubergine `#1A0810` (was navy-purple)
- Highlight → amber `#F2B544` (was yellow `#FFD93D`)
- Action button → blijft teal
- Border + line-color → aubergine (was navy-purple)

**Nieuwe testimonial copy** (Calvin's fan-klant insight):
> "Bij andere bureaus moest ik via accountmanagers, projectleiders en weet ik veel wie. Bij Froseo bel ik gewoon de man die m'n site bouwt — geen vertraging, geen vertaling."

**Routes nu:**
- `/` — current build (Homepage composition, default theme = Calvin)
- `/lab/v1` — kopie van `/` (oudere variant)
- `/lab/v2` — NIEUWE build (HomepageV2 composition, default theme = Calvin-2)
- `/lab/` — dashboard met links naar beide

`npx astro check` → 0 errors.

### 2026-05-05 — SEO foundation: LocalAgency section + meta + schema (Claude / Opus 4.7)
Calvin's huidige homepage rankt #3 op "webdesign utrecht" / "webdesigner utrecht". Nieuwe build mag die equity niet verliezen. Aanpak: brand-focused hero behouden, lokale autoriteit via dedicated section + meta + schema bouwen.

**Nieuwe sectie `LocalAgency.astro`** — staat tussen Stats en Approach. ~200 woorden SEO-rich body copy:
- Eyebrow "Lokaal verankerd · Utrecht"
- H2: "Webdesign & SEO bureau uit hartje Utrecht."
- 2 paragrafen lead met expliciete vermeldingen van: Utrecht, Leidseveer, MKB, Nederland, dakdekkers, personal trainers, webdesign, SEO, online marketing.
- 3 USP-cards rechts: geen accountmanagers, wekelijkse sprints, webdesign+SEO onder één dak.
- "Lees meer over Froseo →" link naar `/over-ons`.

**FAQ uitgebreid 6 → 10 items** met long-tail keyword titels:
- Toegevoegd: kosten website Utrecht, WordPress vs maatwerk, lokale vs organische SEO, paid media (Google Ads), AI-implementaties.
- Bestaande titels herschreven met keywords (bv. "Voor welke bedrijven werkt Froseo als webdesign bureau in Utrecht?", "Werkt Froseo ook buiten Utrecht?", "Wat maakt Froseo anders dan andere webdesign bureaus?").

**Schema.org JSON-LD:**
- `BaseLayout.astro`: LocalBusiness + Organization schema (naam, adres Leidseveer 10 3511 SB Utrecht, telefoon, email, areaServed Nederland, aggregateRating 4.9/80, sameAs social links).
- `FAQ.astro`: FAQPage schema, dynamisch gegenereerd uit faq.json content collection (single source of truth).

**Meta tags:**
- Default title: "Webdesign & SEO bureau Utrecht — Froseo Digital Agency"
- Default description: "Effectieve websites & SEO uit Utrecht voor ambitieus MKB. 15+ jaar ervaring, 80+ projecten live, 4,9/5 op Google reviews. Plan een gratis website-analyse."

**Subtiele on-page tweaks:**
- Hero eyebrow: "Digital Agency Utrecht · 15+ jaar ervaring" (was zonder Utrecht).
- Topbar: "Digital Agency uit Utrecht voor ambitieus MKB · 15+ jaar ervaring".

`npx astro check` → 0 errors. Total homepage word count steeg van ~1100 naar ~1900+ voor SEO-parity met de bestaande site.

**Migratie-aandachtspunten** (voor de live-switch):
- Huidige sitemap.xml van froseo.nl ophalen → 301-redirect mapping bouwen.
- Google Search Console rankings vastleggen als baseline vóór live-gang.
- Match minstens woordenaantal van bestaande pagina (we zijn er nu ruim overheen).
- Schema markup live valideren via Rich Results Test van Google.

### 2026-05-05 — Calvin tweak round 7 (Claude / Opus 4.7)
- **Hero photo card 28px omhoog** via `transform: translateY(-28px)` op `.hero-right`. Mobile reset.
- **Hero sub-paragraaf vervangen door 3 bullets** met magenta (`--accent-rare`) checkmarks:
  - "AI-powered websites met een eigen smoel."
  - "Marketing die niet alleen bezoekers, maar ook klanten oplevert."
  - "Voor ambitieus MKB dat serieus online wil groeien."
  - Component prop `bullets?: string[]` overschrijft `sub?: string` paragraaf-fallback.
- **Cases-footer**: 3-koloms grid op desktop → "Meer cases →" knop **gecentreerd** in midden, arrows rechts. Tablet/mobile (≤1024px): valt terug naar 2 koloms — knop links, arrows rechts.
- **ServicesGrid title**: "Geen bullshit. Alleen *resultaat.*" → "Geen bullshit. Wel *resultaat.*".

### 2026-05-05 — Calvin tweak round 6 (Claude / Opus 4.7)
- **Hero badge "★ #1 GOOGLE" verwijderd** (markup uit Hero.astro, CSS uit global.css, tokens `--hero-badge-bg/text` weg uit tokens.css). Hero is nu rustiger.
- **Hero result-card** ("+312% verkeer · Top Dakdekker Zeist") verhuisd van **bottom-left → top-right**. Vult de plek waar de badge zat. Leesvolgorde: h1 links → foto rechts → result top-right.
- Mobile: result-card valt terug naar bottom-right (was bottom-left), past beter bij stacked layout.

### 2026-05-05 — Calvin tweak round 5 (Claude / Opus 4.7)
- **Hero grid 2fr/1fr** (was 1.5fr/1fr) zodat de h1 op 7vw/clamp(102px) **2 regels blijft** met "Van onzichtbaar" en "naar onmisbaar." elk op eigen regel.
- **Cases-strip footer** ontworpen onder de cards: links de "Meer cases →" CTA (`btn-ghost`, wit), rechts de pagination arrows. Arrows niet meer absolute over de cards. Arrows op mobile blijven zichtbaar (44×44 ipv 52×52).
- **Logo** in nav: filter omgewisseld van `brightness(0)` (zwart) naar themable `--logo-shadow` token. Default = pure-zwart drop. Calvin = deep-purple `#270060` 3px hard-offset drop. Logo zelf blijft de witte PNG.

### 2026-05-05 — Calvin tweak round 4 + CRO + grid + hero pick (Claude / Opus 4.7)
**CRO sectievolgorde**: Logos en Services-ticker omgewisseld. Hero → Logos (trust direct na belofte) → Cases-strip → Services-ticker (decoratief) → Services-grid → Stats → Approach → Testi → FAQ → CTA. Volgorde-principe: belofte → proof → outcomes → methode → vertrouwen → actie.

**Logos sectie (alle themes):**
- Desktop (>1024px): label "Wij werken trots samen met:" staat **inline links** van de marquee. Logos lopen visueel "in" het label via de left-edge fade-mask van de strip.
- Tablet/mobile (≤1024px): valt terug op stacked layout (label boven).

**Asset pipeline** — `scripts/process-assets.mjs` herschreven met per-case hero-hint:
- Sfeer-image krijgt voorrang als die bestaat (Rex / Studio Max / Theo Mackaay).
- Anders eerste website/homepage/non-mockup foto.
- **Mockup nooit als hero** (Calvin's regel). Mockup gaat naar einde van gallery.
- 9 cases opnieuw verwerkt; `hero.webp` overschreven, geen markdown changes nodig.

**Calvin theme tweaks:**
- `--line-color` token ingevoerd (default = pure `#000`, Calvin = `#150030` deep navy-purple uit de services-ticker). Borders + comic-line shadows pakken automatisch op. Overige themes zwart-puur.
- Hero h1 een tikkie groter: `clamp(52px, 7vw, 102px)`.
- Hero card drop-shadow: `--hero-card-shadow-color` token, Calvin = deep purple `#270060`.
- Hero "★ #1 GOOGLE" badge: `--hero-badge-bg` + `--hero-badge-text` tokens, Calvin = light purple `#6901AA` met witte tekst.

**Pattern → grid (alle themes):**
- `--pattern-dot-*` tokens vervangen door `--bg-decoration-light` / `--bg-decoration-dark` — multi-layer background:
  1. Radial-gradient overlay (bg-color in hoeken → transparent in middel) = de "radial fade" naar de zijkanten.
  2. Repeating-linear-gradient horizontaal: 1px lijn elke 60px, lijn-kleur via `color-mix` op text-primary 9% / white 7%.
  3. Idem verticaal.
- Tokens `--backdrop-size` en `--backdrop-repeat` voor consistente sizing/repeat config.
- Toegepast op body + alle surface-page secties (services, approach, testi, faq, cta) + alle surface-dark secties (services-carousel, logos, stats, footer, cta-card) + lab-shell.

**Cases — meer context:**
- Schema-veld `description` (optioneel, langer dan tagline) toegevoegd.
- 6 case markdowns voorzien van 2-3 zinnen story-copy.
- Card body rendert `description ?? tagline`. Line-clamp op 5 regels zodat alle cards in de row dezelfde hoogte houden.

`npx astro check` → 0 errors.

### 2026-05-05 — Calvin tweak round 3 (Claude / Opus 4.7)
- **Topbar in Calvin** → deep purple (`--color-purple-deep`) ipv het lichtere `--color-purple`.
- **Hero eyebrow pill** in Calvin → light purple (`--color-purple`) met witte tekst. Eigen `--hero-eyebrow-bg` + `--hero-eyebrow-text` tokens, scoped via `.hero-left .eyebrow-pill`.
- **Hero h1 op 2 regels**: grid van 1.1fr/1fr → 1.5fr/1fr (60/40), font-size cap van 116 → 92px, letter-spacing iets ruimer. "Van onzichtbaar" en "naar onmisbaar." passen nu elk op één regel op desktop.
- **Cases-strip title** alles wit, "ambitieus MKB" em wit met deep-purple onderlijn (was paars met geen onderlijn).
- **Cases met metrics** — schema uitgebreid met optionele `metrics: [{value, label}]` array (max 2). 6 case markdowns voorzien van placeholder metrics. Card body toont nu twee stat-blokjes (waarde groot in `--accent-primary`, label mono uppercase) ipv het simpele "result" badge. Result badge wordt automatisch verborgen als metrics aanwezig is.

### 2026-05-05 — Calvin tweak round 2 (Claude / Opus 4.7)
- **Cases helemaal opnieuw**: split-layout cards (image top, content body bottom). 410px breed, 260px image-hoogte. Body: type eyebrow + groot client-name + tagline + "Bekijk case" CTA met arrow. 3 zichtbaar op 1280, 4 op 1600+. Cases-niches paragraaf weggehaald.
- **Logos**: 84px hoog (was 56), gap 120px (was 80), animatie iets langzamer (80s).
- **Topbar in Calvin**: paars (`--color-purple`) ipv navy-purple. Eigen `--topbar-bg` token.
- **Hero h1 in Calvin**: deep purple (`--color-purple-deep`) ipv ink-zwart. Eigen `--hero-title-color` token.
- **Hero card overlay** (de "waas") in Calvin uit. `--hero-card-overlay-opacity: 0` token (default 1).
- **ServicesTicker** herzien: alle items wit (geen color-rotatie meer), nieuwe lijst:
  Lokale SEO · Webdesign · SEO/GEO · Paid Advertising · WordPress Websites · Conversie-optimalisatie · Website Onderhoud · Google Business Profile · AI Implementaties.
- `npx astro check` → 0 errors.

### 2026-05-05 — Calvin theme + structural tweaks (Claude / Opus 4.7)
Calvin koos voor Royal als basis maar wil daarop iteratief tweaken. Eerste batch:
- **Calvin theme** toegevoegd in `tokens.css` (kopie van Royal + per-element overrides). **Default voor nieuwe bezoekers** via inline script in `BaseLayout`.
- **Sectioned tokens** geïntroduceerd: `--action-bg`, `--hero-accent-color`, `--hero-accent-underline`, `--cases-strip-bg`, `--cases-strip-em`, `--cases-strip-em-underline`, `--cases-strip-pill-bg`, `--cases-strip-pill-text`, `--radius-action`. Defaults verwijzen naar `--accent-*`; themes kunnen losse elementen overrulen zonder de hele accent-set te kapen.
- Calvin-specifieke overrides:
  - Hero "onmisbaar" = teal text, underline = transparent (weggehaald)
  - btn-primary "Plan gratis analyse" + nav-cta "Plan gesprek" = teal bg
  - Cases-strip bg = teal (Royal had purple), pill = purple/wit, "ambitieus MKB" em = purple zonder underline
  - Knoppen radius = 14px (matcht hero result-card) ipv pillvormig
- **Structurele wijzigingen** (gelden voor élk theme — zijn pure verbeteringen):
  - Nav: tekst "FROSEO." vervangen door PNG-logo (witte versie + `filter: brightness(0)` voor zwart). Hoogte 32px, mobile 26px.
  - Cases: cards 320px breed, aspect 4/5 ipv 3/4. 4 zichtbaar op desktop ipv ~5.
  - Logos-sectie volledig herontworpen: dark surface bg, label "Wij werken trots samen met:", logos 56px ipv 38px, fade-mask aan beide randen via `mask-image` linear-gradient.
- **PaletteSwitcher** uitgebreid: Calvin als eerste optie (default).
- `npx astro check` → 0 errors.

### 2026-05-05 — Palette switcher + 5 theme variants (Claude / Opus 4.7)
- Calvin's feedback op de teal-only swap: te saai/monochroom, mist purple, mint cyan ugly, warme cream-bg deed het beter. Vroeg om in-page switcher om varianten te vergelijken.
- **PaletteSwitcher widget** (`src/components/dev/PaletteSwitcher.astro`) — vlottend rechtsonder, alleen in dev (`import.meta.env.DEV`). Klik = wissel theme + persist in localStorage. Inklapbaar (geel rondje rechtsboven).
- **Inline script in `<head>`** van `BaseLayout` — leest localStorage en zet `data-theme` op `<html>` vóór body rendert (geen flash).
- **5 themes gedefinieerd** in `tokens.css` (default = Royal Purple):
  - **Royal** (default): purple primary + magenta rare + yellow highlight, navy-purple dark, cream bg.
  - **Comic**: magenta + teal + yellow op cream (originele V0 uit handover).
  - **Sunset**: coral + plum + amber op warm-cream, aubergine dark surfaces.
  - **Forest**: forest green + rust + cream-yellow op sand, dark forest surfaces.
  - **Modern**: teal + magenta + mint cyan op bone (de versie die Calvin saai vond — bewaard als referentie).
- **Color-mix derived tokens** voor `--nav-bg` (translucent versie van `--surface-page`) en dot patterns — passen automatisch aan bij theme-swap. Geen hardcoded rgba meer voor adaptieve elementen.
- Hero card overlay-gradient en case-card bottom gradient idem omgezet naar `color-mix(in srgb, var(--surface-dark) X%, transparent)`.
- `lab/v1.astro` theme="v1" prop verwijderd (oude theme bestaat niet meer; switcher controleert nu).
- `lab/index.astro` herzien: legt switcher uit, linkt naar homepage.

### 2026-05-05 — Palette swap + semantic refactor (Claude / Opus 4.7)
- Twee-laagse token-architectuur: `tokens.css` heeft nu **Layer 1** (palette: `--color-teal`, `--color-magenta`, etc) + **Layer 2** (semantic: `--accent-primary`, `--accent-rare`, `--accent-highlight`, `--surface-page`, `--surface-dark`, `--text-primary`, etc).
- Components en classes verwijzen nu uitsluitend naar Layer 2 — palette swappen = paar regels in `tokens.css` aanpassen, geen component aanraken.
- **Palette swap toegepast** (op verzoek Calvin):
  - Primary accent: magenta → **teal** (`#009692`)
  - Rare accent: teal → **magenta** (`#B6007B`)
  - Highlight: yellow → **mint cyan** (`#6EE3DE`)
  - Dark surface: pure ink → **deep navy** (`#0E1A33`)
  - Page bg: warm cream → **cool bone** (`#EBEEF4`)
  - Borders blijven puur zwart (comic-lijn).
- Modifier classes hernoemd naar rol:
  - `.magenta-shadow` → `.primary-shadow`, `.teal-shadow` → `.rare-shadow`, `.purple-shadow` → `.dark-shadow`
  - `.case-tag.magenta` → `.case-tag.primary`, `.teal` → `.rare`, `.white` → `.light`
  - `.service-item.magenta/teal/yellow` → `.primary/rare/highlight`
  - `.eyebrow-pill.magenta/teal/yellow/white` → `.primary/rare/highlight/light`
- Schema enums in `content.config.ts` bijgewerkt (`'primary' | 'rare' | 'highlight' | 'light'` voor case-tag, `'primary' | 'rare' | 'highlight' | 'dark'` voor service shadow).
- 10 case markdown files + 4 service markdown files geüpdatet met nieuwe enum values.
- 4 component files geüpdatet (EyebrowPill props, ServicesTicker default items, Stats/Approach/CTA/CasesStrip eyebrow variant).
- `npx astro check` → 0 errors. Routes 200, html-grootte ~145KB.

### 2026-05-05 — Initial setup (Claude / Sonnet 4.6)
- `_reference/` map gemaakt uit oude `test-website/` (read-only bron, niet aankomen).
- Astro 5 project opgezet zonder Tailwind, met TypeScript strict, sitemap, sharp.
- Design system gesplitst in `tokens.css` (variabelen) en `global.css` (componenten).
- Asset pipeline (`scripts/process-assets.mjs`) geschreven en gedraaid:
  - 9 cases → WebP onder `src/assets/cases/<slug>/`
  - 15 klant-logos → WebP onder `src/assets/logos/`
  - 1 brand-logo → WebP onder `src/assets/brand/`
  - **Bekend issue:** map `_reference/cases/Club12/` was leeg, dus Club12 case staat op `published: false`.
- Content collections (Astro 5 content layer): `cases`, `services`, `testimonials`, `faq`.
- 13 components gebouwd (layout: 3, sections: 10, ui: 1).
- Compositie: één `Homepage.astro` die alle secties samenstelt — wordt door zowel `/` als `/lab/v1` hergebruikt.
- `npx astro check` → 0 errors. Dev server start, alle routes geven HTTP 200.

---

## In Progress

- Wachten op Calvin's review van het nieuwe palet in de browser.

---

## Next Up (volgorde)

1. **Visueel review V1** in browser, vergelijk teal/magenta/mint vs. eerdere magenta/yellow/teal. Tweak waar het schuurt.
3. **V2 variant** maken zodra V1 een vergelijkingspunt is geworden (kopie van `lab/v1.astro` → `lab/v2.astro` + override tokens of section-volgorde).
4. **Cases detail pagina's** via dynamic route `[slug].astro` op basis van content collection.
5. **Diensten detail pagina's** idem.
6. **Over ons / Blog / Contact** pagina's.
7. **Echte hero image** voor `/` kiezen — momenteel de Top Dakdekker mockup.
8. **Form-handler** voor de CTA-form (Cloudflare Pages Functions of een formservice — TBD).
9. **Sitemap** controleren en `/lab/*` uitsluiten in `astro.config.mjs` (nu: gestaag via robots.txt).
10. **Lighthouse run** — target a11y > 95, performance > 90 (zoals in handover).

---

## Open Questions (wachten op antwoord van Calvin)

### 1. Hero image voor productie homepage
Op dit moment gebruikt `/` het Top Dakdekker mockup als hero. Wil Calvin een andere case prominent? Of een speciaal gemaakte hero?

### 2. Logos in ticker — naam-tekst of plaatje?
De reference HTML had alleen tekst. Wij renderen nu de PNG-logos (geconverteerd naar WebP) in de ticker. Wil Calvin tekst, plaatjes, of een mix?

### 3. Form-submission backend
Cloudflare Pages Functions, Formspree, een Astro action — wat is de voorkeur?

---

## Decisions Log

> Korte why's bij architectuurkeuzes — zodat een nieuwe chat geen rondjes hoeft te lopen.

| Date | Decision | Why |
|---|---|---|
| 2026-05-05 | Geen Tailwind | Aangevraagd in handover; comic design wint bij directe CSS-controle. |
| 2026-05-05 | `output: 'static'` | Site is marketing/SEO; deploy naar Cloudflare Pages = pure static = snelst. Adapter pas als we SSR nodig hebben. |
| 2026-05-05 | Eén `global.css` ipv per-component scoped CSS | Easier voor designer-tweaks (Find & Replace, hele site overzien). Per-component `<style>` alleen waar Astro `<Image>` overrides nodig zijn. |
| 2026-05-05 | Content Collections vanaf dag 1 | Toevoegen van een case = één `.md` neerzetten, geen code aanraken. Schaal-vriendelijk. |
| 2026-05-05 | `src/assets/` ipv `public/` voor afbeeldingen | Astro's `<Image>` doet dan responsive WebP/AVIF + lazy load. `public/` slaat dat over. |
| 2026-05-05 | Sharp script eenmalig draaien, output committen | Builds blijven snel; geen reden om elke build alle PNGs te reconverten. Re-run alleen als bron-images veranderen. |
| 2026-05-05 | Lab via `/lab/v[N].astro` met gedeeld `Homepage.astro` | Variants delen alle componenten; alleen tokens / props / sectievolgorde mag overschrijven. Geen wegwerpcode. |
| 2026-05-05 | `data-theme="vN"` op `<body>` voor variant-tokens | Pure CSS-cascade, geen JS, werkt in static build. |
| 2026-05-05 | `_reference/` blijft staan als read-only bron | Originele HTML + raw images blijven traceerbaar; pipeline kan opnieuw draaien als bron verandert. |
| 2026-05-05 | Twee-laagse token-architectuur | Calvin merkte op dat `btn-teal` liegt zodra we kleuren swappen. Components praten nu alleen met semantische tokens (`--accent-primary`); palette zit in een aparte laag. Palette-swap = enkele regels editen, niets breekt. |
| 2026-05-05 | Palet-swap (teal-dominant + navy + cool bone) | Calvin vond de standaard te rozig + geel te schreeuwerig. Teal = brand, magenta = sporadische pop, mint cyan = bright highlight, navy ipv pure black voor surfaces, cool bone ipv warm cream. |
| 2026-05-05 | Borders blijven puur zwart | Comic-lijn werkt het beste met pure `#000` — navy borders zouden de signature wegmilden. |
| 2026-05-05 | PaletteSwitcher alleen in dev | `import.meta.env.DEV` check rond de aside + script — niet in productie build. Lokale persistence via `localStorage['froseo-theme']`. |
| 2026-05-05 | `data-theme` op `<html>` (niet `<body>`) | Zo kan een inline script in `<head>` de theme zetten vóór body rendert → geen flash van wrong theme. |
| 2026-05-05 | Color-mix in CSS voor adaptieve nav-bg + dot pattern | Houdt deze waarden synchroon met whatever theme actief is, zonder per-theme overrides nodig. Browser support 90%+ sinds 2023. |
| 2026-05-05 | Sectioned tokens (per-element) bovenop semantic accents | Calvin wil bv. btn = teal maar brand = purple in zelfde theme. Een tweede laag semantische tokens (`--action-bg`, `--cases-strip-bg`, `--hero-accent-color`) per element maakt dit mogelijk zonder accent-systeem op te blazen. Components blijven dom — themes regelen de afwijkingen. |
| 2026-05-05 | Logo via `filter: brightness(0)` op witte PNG | Calvin heeft alleen wit logo. Filter geeft pure-zwart op cream/sand bg zonder extra asset. Werkt op alle huidige themes (allemaal lichte page-bg). Voor donkere page-bg in toekomst: filter conditional maken. |

---

## Bekende Issues / Tech Debt

- **Club 12 case** heeft geen eigen images (bron-map was leeg). Marked `published: false`. Echte assets aanleveren in `_reference/cases/Club12/` en `npm run assets` opnieuw draaien.
- **Sitemap** sluit nu `/lab/` niet uit. Filter toevoegen aan `astro.config.mjs` voor productie.
- **Form** in CTA submit nergens naartoe — placeholder. Backend nog te beslissen.
- **Reviews-avatars in hero** zijn lege gekleurde cirkels (no-op styling). Originele HTML gebruikte Unsplash photos; echte foto's of weglaten.
- **Testimonial avatar** idem — placeholder cirkel, geen image.
- **Astro 6 release** is uit; we draaien op 5.18.1. Upgrade pas als er reden is.

---

## Hoe je deze log bijhoudt

Aan het einde van een werksessie:
1. Verplaats afgeronde items van `Next Up` of `In Progress` naar `Done` met datum + initialen.
2. Werk `Status` boven aan bij.
3. Voeg nieuwe vragen toe aan `Open Questions`.
4. Voor elke architectuur-keuze: één regel in `Decisions Log` met Why.
5. Bekende workarounds → `Known Issues / Tech Debt`.
