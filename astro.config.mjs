import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Local (npm run dev) rulează la rădăcină; build-ul pentru Pages setează GH_PAGES=1.
// TODO(real): la domeniul clientului, `site` devine domeniul lui și `base` se scoate.
const pages = process.env.GH_PAGES === '1';

export default defineConfig({
  site: pages ? 'https://rtr-tech-solutions.github.io' : undefined,
  base: pages ? '/flacon-outlet-demo' : undefined,
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
