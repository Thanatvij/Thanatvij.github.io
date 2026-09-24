# Astro pilot

A new [Astro](https://astro.build) project that lives **beside** the existing hand-written site. Migrated so far:
the **home page** (`/`) and the **competitions list** (`/projects/`). Nothing outside this `astro/` folder is used or changed
by it, and the existing site keeps working exactly as before.

- Output is **plain static HTML/CSS/JS** in `astro/dist/`: no server, adapter or runtime, same URLs as today.
- Scroll and cursor animation uses **GSAP + ScrollTrigger** and **Lenis**.
- All text lives in YAML files under `src/content/`; components only lay it out.

## Commands

```sh
cd astro
npm install                 # once
npm run dev                 # dev server with hot reload (http://localhost:4321)
npm run build               # writes ./dist
npm run preview:merged      # serves ./dist first, the existing site as fallback (see below)
```

`preview:merged` (`scripts/serve-merged.mjs`, no dependencies) exists because the pilot links to pages,
PDFs and images that are still served by the old site. It answers each request from `dist/` if the file
exists there, otherwise from the repository root, which is what GitHub Pages will do when the build is copied
over the root. Set `PORT=…` to change the port, or `LEGACY_ONLY=1` to serve only the existing site.

## Tests (`tests/`, Playwright + axe-core)

```sh
npm install
npm run test:install     # once: downloads Chromium for Playwright
npm test                 # builds, serves dist via the merged server on :4399, runs everything (~15 s)
npx playwright test tests/a11y.spec.ts    # one file
npm run test:update      # re-record the pixel baselines (only after an intended visual change)
```

| File | Covers |
| --- | --- |
| `a11y.spec.ts` | axe-core (WCAG 2.0/2.1/2.2 A+AA, best-practice) on all nine pages (embedded iframes excluded), light and dark, with and without reduced motion |
| `links.spec.ts` | every internal link, image, stylesheet, script and same-page anchor resolves; external `_blank` links have `noopener`; the featured TutorHub card points straight at the live demo |
| `interaction.spec.ts` | skip link, visible focus on every tab stop, keyboard theme toggle + persistence, mobile menu, reduced-motion (nothing hidden, no Lenis), touch (no overflow, tap targets, no pointer effects) |
| `motion-parity.spec.ts` | every page (Astro and static) gets the same effects: cursor ring, Lenis, scroll reveal, hero spotlight; none of them under reduced motion or on touch |
| `motion-strength.spec.ts` | reveal travel and stagger, count-up numbers, inner-page hero load-in, parallax range (desktop vs phone), step-diagram circle pop, hover responses, keyboardTrans flash; each with a reduced-motion counterpart |
| `type-scale.spec.ts` | 1280 / 1440 / 1920 / 2560 px: no horizontal overflow, body and h1 sizes stay bounded |
| `keyboardtrans.spec.ts` | JS port of KeyboardTran.py: the 27 documented cases, 600-input differential check against Python, and the widget on `/personal-projects/` |
| `visual.spec.ts` | full-page pixel diff (1% tolerance) of both pages, desktop + mobile, light + dark, against `tests/__screenshots__/` |

Baselines are Chromium-on-macOS renders; re-record them if you run on another OS. Text changes in the YAML
will fail the pixel diff by design: review the diff in `test-results/`, then `npm run test:update`.

## Structure

```text
astro/
├─ astro.config.mjs            static output, /dir/index.html URLs, no inline CSS/JS (strict CSP)
├─ src/
│  ├─ content/
│  │  ├─ pages/home.yaml       ALL text on the home page
│  │  ├─ pages/projects.yaml   ALL text on /projects/
│  │  └─ site/site.yaml        nav, footer, contact links, UI labels (shared by every page)
│  ├─ content.config.ts        one schema per page + site: a typo or missing field fails the build with a clear message
│  ├─ layouts/BaseLayout.astro <head> (SEO, CSP, fonts), header, <main>, footer, script bundle
│  ├─ components/              layout only, no copy: SiteHeader, SiteFooter, PageHero, SectionHead, BandCta, ArrowLink, Icon
│  │  ├─ home/                 Hero, Flagship, StatStrip, WorkList, Method, PersonalTeaser, Toolbox, Cta
│  │  └─ projects/             CompetitionItem, StatusLegend
│  ├─ pages/index.astro        assembles the home page from home.yaml
│  ├─ pages/projects/index.astro  assembles /projects/ from projects.yaml
│  ├─ scripts/                 client code: theme, menu, analytics, misc, motion (GSAP/Lenis)
│  ├─ styles/global.css        the design system (same file as the live site, minus the parts GSAP now drives)
│  └─ config/security.ts       the Content-Security-Policy string (security config, not copy)
├─ public/                     copied as-is: fonts, theme.js (blocking, keeps first paint flash-free), images
└─ scripts/serve-merged.mjs    preview server described above
```

## Editing text

Edit the page's file in `src/content/pages/` (`home.yaml`, `projects.yaml`) or `site.yaml` for navigation/footer. No component needs touching.

- A heading is `titleStart` + `titleEmphasis`; the second part is shown in the italic accent colour.
- Lists are written in **block style** (one field per line). Avoid `{ a: b, c: d }` for anything that
  contains a comma: in that style a comma ends the value (`label: 17,767 images` would read as the number 17).
- The home page's featured personal-project card shows either a screenshot (`image`) or a mock terminal (`terminal`, for command-line tools), never both; set `external: true` on it to open the link in a new tab.
- Quote a value if it starts with a special character or contains `: ` (colon + space) or ` #`.
- The build validates every field against `src/content.config.ts`. Example: deleting `hero.lead` gives
  `hero.lead: Required` and no page is produced.

## Motion (`src/scripts/motion.ts`)

Everything is behind `gsap.matchMedia()`:

| Condition | What runs |
| --- | --- |
| `prefers-reduced-motion: reduce` | Nothing. CSS shows all content immediately; native scrolling. |
| Touch / coarse pointer | Scroll-reveal and image parallax (ScrollTrigger). Native scrolling, no pointer effects. |
| Mouse / trackpad (`hover: hover` + `pointer: fine`) | The above plus Lenis smooth wheel scrolling, cursor ring, hero spotlight, card glow. |

If a visitor changes a setting while the page is open, everything is torn down or started without a reload.
Lenis is stopped while the mobile menu is open. Keyboard scrolling (Space, PageUp/Down, Home/End), Tab focus
and the skip link behave the same as on the existing site (tested).

Reveal state is set in CSS (`.js .reveal`) so there is no flash, and `theme.js` removes the `.js` flag if the
script bundle never arrives, so content can never stay hidden.

## Deploying to GitHub Pages

The build is ordinary static files, so both routes below work without a server.

1. **Recommended once migration is finished:** a GitHub Actions workflow that runs `npm ci && npm run build`
   in `astro/` and publishes `astro/dist` with `actions/upload-pages-artifact` + `actions/deploy-pages`
   (repository Settings → Pages → Source: *GitHub Actions*). Not added yet, because it would change how the
   live site is published.
2. **During migration (page by page):** copy the built files over the repository root, e.g. `dist/index.html`,
   `dist/_astro/`, and any new files under `dist/assets/`. The old pages keep using
   `assets/css/styles.css` and `assets/js/main.js`, which the build does not touch. `.nojekyll` (already
   in the repo root) is required so GitHub does not ignore the `_astro/` folder.

## Migrating the next page

1. Add `src/content/pages/<name>.yaml` and a matching collection (schema) in `content.config.ts`.
2. Add a page in `src/pages/` (nested folders give the same URLs, e.g. `src/pages/projects/pakd/index.astro`).
3. Reuse `BaseLayout`, `PageHero`, `BandCta` and the other shared components; add components only for genuinely new sections.
4. Move the images that page needs into `public/assets/img/`.
5. Still to port from `assets/js/main.js` when a page needs them: copy-email button, iframe keyboard-focus ring
   (Tarot embed), reading progress bar and table-of-contents highlighting (case studies).

## Notes and trade-offs

- **Weight:** GSAP + ScrollTrigger + Lenis add about 46 KB gzip (JS 5 KB → 51 KB). On a throttled phone profile the pilot
  measured +56 ms first contentful paint and +92 ms LCP; on desktop there was no measurable difference.
- **Smooth scrolling** is an accessibility trade-off. It is limited to precise pointers, disabled for reduced motion,
  and leaves keyboard and touch scrolling native.
- **Versions:** Astro 7.3.3, GSAP 3.15.0, Lenis 1.3.26. GSAP is free under its
  [standard "no charge" licence](https://gsap.com/standard-license), which has some restrictions worth reading.
- Type checking (`astro check`) is not enabled, to keep dependencies to the three above.
