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
      hero: image(),
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
    eyebrow: z.string(),
    description: z.string(),
    icon: z.string(),
    bullets: z.array(z.string()),
    /** Semantic shadow role — maps to .service-card.shadow-{role} in global.css */
    shadow: z.enum(['primary', 'rare', 'highlight', 'dark', 'teal']).default('dark'),
    order: z.number().default(0),
    featured: z.boolean().default(true),

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

    /** Wanneer true: verberg de WebsitesShowcase-sectie. Voor pagina's waar
        portfolio-cases minder relevant zijn (zoals onderhoud). */
    hideShowcase: z.boolean().default(false),

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
          /** Korte sub-label, bv. 'Vanaf €99/m' of 'Op maat'. */
          tag: z.string().optional(),
          /** 3-5 checklist-items om de routes vergelijkbaar te maken. */
          checks: z.array(z.string()).optional(),
          /** Highlight als primaire/aanbevolen route. */
          isFeatured: z.boolean().default(false),
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

export const collections = { cases, services, testimonials, faq };
