# Site audit (before the redesign)

Audited on **19 September 2026** against commit `ca4fb5c` ("Fix favicon and image paths"),
exported to a scratch folder and served locally, so that the audit did not depend on any
redesign work in progress.

- Repository: `Thanatvij/Thanatvij.github.io` (remote `origin` confirmed), branch `main`, clean tree.
- Live site `https://thanatvij.github.io/` and `/tarot/` both answer HTTP 200.
- No `AGENTS.md` exists. The only project documentation is `README.md`.
- Stack: hand-written static HTML, one CSS file, one small vanilla JS file, no build step,
  hosted on GitHub Pages (`.nojekyll`). This stack is suitable and was kept.

## Inventory

### Pages

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` | Introduction, BloodScope flagship card, 3 of 4 competition projects, Tarot highlight, skills |
| `/projects/` | `projects/index.html` | Four competition projects |
| `/projects/bloodscope/` | `projects/bloodscope/index.html` | Flagship case study with project video and three certificates |
| `/projects/pakd/` | `projects/pakd/index.html` | Case study with model comparison and certificate |
| `/personal-projects/` | `personal-projects/index.html` | Tarot web app (embedded), ABYSS, PTT Élan Café, keyboardTrans |
| `/about/` | `about/index.html` | Summary, education, experience timeline, skills |
| `/contact/` | `contact/index.html` | E-mail (copy button), LinkedIn, GitHub, phone, resume |
| `/tarot/` | `tarot/index.html`, `tarot/tarot-guide.html` | Separate Tarot app (own CSS/JS/JSON), embedded on the personal page |
| `/404.html` | `404.html` | Not-found page |
| — | `googlee2373ae6fc61cab5.html` | Google Search Console verification (kept as is) |

### Projects and categories

| Project | Category | Where it appears | Status label |
| --- | --- | --- | --- |
| **BloodScope** (NSC 2026, National Finalist) | Competition, **flagship** | Home hero + list, `/projects/`, case study | Built & tested |
| PakD — ปากดี (NSC 2025, regional funding) | Competition | Home, `/projects/`, case study | Built prototype |
| NutriMatch (CP CUP 2025 National Round) | Competition | Home, `/projects/` | Concept & pitch |
| TDET-Scan (KU MedAI 2026) | Competition | `/projects/` only | Concept & pitch |
| พยากรณ์แห่งดวงดาว / Tarot Web App | **Personal** | `/personal-projects/`, `/tarot/`, home highlight | Published web app |
| ABYSS | Personal (course project) | `/personal-projects/` | Course project |
| PTT Élan Café | Personal (course project) | `/personal-projects/` | Course project |
| keyboardTrans | Personal utility | `/personal-projects/` | Personal utility |

Categorisation is correct: no personal project appears in `/projects/`, and no competition
project appears in `/personal-projects/`. BloodScope is labelled "Flagship" on the home page,
on the competitions page and on its case study.

### Links, files and media

- **Internal links:** every `href`/`src`/`poster` in the 11 HTML files resolves to an existing
  file (static check, 0 broken).
- **External links (HTTP status, checked with `curl`):** `github.com/Thanatvij` 200,
  `/ABYSS` 200, `/CoffeeShop` 200, `/keyboardTrans` 200, `/tarot` 200. LinkedIn returns 999
  (its standard bot block), so the profile link itself **could not be verified automatically**.
- **PDFs** in `assets/docs/`: resume (1 page), `cert-nsc2025`, `cert-cpcup2025`,
  `cert-kumedai2026`, and three BloodScope documents (finalist certificate, funding
  certificate, four-page regional results). All are valid PDFs. I read their text, or
  rendered the image-only one, to check the claims made on the site:
  - NSC 2026 finalist certificate: dated 24 Aug 2569 (2026), project ID 28P13N00957. ✔
  - NSC 2026 funding certificate: 7 Aug 2569. ✔
  - NSC 2025 certificate: funded project, 8 Aug 2568, ID 27p13n0163. ✔
  - CP CUP 2025: certificate of appreciation, National Round, 11 Nov 2025. ✔
  - KU MedAI 2026: certificate for presenting work, 7 March 2569. ✔
- **Images:** 19 files in `assets/img/`. Runtime check on all 7 main pages: 0 images failed
  to decode, 0 requests returned ≥ 400 (analytics excluded).
- **Video:** `bloodscope-demo.mp4`, 21.6 MB, 1280 × 720, 6 min 18 s, H.264 + AAC. Metadata loads
  and it plays.
- **Interactive features** (tested against the old build):
  - Theme toggle: works, persists across reload, follows system preference initially. ✔
  - Mobile menu: opens, sets `aria-expanded`, closes on `Escape`. ✔
  - Tarot iframe: loads, the landing section is visible, the start button advances to the
    category step. ✔
  - E-mail copy button on `/contact/`, footer year, reveal observer.
- **Analytics:** GA4 property `G-PE6Z9FWNFP` is on the home page inline and added by
  `main.js` elsewhere. The Tarot app has its own property (`G-4WPJ98PTW1`).
  Both were preserved.

## Confirmed defects

Numbered so that the redesign can be traced back to them. "Verified by" says how I confirmed it.

| # | Defect | Verified by | Severity |
| --- | --- | --- | --- |
| 1 | **404 page breaks at any nested URL.** `404.html` links `assets/css/styles.css` and `assets/js/main.js` relatively. GitHub Pages serves it at the missing URL, so on `/no/such/page/` both files 404 and the page is unstyled. | Served `404.html` at `/no/such/page/`: two 404s, transparent body | Medium |
| 2 | **Dark-theme link and label contrast fails AA.** Accent blue `#2563eb` on the dark ground measures 3.56:1 (eyebrows) and 3.13:1 (`.text-link` on cards). Below 4.5:1 for small text. | Contrast computed from the CSS values | High |
| 3 | **No web fonts are loaded.** CSS names `Inter` but has no `@font-face` and `font-src 'self'`, so type falls back to whichever system font the visitor has, and Thai glyphs come from different families per OS. | CSS inspection | Medium |
| 4 | **No social/SEO metadata.** No Open Graph, Twitter or canonical tags on any page. Shared links show no image or title beyond the `<title>`. | `grep` over all pages | Medium |
| 5 | **Inconsistent security policy.** Only `index.html` and `personal-projects/` carry a CSP; the home page's allows `'unsafe-inline'` scripts because GA is pasted inline. Other pages have none. | Source | Low |
| 6 | **Two unlabelled `<nav>` landmarks** on every inner page (desktop nav + hidden mobile panel), so a screen-reader landmark list shows two "navigation" regions. | Source | Low |
| 7 | **Embedded Tarot demo loads eagerly.** `loading="eager"` pulls Tailwind's runtime from a CDN, web fonts and card images as soon as the page opens, though the demo is below the fold. `allow="vibrate"` prints a console warning ("Unrecognized feature: 'vibrate'"). | Playwright console log | Low |
| 8 | **Tailwind CDN in the Tarot app.** Console: "cdn.tailwindcss.com should not be used in production". The app therefore depends on a third-party script at runtime. | Playwright console log | Low (separate app) |
| 9 | **Home page shows 3 of 4 competitions.** TDET-Scan is missing from the home list, and the stats block says "4 National competitions". | Source | Low |
| 10 | **Generic template look.** The layout (stat bar, blue pills, soft cards, navy panel) does not signal Data Science / AI-ML, and the hero repeats one large number without context. | Baseline screenshots | Design |
| 11 | **Unreferenced legacy files.** Root `Styles.css` and `Script.js` (from an earlier site), root `resume.pdf` (a *different, older* PDF from the one linked), duplicate `cert-*.pdf` at the root, and images `coffee-project.webp`, `abyss-project.webp`, `tarot-project.webp`, `bloodscope-pipeline.svg`. None is referenced by any page. | Static reference check, `cmp` | Info |
| 12 | **Dead CSS.** `.reveal` is a no-op (`opacity: 1`), and filter-bar and `keyboard-demo` rules exist without matching markup. | CSS/HTML cross-check | Info |
| 13 | **Old resume text says "Bangkok"; contact page says "Bangkok / Lampang".** Not changed (content is the owner's), noted for review. | Resume PDF vs. page | Info |

### Checked and *not* a defect

- **Theme flash on first paint.** I suspected one because the theme is applied from a
  deferred script. With a dark system preference the attribute was already `dark` at
  `DOMContentLoaded` and at `first-paint`, so it did **not** reproduce locally. It could
  still appear on a slow connection, so the redesign sets the theme from a tiny blocking
  script in `<head>`.
- **Horizontal overflow.** None on any page at 390 px or 1440 px in either theme.
- **Thai justification.** Justified Thai paragraphs in the old case studies looked
  acceptable in Chromium. The redesign keeps justification but limits it (see below).

## Things left as they are (content review for the owner)

- **IELTS 5.5** on the About page is not in the résumé PDF (which says "Professional Working
  Proficiency"). I kept the site's wording because the brief says confirmed wording stays.
- **PakD funding level.** The résumé says "national project funding"; the site says regional
  funding and that the project did not reach the national final. The site's more careful
  wording was kept.
- **Root-level legacy files** (defect 11) were **not deleted**: old links or applications may
  still point at `/resume.pdf` or `/cert-*.pdf`. Deleting them is a one-line decision for you.

## Redesign status

| # | Defect | Status | How |
| --- | --- | --- | --- |
| 1 | 404 page unstyled at nested URLs | Fixed | `404.html` now uses root-absolute asset and link paths (re-tested at `/no/such/page/`) |
| 2 | Dark-theme contrast below AA | Fixed | New palette; axe-core reports 0 violations in both themes on every page |
| 3 | No web fonts | Fixed | Self-hosted Instrument Serif, IBM Plex Sans Thai, IBM Plex Mono (Latin + Thai subsets, 116 KB), preloaded critical faces, metric-adjusted fallbacks |
| 4 | No social / SEO metadata | Fixed | Canonical, Open Graph, Twitter card and a generated `og-cover.jpg` on every page; Person JSON-LD on the home page |
| 5 | Inconsistent CSP | Fixed | One strict CSP on every page; GA is initialised from `main.js`, so no inline script is needed |
| 6 | Unlabelled duplicate `<nav>` | Fixed | One labelled nav per page; the mobile menu is the same element |
| 7 | Eager Tarot iframe, `vibrate` warning | Fixed | `loading="lazy"`, `allow` removed, `<noscript>` link added |
| 8 | Tailwind CDN inside the Tarot app | Not changed | Separate app, outside the redesign. Noted as a remaining limitation |
| 9 | Home lists 3 of 4 competitions | Fixed | All four are listed |
| 10 | Generic template look | Fixed | Redesigned; see `design-research.md` |
| 11 | Unreferenced legacy files | Not changed | Left in place on purpose (see above) |
| 12 | Dead CSS | Fixed | Stylesheet rewritten |
| 13 | Location wording | Not changed | Owner's content |

## Measurements after the redesign

All from local Chromium runs against `python3 -m http.server`.

- **Automated checks:** about 1,100 assertions across 7 pages + 404, 6 viewport widths
  (360, 390, 820, 1280, 1440, 2560 px) and both themes. They cover status codes, console/CSP
  errors, one `<h1>`, labelled landmarks, broken images, horizontal overflow, touch-target size,
  axe-core (WCAG 2.0/2.1/2.2 A and AA plus best-practice rules), every internal link and anchor,
  external links, keyboard focus rings, theme toggle and persistence, reduced motion, touch,
  no-JavaScript rendering, the Tarot embed, the video and the copy button.
- **Thai justification:** comparing justified with natural glyph widths, the largest extra
  space on any line is 0.07 em per glyph (about 1.2 px at 17 px), spread evenly, so no word
  gaps appear at any tested width.
- **Weight and speed** (median of 3, cache disabled). Mobile profile: iPhone 13, 4× CPU
  slowdown, 1.6 Mbit/s, 150 ms latency.

| Page | Version | Transfer | Requests | LCP (mobile profile) | CLS |
| --- | --- | --- | --- | --- | --- |
| Home | before | 521 KB | 8 | 0.48 s | 0 |
| Home | after | 408 KB | 16 | 1.21 s | 0 |
| BloodScope | before | 314 KB | 11 | 0.68 s | 0 |
| BloodScope | after | 404 KB | 22 | 0.86 s | 0 |
| Personal projects | before | 1,380 KB | 21 | 4.24 s | 0 |
| Personal projects | after | 1,314 KB | 30 | 0.86 s | 0 |

  The home page is slower under the throttled profile because it now loads 115 KB of web
  fonts that the old page did not have (the old page used whatever system font the visitor
  had). That is the price of consistent Thai and Latin rendering. The personal page is much
  faster because the Tarot demo no longer loads until it is near the viewport.

## Follow-up round: defects found after the first delivery

| Defect | Cause | Fix |
| --- | --- | --- |
| The circular arrow at the right of each project row on the home page did not navigate when clicked | The row is one stretched link (`a::after`). On hover the decorative arrow rotates, and the `transform` lifted it above the link, so the click landed on the SVG, which is outside the link | The arrow is `pointer-events: none`, the stretched link has an explicit `z-index`, and the hover background and cursor ring are `pointer-events: none` as well. Every project link and icon on the home and competitions pages was clicked with a real mouse and a touch tap |
| Case-study hero lost its top padding on BloodScope and PakD | A stray `}` in `styles.css` (left by my own earlier edit) made the browser drop the next rule, `.case-hero` | Stray brace removed. The test suite now checks that the browser parses every top-level CSS rule, and that each page's hero has top padding |
