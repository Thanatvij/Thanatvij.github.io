import { defineConfig } from 'astro/config';

// Static output only: `npm run build` writes plain HTML/CSS/JS to ./dist, which GitHub Pages
// serves exactly like the current hand-written site. No server, adapter or runtime is involved.
export default defineConfig({
  site: 'https://thanatvij.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',          // /projects/ → projects/index.html, same URLs as today
    inlineStylesheets: 'never',   // the strict CSP (style-src 'self') forbids inline <style>
  },
  vite: {
    build: {
      assetsInlineLimit: 0,       // never inline scripts/assets as data: or inline <script>: CSP again
    },
  },
  devToolbar: { enabled: false },
});
