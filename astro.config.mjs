import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://healthcalc.ciciad.tech',
  output: 'static',
  integrations: [react(), tailwind(), sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'ar'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});