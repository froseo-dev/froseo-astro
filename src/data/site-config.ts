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
  /** Instapprijs van het website-abonnement, los formattedstring. */
  abboFromAmount: '€99',
  /** Periode-suffix, gebruik los van het bedrag voor flexibele typografie. */
  abboFromUnit: 'maand',
  /** Combinatie voor inline-tekst, bv. "Vanaf €99 per maand". */
  abboFromInline: '€99 per maand',
  /** Korte variant voor pills / labels, bv. "vanaf €99/m". */
  abboFromShort: '€99/m',
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
  /** Google Maps embed-src (uit "Maps → Delen → Insluiten" → kopieer iframe-src). */
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2452.0!2d5.1099!3d52.0907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDA1JzI2LjUiTiA1wrAwNicyMy42IkU!5e0!3m2!1snl!2snl!4v0!5m2!1snl!2snl',
} as const;

export const social = {
  instagram: 'https://www.instagram.com/froseo',
  linkedin: 'https://www.linkedin.com/company/froseo',
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
  count: '13',
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
  email: contact.email,
  phoneDisplay: contact.phoneDisplay,
  reviewRating: review.ratingDisplay,
  reviewCount: review.count,
};

export function interpolate(s: string | undefined): string {
  if (!s) return '';
  return s.replace(/\{\{(\w+)\}\}/g, (full, key) => tokens[key] ?? full);
}
