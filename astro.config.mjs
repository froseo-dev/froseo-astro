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
      /* Ads-landingspagina's uit de sitemap houden: ze staan op noindex
         en mogen niet met de organische onderhoudspagina's concurreren. */
      filter: (page) => !page.includes('/wordpress-onderhoud/'),
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
