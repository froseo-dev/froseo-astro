import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      client: z.string(),
      tagline: z.string(),
      /** Longer 2-3 sentence body shown on the case card. Falls back to tagline if missing. */
      description: z.string().optional(),
      type: z.string(),
      tags: z.array(
        z.object({
          label: z.string(),
          /** Semantic color role — maps to .case-tag.{role} in global.css */
          color: z.enum(['primary', 'rare', 'highlight', 'light']).default('light'),
        }),
      ),
      result: z.string(),
      /** Up to 2 stat boxes shown on the case card body. If omitted, only `result` is used. */
      metrics: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        )
        .max(2)
        .optional(),
      /** Alternatief voor `metrics` op pure-webdesign cases zonder analytics-cijfers.
          Korte tag-strings (max 3 woorden per stuk), gerenderd als tag-row i.p.v.
          stat-cards. Bv. ['Volledige rebrand', 'WooCommerce', '4 weken oplevering'].
          Wanneer zowel metrics als highlights gezet zijn, wint metrics. */
      highlights: z.array(z.string()).max(3).optional(),
      hero: image(),
      /** 'mockup' = beeld heeft eigen frame/shadow ingebakken (zoals onze
          screenshot-mockups). Template verwijdert dan de standaard border,
          background en box-shadow zodat het beeld niet "in een lijst staat
          in een lijst". 'framed' (default) = klassieke case-foto met border
          en accent-shadow. */
      heroStyle: z.enum(['framed', 'mockup']).default('framed'),
      /** Sfeerafbeelding van de klant (gym, atelier, werk-on-locatie, etc).
          Gebruikt op de homepage cases-row als alternatief voor de mockup,
          en als secondary visual op de case-pagina. Optioneel — fallback
          is gallery[0] of hero. */
      atmosphereImage: image().optional(),
      atmosphereAlt: z.string().optional(),
      gallery: z.array(image()).optional(),
      logo: image().optional(),
      /** Branche van de klant — bv. "Renovatiebedrijf", "Personal training". Toont in meta-rij. */
      industry: z.string().optional(),
      /** Plaats/regio — bv. "Utrecht", "Amersfoort". Toont in meta-rij + lokale SEO-signaal. */
      location: z.string().optional(),
      /** Live website URL — opent in nieuwe tab vanuit case-pagina. */
      liveUrl: z.string().url().optional(),
      /** Slugs uit services collection die in dit project zijn ingezet. Gebruikt voor "Diensten ingezet" en filtering. */
      services: z.array(z.string()).optional(),
      /** Klant-quote — optioneel. Hergebruikt het Testimonial-blok-design. */
      quote: z.string().optional(),
      quoteName: z.string().optional(),
      quoteRole: z.string().optional(),
      quoteAvatar: image().optional(),
      /** Optionele Before/After-slider sectie op de case-pagina. Toont een
          interactieve slider tussen twee versies van de site (rebuild, opfris,
          etc.). Wordt onder de story-sectie gerenderd. */
      beforeAfter: z
        .object({
          before: image(),
          after: image(),
          beforeAlt: z.string(),
          afterAlt: z.string(),
          eyebrow: z.string().optional(),
          title: z.string().optional(),
          body: z.string().optional(),
        })
        .optional(),
      order: z.number().default(0),
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) => z.object({
    slug: z.string(),
    title: z.string(),
    /** Korte categorie-naam voor filters / breadcrumbs / lijsten ("Webdesign",
        "Lokale SEO"). Falls back to title als ontbrekend. */
    shortTitle: z.string().optional(),
    /** Vol-uitgeschreven detail-page H1. Fallback naar `title` als ontbrekend.
        Bv. "Maatwerk websites in WordPress of Astro." voor de detail-pagina. */
    heroTitle: z.string().optional(),
    /** Optionele hero-image op de detail-pagina (mockup, illustratie). */
    heroImage: image().optional(),
    /** Alt-tekst voor de hero-image. Bevat liefst het hoofdkeyword. Falls back
        naar een generieke "<service> — Froseo" als ontbrekend. */
    heroAlt: z.string().optional(),
    /** SEO meta-title override. Default = "<shortTitle> | Froseo". Gebruik
        voor click-optimized titels met hoofdkeyword vooraan, ~55-60 chars. */
    metaTitle: z.string().optional(),
    /** SEO meta-description override. Default = `description`. */
    metaDescription: z.string().optional(),
    eyebrow: z.string(),
    description: z.string(),
    icon: z.string(),
    bullets: z.array(z.string()),
    /** Semantic shadow role — maps to .service-card.shadow-{role} in global.css */
    shadow: z.enum(['primary', 'rare', 'highlight', 'dark', 'teal']).default('dark'),
    order: z.number().default(0),
    featured: z.boolean().default(true),
    /** True = dienst heeft een eigen standalone page (src/pages/<slug>.astro).
        [slug].astro skipt dan deze entry zodat er geen route-conflict ontstaat.
        ServicesGrid en mega-menu kunnen 'm wel gewoon tonen. */
    external: z.boolean().default(false),

    /* === Velden voor service-detail pagina (/[slug]) ============= */

    /** Langere hero-lead (1-2 zinnen). Fallback naar `description`. */
    heroLead: z.string().optional(),
    /** Optionele h1-tagline (em-block onder de main h1). */
    heroAccent: z.string().optional(),
    /** Als gevuld: rendert USP-checks (homepage-stijl) i.p.v. heroLead. */
    heroChecks: z.array(z.string()).optional(),
    /** Trust-pill content voor de hero (eyebrow boven de h1). Andere
        rol dan `eyebrow` (category-label voor services-grid). Bewust
        kort en geloofwaardig — bv. "15+ JAAR ERVARING · 80+ MKB-PROJECTEN"
        of een service-specifiek concreet resultaat. Default = homepage-pill. */
    heroEyebrow: z.string().optional(),

    /** Wanneer true: `heroAccent` rendert op een nieuwe regel onder de
        titel (block-display) in plaats van inline kleur-split. Voor
        langere koppen waar titel + accent samen niet op één regel passen
        (bv. "Website onderhoud zonder kopzorgen."). */
    heroAccentBlock: z.boolean().default(false),

    /** Optionele override voor de hero-knop. Service-hero toont één CTA. */
    heroPrimaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
    /** @deprecated Service-hero toont nu één CTA. Veld blijft voor backwards-
        compatibiliteit maar wordt niet meer gerenderd. */
    heroSecondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),

    /** Stats-ribbon — 4 credibility-cijfers naast elkaar (60+ sites, 15+ jaar, etc). */
    statsRibbon: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),

    /** Inline CTA-band met eyebrow + title + body + 2 buttons. */
    ctaBand: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        body: z.string().optional(),
        primaryLabel: z.string(),
        primaryHref: z.string(),
        secondaryLabel: z.string().optional(),
        secondaryHref: z.string().optional(),
      })
      .optional(),
    /** Override voor de inline Calvin-note (foto + quote + CTA). Wanneer
        gezet rendert de Calvin-balk op de mid-page positie (tussen
        Comparison en Body) met deze copy, en wordt de default-positie
        na de Pillars overgeslagen. Voor service-specifieke prompts zoals
        "niet zeker welk pakket past?". */
    calvinNote: z
      .object({
        message: z.string(),
        ctaLabel: z.string().optional(),
        ctaHref: z.string().optional(),
      })
      .optional(),
    /** Section-overrides voor het propositionPaths-blok. Wanneer leeg gebruikt
        het template defaults (eyebrow "Kies je route", title "Maatwerk of
        abonnement"). Bij pakketten of een ander narratief: zet hier eigen copy. */
    proposalsEyebrow: z.string().optional(),
    proposalsTitle: z.string().optional(),
    proposalsLead: z.string().optional(),

    /** Wanneer true: rendert de PricingPackages-sectie (3 onderhouds-pakketten
        + custom-strip + maand/jaar toggle) met data uit
        src/data/maintenance-packages.ts. Voor /website-onderhoud en
        /wordpress-website-onderhoud. */
    showMaintenancePackages: z.boolean().default(false),

    /** Wanneer true: rendert de ContentPackages-sectie (3 content-pakketten
        zonder toggle, derde tier "Op aanvraag") met data uit
        src/data/content-packages.ts. Voor /content-abonnement. */
    showContentPackages: z.boolean().default(false),

    /** Wanneer true: rendert de AboPackages-sectie (2 website-abonnement
        cards: Online Start + Online Plus) met data uit
        src/data/abo-packages.ts. Voor /website-abonnement. */
    showAboPackages: z.boolean().default(false),

    /** Wanneer true: verberg de WebsitesShowcase-sectie. Voor pagina's waar
        portfolio-cases minder relevant zijn (zoals onderhoud). */
    hideShowcase: z.boolean().default(false),

    /** Positief "infrastructuur-blok" — donker centered tekstblok als
        alternatief voor pain-points. Voor pagina's waar je positief wil
        framen (bv. /website-abonnement) i.p.v. negatief. Optionele kleine
        CTA onderaan ("Klinkt als wat je zoekt? Bekijk pakketten ↑"). */
    infraBlock: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        titleAccent: z.string().optional(),
        body: z.array(z.string()),
        cta: z
          .object({
            prefix: z.string().optional(),
            label: z.string(),
            href: z.string(),
          })
          .optional(),
      })
      .optional(),

    /** Donker introblok (zelfde stijl als infraBlock) dat direct na de
        LogosTicker rendert. Voor een keyword-rijke intro hoog op de pagina. */
    introBlock: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        titleAccent: z.string().optional(),
        body: z.array(z.string()),
      })
      .optional(),

    /** Pain-points grid: visuele "wat gaat er fout zonder dit"-sectie. */
    painPointsTitle: z.string().optional(),
    painPointsTitleAccent: z.string().optional(),
    painPointsLead: z.string().optional(),

    /** Overrides voor de PricingPackages-section header. Laat leeg voor
        component-defaults ("Onze onderhoudspakketten."). */
    pricingEyebrow: z.string().optional(),
    pricingTitle: z.string().optional(),
    pricingTitleAccent: z.string().optional(),
    pricingLead: z.string().optional(),
    painPoints: z
      .array(
        z.object({
          icon: z.string().optional(),
          title: z.string(),
          body: z.string(),
          /** Optioneel concreet cijfer (bv. "40%" of "90%"). */
          stat: z.string().optional(),
        }),
      )
      .optional(),

    /** Met-vs-zonder comparison-tabel. */
    comparison: z
      .object({
        title: z.string(),
        titleAccent: z.string().optional(),
        withoutLabel: z.string(),
        withLabel: z.string(),
        items: z.array(
          z.object({
            without: z.string(),
            with: z.string(),
          }),
        ),
      })
      .optional(),

    /** Twee/drie "paden" om de dienst af te nemen — bv. maatwerk vs. abonnement,
        of een pakket-tier (Beheer/Groei/Pro). */
    propositionPaths: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          /** Korte sub-label, bv. 'Vanaf €89/m' of 'Op maat'. */
          tag: z.string().optional(),
          /** 3-5 checklist-items om de routes vergelijkbaar te maken. */
          checks: z.array(z.string()).optional(),
          /** Highlight als primaire/aanbevolen route. */
          isFeatured: z.boolean().default(false),
          /** Optioneel floating badge boven de card-titel ("Populair bij MKB"). */
          badge: z.string().optional(),
          /** Optionele per-card CTA. Wanneer ingevuld rendert de card een
              eigen knop onderaan; anders blijft alleen de body + checks. */
          cta: z
            .object({
              label: z.string(),
              href: z.string(),
            })
            .optional(),
          /** Kleine voet-tekst onder de checks, bv. prijs-disclaimer. */
          note: z.string().optional(),
        }),
      )
      .optional(),
    /** 3-4 stappen: "Hoe wij dit aanpakken" */
    approachSteps: z
      .array(z.object({ title: z.string(), body: z.string() }))
      .optional(),
    /** Render-stijl voor approachSteps. 'cards' = default (donker blok met
        2x2 grid). 'timeline' = horizontale tijdslijn (gestapeld op mobiel),
        renderd dan ook hoger op de pagina i.p.v. onderaan. */
    approachStyle: z.enum(['cards', 'timeline']).default('cards'),

    /** ID van een testimonial uit content/data/testimonials.json om
        tussen StatsRibbon en PainPoints te tonen. Voor proof-momenten
        op service-pagina's (bv. een onderhoud-klant quote). */
    testimonialId: z.string().optional(),
    /** 3-4 USPs / "Waarom Froseo" cards */
    usps: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    /** "Pijlers" / deep-dive accordion-secties. Voor SEO bv. technisch / content
        / autoriteit / GEO. Houdt de pagina scannable maar geeft depth + SEO-body. */
    pillars: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          /** Optionele "Lees meer" link per pijler (bv. naar verdiepende pagina). */
          link: z.object({ label: z.string(), href: z.string() }).optional(),
        }),
      )
      .optional(),
    /** Optionele section-title boven het pillars-accordion. Default als ontbrekend. */
    pillarsTitle: z.string().optional(),
    /** Optionele eyebrow boven het pillars-accordion. Default 'Onder de motorkap'. */
    pillarsEyebrow: z.string().optional(),
    /** Service-specifieke FAQ */
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    /** Showcase-config: eyebrow, title en optioneel een uitgelichte case
        (featured) bovenin. Als `featuredCaseSlug` gezet is, wordt die case
        groot getoond + de overige cases als kleinere rij eronder. */
    showcaseEyebrow: z.string().optional(),
    showcaseTitle: z.string().optional(),
    showcaseTitleAccent: z.string().optional(),
    showcaseFeatured: z
      .object({
        caseSlug: z.string(),
        headline: z.string().optional(),
      })
      .optional(),

    /** "Spotlight" cross-sell secties: 2-koloms tekst + image, met optionele
        link naar verdiepende pagina. Wisselen automatisch image-positie
        (left/right) op basis van index. */
    spotlights: z
      .array(
        z.object({
          eyebrow: z.string().optional(),
          title: z.string(),
          body: z.string(),
          image: image(),
          link: z.object({ label: z.string(), href: z.string() }).optional(),
        }),
      )
      .optional(),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/data/testimonials.json'),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    rating: z.number().min(1).max(5).default(5),
    avatar: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  loader: file('./src/content/data/faq.json'),
  schema: z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

/**
 * Kennisbank — blog/artikel-collection. Markdown body wordt in
 * /pages/kennisbank/[slug].astro gerenderd via render(entry).
 * Categories zijn vrij invoerbaar (string-array) zodat we niet vroeg
 * vastzitten aan een vaste taxonomie; pas een enum aan zodra het
 * stabiele set is.
 */
const kennisbank = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kennisbank' }),
  schema: ({ image }) =>
    z.object({
      /** URL-slug. Bv. 'website-optimaliseren'. */
      slug: z.string(),
      /** H1 + page-title. */
      title: z.string(),
      /** Korte beschrijving voor meta-description, OG-tag en list-card excerpt. */
      description: z.string(),
      /** Optionele eyebrow-tekst boven de h1 in de hero. */
      eyebrow: z.string().optional(),
      /** Publicatiedatum (ISO of date-object). Toont in hero + meta. */
      publishedDate: z.date(),
      /** Optioneel: laatste update. Wanneer ingevuld toont template
          "Geüpdatet op ..." naast de publicatiedatum. */
      updatedDate: z.date().optional(),
      /** Categorieën (vrij invoerbaar). Eerste categorie is hoofdcategorie
          voor filtering en related-articles. */
      categories: z.array(z.string()).min(1),
      /** Hero-afbeelding bovenaan het artikel. */
      heroImage: image(),
      heroAlt: z.string(),
      /** Auteur. Default Calvin Telkamp. */
      author: z.string().default('Calvin Telkamp'),
      /** Optionele excerpt voor de index-card. Wanneer leeg gebruikt
          de list-page de description. */
      excerpt: z.string().optional(),
      /** Featured-artikel verschijnt prominent bovenaan de index. */
      featured: z.boolean().default(false),
      /** Draft-status: als true wordt het artikel niet gerenderd. */
      draft: z.boolean().default(false),
      /** Optionele oude URL voor 301-redirect mapping (bv. '/website-optimaliseren'). */
      oldUrl: z.string().optional(),
      /** FAQ-block onderaan het artikel. Rendert als accordion, plus
          FAQPage JSON-LD voor Google rich-results. */
      faqs: z
        .array(z.object({ q: z.string(), a: z.string() }))
        .optional(),
    }),
});

/**
 * Portfolio — visuele showcase van projecten op /portfolio. Lichter dan
 * cases: geen verhaal, geen cijfers. Eén mock-up per item op de
 * overzichtspagina, lightbox opent met extra screenshots + optionele
 * notitie + optionele link naar een bijbehorende case (zelfde klant).
 *
 * Minimum-vereisten per item: client, mockup. Rest is optioneel zodat
 * we ook items kunnen plaatsen waar we (nog) weinig materiaal van hebben.
 */
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      client: z.string(),
      /** Branche van de klant — bv. "Personal trainer", "Smartshop". */
      industry: z.string().optional(),
      /** Jaar van oplevering (bv. 2024). Toont in lightbox-meta. */
      year: z.number().optional(),
      /** Korte rol-omschrijving, bv. "ontwerp + bouw", "alleen SEO", "rebrand". */
      role: z.string().optional(),
      /** Visuele tags voor in de meta-rij. Bv. ['Webdesign', 'WordPress', 'WooCommerce']. */
      tags: z.array(z.string()).optional(),
      /** Hero-mockup — vereist. Wordt als card op de portfolio-index getoond
          en als eerste shot in de lightbox. */
      mockup: image(),
      /** Extra shots voor in de lightbox (long-scroll screenshots, sfeerbeelden,
          detail-crops). Wanneer leeg toont de lightbox alleen de mockup groter. */
      gallery: z.array(image()).optional(),
      /** 1-2 zinnen notitie in de lightbox. Geen volledige case-tekst —
          alleen wat dit project interessant maakt. */
      note: z.string().optional(),
      /** Slug van een bijbehorende case (zelfde klant). Wanneer gezet
          toont de lightbox een "Bekijk de case ↗" knop naar /cases/[slug]. */
      caseSlug: z.string().optional(),
      /** Live website-URL. Niet zichtbaar op portfolio-card (we sturen niet
          naar buiten vanuit portfolio), wel intern bruikbaar / fallback. */
      liveUrl: z.string().url().optional(),
      order: z.number().default(0),
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
    }),
});

export const collections = { cases, services, testimonials, faq, kennisbank, portfolio };
