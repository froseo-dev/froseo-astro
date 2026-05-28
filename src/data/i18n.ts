/**
 * Centrale NL↔EN route-map. Eén bron voor hreflang (BaseLayout) en de
 * taalwissel in de nav/footer. Een tweetalige pagina toevoegen = één regel
 * hieronder erbij; hreflang + switch volgen automatisch.
 *
 * We gebruiken bewust NIET de Astro-`i18n`-config: die loont alleen bij
 * gedeelde page-templates die via vertaalbestanden renderen. Onze EN-pagina's
 * zijn bespoke marketing-copy, dus folder-routing (`src/pages/en/`) + deze map
 * is simpeler en raakt de bestaande NL-routing niet.
 *
 * Paden inclusief trailing slash — matcht `trailingSlash: 'always'`, zodat
 * `Astro.url.pathname` ('/', '/over-ons/', '/en/') 1-op-1 hierop aansluit.
 */

export type Lang = 'nl' | 'en';

export interface LocalePair {
  nl: string;
  en: string;
}

export const localePairs: readonly LocalePair[] = [
  { nl: '/', en: '/en/' },
  { nl: '/over-ons/', en: '/en/about/' },
  { nl: '/contact/', en: '/en/contact/' },
  { nl: '/portfolio/', en: '/en/portfolio/' },
] as const;

/** Normaliseer naar een pad mét trailing slash zodat lookups consistent zijn. */
function normalize(pathname: string): string {
  if (!pathname) return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/**
 * Het hreflang-paar voor een pad (NL óf EN), of `null` als de pagina eentalig
 * is. BaseLayout rendert alleen alternate-tags wanneer hier een paar uitkomt.
 */
export function getAlternates(pathname: string): LocalePair | null {
  const path = normalize(pathname);
  return localePairs.find((p) => p.nl === path || p.en === path) ?? null;
}

/**
 * Doel voor de taalwissel. Heeft de huidige pagina een tegenhanger, dan die;
 * anders de homepage van de andere taal (vanaf een NL-only pagina → /en/,
 * vanaf een EN-pagina → /).
 */
export function getSwitchHref(pathname: string, lang: Lang): string {
  const pair = getAlternates(pathname);
  if (pair) return lang === 'nl' ? pair.en : pair.nl;
  return lang === 'nl' ? '/en/' : '/';
}
