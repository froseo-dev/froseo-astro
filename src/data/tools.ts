/**
 * Single source of truth voor onze 4 gratis tools.
 * Wordt gebruikt door /tools/ (index), elke detail-pagina (cross-link
 * naar de andere drie) en kennisbank-artikelen die naar een tool linken.
 *
 * Slug = URL-segment onder /tools/ en bepaalt het pad.
 */

export interface ToolMeta {
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  /** Korte tagline op de index-card en in cross-links. */
  tagline: string;
  /** Eyebrow-tag op de card (bijv. "SEO", "Copy", "Marketing"). */
  category: string;
}

export const tools: ToolMeta[] = [
  {
    slug: 'tekens-tellen',
    href: '/tools/tekens-tellen/',
    title: 'Tekens tellen',
    shortTitle: 'Tekenteller',
    tagline:
      'Realtime teller voor karakters, woorden en woordfrequentie. Handig voor meta-titles, descriptions en social posts.',
    category: 'Copy',
  },
  {
    slug: 'woorden-tellen',
    href: '/tools/woorden-tellen/',
    title: 'Woorden tellen',
    shortTitle: 'Woordenteller',
    tagline:
      'Tel woorden en karakters terwijl je typt. Ideaal voor blogs, essays en teksten met een limiet.',
    category: 'Copy',
  },
  {
    slug: 'keyword-density-checker',
    href: '/tools/keyword-density-checker/',
    title: 'Keyword density checker',
    shortTitle: 'Density checker',
    tagline:
      'Controleer zoekwoorddichtheid en kies tussen losse woorden of 2 tot 4 woordcombinaties. Highlight je eigen keywords.',
    category: 'SEO',
  },
  {
    slug: 'ctr-berekenen-calculator',
    href: '/tools/ctr-berekenen-calculator/',
    title: 'CTR berekenen',
    shortTitle: 'CTR-calculator',
    tagline:
      'Bereken click through rate, klikken of vertoningen. Vul twee in, de derde rollt eruit.',
    category: 'Marketing',
  },
];

export function getOtherTools(currentSlug: string): ToolMeta[] {
  return tools.filter((t) => t.slug !== currentSlug);
}
