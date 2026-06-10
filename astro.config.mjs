import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://froseo.nl',
  output: 'static',
  /* WordPress-style trailing slashes (Calvin's convention + huidige live
     site). 'always' = Astro genereert URLs met trailing slash, sitemap
     volgt automatisch. Combineert met build.format 'directory' zodat
     elke pagina als index.html in een eigen folder wordt gebouwd. */
  trailingSlash: 'always',
  integrations: [
    sitemap({
      /* Ads-landingspagina's en de Peter Zijlstra-demo uit de sitemap
         houden: die staan op noindex en horen niet in de organische index. */
      filter: (page) =>
        !page.includes('/wordpress-onderhoud/') &&
        !page.includes('/peter-zijlstra') &&
        !page.includes('/ruth-lasters'),
    }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  build: {
    /* Inline ALL CSS into the HTML so it never blocks first paint.
       Our total bundle is small enough that the trade-off is worth it. */
    inlineStylesheets: 'always',
    /* Directory-style output (foo/index.html ipv foo.html) — match met
       trailingSlash 'always' boven. */
    format: 'directory',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
