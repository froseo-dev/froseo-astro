/**
 * Website-abonnement pakketten: single source of truth voor
 * /website-abonnement. Twee tiers: Online Start (instap) en Online Plus.
 *
 * Eén vaste maandprijs per pakket (geen jaar/maand-toggle meer). Bij beide
 * tiers geldt: €199 setup fee bij maandcontract, geen setup fee bij
 * jaarcontract.
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
  /** Vaste maandprijs (excl. btw). */
  monthlyPrice: number;
  /** Setup fee bij maandcontract. 0 = geen setup fee. Bij jaarcontract
      vervalt deze altijd. */
  setupFeeMonthlyContract?: number;
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
    monthlyPrice: 69,
    setupFeeMonthlyContract: 199,
    forWhom: 'Voor MKB en ZZP die snel een sterke website willen',
    features: [
      { label: 'Website op het Froseo-framework, vormgegeven naar jouw huisstijl' },
      { label: 'Tot 10 vaste pagina\'s' },
      { label: 'Hosting, e-mail en SSL inbegrepen' },
      { label: 'Sterke SEO-basis' },
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
    tagline: 'Voor uitgebreidere websites.',
    monthlyPrice: 149,
    setupFeeMonthlyContract: 199,
    isFeatured: true,
    forWhom: 'Voor MKB dat structureel doorpakt met online',
    features: [
      { label: 'Alles uit Online Start', highlight: true },
      { label: 'Tot 25 vaste pagina\'s' },
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
  'Prijzen excl. btw',
  'Geen setup fee bij jaarcontract',
  'Maandcontract maandelijks opzegbaar',
];
