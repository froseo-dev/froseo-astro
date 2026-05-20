/**
 * SEO Content abonnement-pakketten — single source of truth voor
 * /content-abonnement. Wijzig hier en de pagina volgt automatisch.
 *
 * Verschilt van maintenance-packages: maandprijs only (geen jaartoggle),
 * derde pakket is "Op aanvraag" zonder vast bedrag.
 */

export interface ContentPackageFeature {
  /** Label op de feature-list. */
  label: string;
  /** True wanneer dit een hoofd-USP is (krijgt highlight). */
  highlight?: boolean;
}

export interface ContentPackage {
  slug: string;
  name: string;
  shortName?: string;
  tagline: string;
  /** Maandprijs als getal. `null` betekent "Op aanvraag" (custom-tier). */
  monthlyPrice: number | null;
  /** Label dat de prijs vervangt wanneer monthlyPrice null is. */
  customPriceLabel?: string;
  /** True voor het featured-pakket (visueel highlighted, "Meest gekozen"). */
  isFeatured?: boolean;
  /** Korte "voor wie" onder de prijs. */
  forWhom: string;
  /** Lijst features die op de card verschijnen. */
  features: ContentPackageFeature[];
  /** Link voor de card-CTA. */
  ctaHref: string;
  /** Optionele override voor de CTA-label. Default "Kies <shortName>". */
  ctaLabel?: string;
}

export const contentPackages: ContentPackage[] = [
  {
    slug: 'content-start',
    name: 'Content Start',
    tagline: 'Structureel beginnen met SEO content.',
    monthlyPrice: 599,
    forWhom: 'Voor bedrijven die net beginnen met contentmarketing',
    features: [
      { label: '2 SEO-artikelen of landingspagina\'s per maand' },
      { label: 'Zoekwoordonderzoek' },
      { label: 'On-page SEO bij elk artikel' },
      { label: 'Maandelijkse update met rankings' },
      { label: 'Maandelijks opzegbaar' },
    ],
    ctaHref: '/contact/?onderwerp=content-start',
  },
  {
    slug: 'content-boost',
    name: 'Content Boost',
    shortName: 'Content Boost',
    tagline: 'Serieus groeien in Google.',
    monthlyPrice: 1199,
    isFeatured: true,
    forWhom: 'Voor groeiende bedrijven met SEO-ambitie',
    features: [
      { label: '5 SEO-artikelen of landingspagina\'s per maand' },
      { label: 'Uitgebreid zoekwoordonderzoek en contentplanning' },
      { label: 'On-page SEO en interne linking', highlight: true },
      { label: 'Maandelijkse update met rankings' },
      { label: 'Voorrang bij vragen en bijstellingen' },
      { label: 'Maandelijks opzegbaar' },
    ],
    ctaHref: '/contact/?onderwerp=content-boost',
  },
  {
    slug: 'content-custom',
    name: 'Content Custom',
    shortName: 'Custom',
    tagline: 'Domineren in je markt.',
    monthlyPrice: null,
    customPriceLabel: 'Op aanvraag',
    forWhom: 'Voor bedrijven met zes of meer artikelen per maand',
    features: [
      { label: '6+ SEO-artikelen of landingspagina\'s per maand' },
      { label: 'AIO-content voor ChatGPT, Perplexity en Google AI Overviews', highlight: true },
      { label: 'Silostructuur en autoriteitsopbouw' },
      { label: 'Wekelijks contentoverleg en strategiesessie' },
      { label: 'Uitgebreide maand- en kwartaalupdate' },
      { label: 'Per maand opzegbaar, proefperiode bespreekbaar' },
    ],
    ctaHref: '/contact/?onderwerp=content-custom',
    ctaLabel: 'Vraag offerte aan',
  },
];
