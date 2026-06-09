/**
 * Site-wide constants. Importeer hieruit in plaats van hardcoded waarden
 * te gebruiken in components, pages of content-files. Een prijswijziging
 * raakt zo één bestand in plaats van een dozijn pagina's.
 *
 * Gebruik:
 *   import { pricing } from '@data/site-config';
 *   <p>Vanaf {pricing.abboFromAmount} per maand</p>
 */

export const pricing = {
  /** Instapprijs Online Start, een vaste maandprijs (geen jaarkorting meer).
      Bij maandcontract komt er een setup fee van €199 bij; bij jaarcontract
      vervalt die. Communiceren we overal als de "vanaf"-prijs. */
  abboFromAmount: '€69',
  /** Periode-suffix, gebruik los van het bedrag voor flexibele typografie. */
  abboFromUnit: 'maand',
  /** Combinatie voor inline-tekst, bv. "Vanaf €69 per maand". */
  abboFromInline: '€69 per maand',
  /** Korte variant voor pills / labels, bv. "vanaf €69/m". */
  abboFromShort: '€69/m',
  /** Backwards-compat aliassen: er is nu één maandprijs, geen jaar/maand-
      split meer. Beide tokens verwijzen naar dezelfde €69. */
  abboMonthlyAmount: '€69',
  abboMonthlyShort: '€69/m',
  /** "Vanaf"-prijs Online Plus, vaste maandprijs. Spiegelt
      abo-packages.ts (online-plus.monthlyPrice). */
  abboPlusFromAmount: '€149',
  abboPlusInline: '€149 per maand',
  /** Setup fee bij maandcontract op Online Start. Vervalt bij jaarcontract. */
  abboStartSetupFee: '€199',
  /** B2B-context: prijzen excl. btw. Eenmalig melden op pricing-cards
      is voldoende; niet bij elke hero-mention noemen. */
  vatNote: 'excl. btw',
} as const;

export const contact = {
  email: 'info@froseo.nl',
  phoneDisplay: '030 237 8053',
  phoneTel: '+31302378053',
  /** WhatsApp-nummer in internationaal format (zonder + of spaties) voor wa.me link.
      Vervang met je eigen Business-nummer als 030 niet op WhatsApp staat. */
  whatsappNumber: '31302378053',
  /** Optionele preset-tekst die in WhatsApp opent. */
  whatsappMessage: 'Hi Froseo, ik wil graag iets bespreken over',
  address: {
    street: 'Leidseveer 10',
    postalCode: '3511 SB',
    city: 'Utrecht',
    country: 'NL',
  },
  /** Vul KvK + BTW pas in als je 100% zeker bent — staat publiek op de site. */
  kvk: '62777335',
  btw: 'NL000000000B00',
  /** Beschikbaarheid voor antwoorden + booking. */
  hours: 'Ma–vr 09:00–17:00',
  /** Hoe snel we reageren. Realistisch houden om verwachtingen te managen. */
  responseTime: 'Meestal binnen één werkdag',
  /** Google Maps embed-URL. Legacy q-based iframe-route die zoekt naar
      het Froseo-place op Google Maps en de Business Profile-pin toont
      (i.p.v. alleen coordinates). Werkt zonder API key, blijft stabiel.
      Vervang door een specifieke pb-embed via "Maps → Delen → Insluiten"
      als je een exacte zoom of weergave wil pinnen. */
  mapEmbed: 'https://maps.google.com/maps?q=Froseo+Utrecht&t=&z=16&ie=UTF8&iwloc=B&output=embed',
  /** Externe link naar Google Maps voor "open in Maps"-knoppen. */
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Froseo+Utrecht',
} as const;

/**
 * Sociale profielen + externe vermeldingen. `linkedin` is de primaire
 * follow-knop in de footer; alle URLs (inclusief LinkedIn) gaan in de
 * sameAs JSON-LD voor entity-disambiguation in Google's knowledge graph.
 */
export const social = {
  /** Primaire follow-profiel in footer. */
  linkedin: 'https://www.linkedin.com/company/froseonl/',
  /** Alle externe profielen + vermeldingen voor sameAs schema. */
  sameAs: [
    'https://www.facebook.com/froseomarketing',
    'https://www.instagram.com/froseo_nl/',
    'https://www.linkedin.com/company/froseonl/',
    'https://x.com/froseonl/',
    'https://nl.pinterest.com/froseonl/',
    'https://g.page/r/CceXrOcPQRjgEBM/',
    'https://www.sortlist.nl/agency/froseo-digitale-partner-voor-mkb',
    'https://www.cylex.nl/bedrijf/froseo---bureau-voor-webdesign---seo-uit-utrecht-13636339.html',
    'https://www.nederlandinbedrijf.nl/Bedrijf/973692/Online-marketing-Froseo/Leidseveer-10-3511SB-Utrecht-0302378053',
  ],
} as const;

/**
 * Calendly inline embed. Vul `url` in zodra je een Calendly-account hebt
 * (bv. 'https://calendly.com/froseo/kennismaking'). Als `null`, toont de
 * /contact pagina een fallback-CTA in plaats van de embed.
 */
export const calendly = {
  url: null as string | null,
} as const;

export const review = {
  rating: '5',
  ratingDisplay: '5/5',
  count: '14',
} as const;

/**
 * Site-brede credibility-cijfers. Worden gebruikt in homepage Stats én op
 * andere pagina's (projecten-overview, service-pagina's). Pas hier aan
 * en alle plekken volgen mee.
 */
export const stats = [
  { value: '80+',  label: 'Projecten live' },
  { value: '25+',  label: 'Plaatsen #1 op Google' },
  { value: '15+',  label: 'Jaar ervaring' },
  { value: '5/5',  label: 'Google reviews' },
] as const;

/**
 * Token-interpolatie voor strings uit markdown frontmatter (waar je geen
 * TypeScript kunt importeren). Schrijf in je .md:
 *   tag: 'Vanaf {{abboFromInline}}'
 * En render in je template:
 *   {interpolate(tag)}
 *
 * Bekende tokens komen 1-op-1 uit `pricing` + `contact` + `review`.
 * Onbekende tokens blijven onveranderd staan (zichtbaar in output zodat
 * je 'm meteen ziet en kan fixen).
 */
const tokens: Record<string, string> = {
  abboFromAmount: pricing.abboFromAmount,
  abboFromInline: pricing.abboFromInline,
  abboFromShort: pricing.abboFromShort,
  abboPlusFromAmount: pricing.abboPlusFromAmount,
  abboPlusInline: pricing.abboPlusInline,
  abboStartSetupFee: pricing.abboStartSetupFee,
  vatNote: pricing.vatNote,
  email: contact.email,
  phoneDisplay: contact.phoneDisplay,
  reviewRating: review.ratingDisplay,
  reviewCount: review.count,
};

export function interpolate(s: string | undefined): string {
  if (!s) return '';
  return s.replace(/\{\{(\w+)\}\}/g, (full, key) => tokens[key] ?? full);
}
