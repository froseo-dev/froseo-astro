/**
 * Cloudflare Pages middleware — voegt X-Robots-Tag: noindex toe wanneer
 * de hostname een Cloudflare-preview is (*.pages.dev). Voorkomt dat
 * onze preview-deployment door zoekmachines wordt opgepakt, terwijl
 * Screaming Frog en andere crawlers wel gewoon kunnen lopen.
 *
 * Op het productie-domein (froseo.nl) blijft alles ongemoeid — geen
 * noindex header, normale indexering toegestaan.
 */

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  /* Skip non-HTML responses (assets, _redirects, etc.) — die hoeven
     geen robots-header, scheelt overhead. */
  const ct = response.headers.get('content-type') ?? '';
  if (!ct.includes('text/html')) return response;

  const host = new URL(context.request.url).hostname;
  const isPreview = host.endsWith('.pages.dev');

  if (isPreview) {
    /* Clone-and-mutate is veilig — Response objects van static-pages
       hebben soms immutable headers, dus wrap in een nieuwe Response. */
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return newResponse;
  }

  return response;
};
