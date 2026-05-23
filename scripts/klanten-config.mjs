/**
 * Centrale config voor alle case- en portfolio-klanten.
 *
 * Bucket types:
 *   - 'case+portfolio': volle case-page + entry in portfolio. Mockup wordt
 *     gegenereerd. 4 page-screenshots voor de lightbox gallery.
 *   - 'case-only':      alleen case-page. Geen mockup (heeft niet altijd zin,
 *     bv. SEO-cases). 4 page-screenshots voor lightbox.
 *   - 'portfolio-only': alleen portfolio-entry. Mockup + 4 page-screenshots
 *     voor portfolio lightbox.
 *   - 'logo-only':      alleen logo in de logos-ticker. Geen case/portfolio.
 *
 * `pages`: paths (zonder origin) waar gallery-screenshots gemaakt worden.
 *   Index 0 is altijd de homepage. Auto-detect overschrijft bij leeg array.
 */

export const klanten = [
  {
    slug: 'renovatie-totaal',
    client: 'Renovatie Totaal',
    url: 'https://renovatie-totaal.nl',
    bucket: 'case+portfolio',
    pages: ['/', '/projecten/', '/over-ons/', '/dakisolatie/'],
  },
  {
    slug: 'studio-contenido',
    client: 'Studio Contenido',
    url: 'https://studiocontenido.nl',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'peaktime-personal-training',
    client: 'Peak Time Personal Training',
    url: 'https://peaktimepersonaltraining.nl',
    bucket: 'case-only',
    pages: [],
  },
  {
    slug: 'independent-artists-agency',
    client: 'Independent Artists Agency',
    url: 'https://www.independent-artistsagency.com',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'millstreet',
    client: 'Millstreet',
    url: 'https://www.millstreetband.nl',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'studio-max',
    client: 'Studio Max Dance',
    url: 'https://studiomaxdance.nl',
    bucket: 'case-only',
    pages: [],
  },
  {
    slug: 'theo-mackaay',
    client: 'Theo Mackaay',
    url: 'https://www.theomackaay.com',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'rex-agency',
    client: 'Rex The Agency',
    url: 'https://rextheagency.com',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'club12',
    client: 'Club 12',
    url: 'https://www.club12.nl',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'steunder',
    client: 'Steunder',
    url: 'https://steunder.com',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'balderstone',
    client: 'Balderstone',
    url: 'https://balderstone.nl',
    bucket: 'portfolio-only',
    pages: [],
  },
  {
    slug: 'dakdekkersbedrijf-dkh-ede',
    client: 'Dakdekkersbedrijf DKH Ede',
    url: 'https://www.dakdekkersbedrijfede.nl',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'top-dakdekker-zeist',
    client: 'Top Dakdekker Zeist',
    url: 'https://www.dakdekkerszeist.nl',
    bucket: 'case-only',
    pages: [],
  },
  {
    slug: 'skullycare',
    client: 'Skullycare',
    url: 'https://www.skullycare.com',
    bucket: 'portfolio-only',
    pages: [],
  },
  {
    slug: 'brunschwig',
    client: 'Brunschwig',
    url: 'https://brunschwig.nl',
    bucket: 'portfolio-only',
    pages: [],
  },
  {
    slug: 'kroostwijk',
    client: 'Kroostwijk',
    url: 'https://www.kroostwijk.com',
    bucket: 'portfolio-only',
    pages: [],
  },
  {
    slug: 'magic-truffels',
    client: 'Magic Truffels',
    url: 'https://www.magictruffels.shop',
    bucket: 'portfolio-only',
    pages: [],
  },
  {
    slug: 'tatanka',
    client: 'Tatanka',
    url: 'https://www.tatanka.nl',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'equipe-acteurs',
    client: 'Equipe Acteurs',
    url: 'https://www.equipeacteurs.nl',
    bucket: 'portfolio-only',
    pages: [],
  },
  {
    slug: 'prime-performance',
    client: 'Prime Performance',
    url: 'https://primeperformance.nl',
    bucket: 'case+portfolio',
    pages: [],
  },
  {
    slug: 'act-inc',
    client: 'ACT Inc',
    url: 'https://www.actinc.nl',
    bucket: 'logo-only',
  },
  {
    slug: 'wedadak',
    client: 'Wedadak',
    url: 'https://wedadak.nl',
    bucket: 'logo-only',
  },
];
