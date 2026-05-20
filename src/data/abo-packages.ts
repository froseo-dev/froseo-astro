/**
 * Website-abonnement pakketten: single source of truth voor
 * /website-abonnement. Twee tiers: Online Start (instap) en Online Plus.
 *
 * Verschilt van maintenance-packages: 2 tiers (geen Custom-strip), zelfde
 * maand/jaar-toggle. Jaar is ~10% korting t.o.v. maandprijs (€89 vs €99,
 * €179 vs €199), afgerond op hele euro's voor schone weergave.
 *
 * Pakket-features kunnen `highlight: true` (extra accent) of `upcoming: true`
 * (gerenderd met "Binnenkort"-tag, grijzer) krijgen.
 */

export interface AboPackageFeature {
  label: string;
  highlight?: boolean;
  upcoming?: boolean;
}

export interface AboPackage {
  slug: 'online-start' | 'online-plus';
  name: string;
  shortName?: string;
  tagline: string;
  /** Maandprijs bij maandelijkse facturatie. */
  monthlyPrice: number;
  /** Maandprijs-equivalent bij jaarlijkse facturatie (afgerond). */
  yearlyMonthlyPrice: number;
  /** Totale jaarprijs = yearlyMonthlyPrice × 12. */
  yearlyTotal: number;
  isFeatured?: boolean;
  forWhom: string;
  features: AboPackageFeature[];
}

export const aboPackages: AboPackage[] = [
  {
    slug: 'online-start',
    name: 'Online Start',
    shortName: 'Online Start',
    tagline: 'Professioneel online voor één vast bedrag.',
    monthlyPrice: 99,
    yearlyMonthlyPrice: 89,
    yearlyTotal: 89 * 12,
    forWhom: 'Voor MKB en ZZP die snel een sterke website willen',
    features: [
      { label: 'Website op het Froseo-framework, vormgegeven naar jouw huisstijl' },
      { label: 'Tot 10 vaste pagina\'s' },
      { label: 'Blogmodule inbegrepen, onbeperkt artikelen' },
      { label: 'Hosting, e-mail en SSL inbegrepen' },
      { label: 'Technische SEO-basis (schema, sitemap, meta)' },
      { label: 'Razendsnel: we streven naar 90+ Google PageSpeed', highlight: true },
      { label: 'Google Reviews-blok en contactformulier' },
      { label: 'Analytics en Search Console ingericht' },
      { label: 'Maandelijkse positierapportage (5 zoekwoorden)' },
      { label: '30 minuten wijzigingen per maand', highlight: true },
      { label: 'Jaarlijks een refresh van het design' },
    ],
  },
  {
    slug: 'online-plus',
    name: 'Online Plus',
    shortName: 'Online Plus',
    tagline: 'Voor groeiende bedrijven met meer ambitie.',
    monthlyPrice: 199,
    yearlyMonthlyPrice: 179,
    yearlyTotal: 179 * 12,
    isFeatured: true,
    forWhom: 'Voor MKB dat structureel doorpakt met online',
    features: [
      { label: 'Alles uit Online Start', highlight: true },
      { label: 'Tot 25 vaste pagina\'s' },
      { label: 'Blogmodule inbegrepen, onbeperkt artikelen' },
      { label: 'Maandelijkse positierapportage (25 zoekwoorden)' },
      { label: 'Doorlopende verbeteringen aan het framework krijg je automatisch mee' },
      { label: '2 uur wijzigingen per maand', highlight: true },
      { label: 'Voorrang op support' },
      { label: 'AI-chatassistent', upcoming: true },
    ],
  },
];

/**
 * Algemene voorwaarden onder de pakketten, geldig voor beide tiers.
 * Wordt door AboPackages.astro als rij onder de cards gerenderd.
 */
export const aboTerms = [
  'Geen setup fee',
  'Minimaal 3 maanden, daarna maandelijks opzegbaar',
];
