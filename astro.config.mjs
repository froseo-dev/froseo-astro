import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://froseo.nl',
  output: 'static',
  integrations: [sitemap()],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  build: {
    /* Inline ALL CSS into the HTML so it never blocks first paint.
       Our total bundle is small enough that the trade-off is worth it. */
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
