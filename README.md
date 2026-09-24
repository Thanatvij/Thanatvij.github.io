# Thanat Vijitrakanlikit — Portfolio

Static portfolio for GitHub Pages (`Thanatvij/Thanatvij.github.io`, published at
<https://thanatvij.github.io>). Hand-written semantic HTML, one stylesheet and two small vanilla
JavaScript files. There is **no build step, framework or package manager**.

## Preview locally

```sh
cd /Users/thanatv./Desktop/DTI301/WebPortfolio
python3 -m http.server 4173
# then open http://localhost:4173/
```

Any static server works. Do not open the files with `file://`, because absolute paths such as
`/favicon.ico` need a web root.

## Pages

| Route | File | Content |
| --- | --- | --- |
| `/` | `index.html` | Introduction, BloodScope flagship card, competition index, method, personal-project teaser, toolbox |
| `/projects/` | `projects/index.html` | Four competition projects with role, event, result, evidence |
| `/projects/bloodscope/` | `projects/bloodscope/index.html` | Flagship case study, project video, certificates |
| `/projects/pakd/` | `projects/pakd/index.html` | NSC 2025 case study with model comparison |
| `/projects/nutrimatch/` | `projects/nutrimatch/index.html` | CP CUP 2025 concept & pitch overview (no results section: nothing was built) |
| `/projects/tdet-scan/` | `projects/tdet-scan/index.html` | KU MedAI 2026 concept & pitch overview (no results section: nothing was built) |
| `/personal-projects/` | `personal-projects/index.html` | TutorHub and Tarot (embedded live demos), ABYSS, PTT Élan Café, keyboardTrans |
| `/about/` | `about/index.html` | Summary, education, experience, skills |
| `/contact/` | `contact/index.html` | E-mail (copy button), LinkedIn, GitHub, phone, resume |
| `/404.html` | `404.html` | Not-found page (root-absolute asset paths, so it styles correctly at any URL depth) |
| `/tarot/` | `tarot/` | Separate Tarot app, unchanged; embedded on the personal page |

TutorHub is deployed from its own repository at <https://thanatvij.github.io/TutorHub/> and is embedded
on the personal-projects page as a same-origin live demo. Keep the full-screen and repository links as
fallbacks when changing the embed.

Competition projects and personal projects live on separate pages and are never mixed.
The competitions list holds only NSC, CP CUP and KU MedAI entries.

## Structure

```text
assets/css/styles.css     design system: tokens, light + dark palettes, components, motion
assets/js/theme.js        blocking, tiny: resolves the theme before first paint
assets/js/main.js         theme toggle, mobile menu, reveal, pointer accents, parallax, TOC, copy button, GA4
assets/fonts/             self-hosted woff2 (Latin + Thai subsets only, 116 KB in total)
assets/img/               images; card-size *-800.webp variants sit next to the full-size files
assets/img/events/         event photos (cp-cup/, tdet/): renamed originals plus -800/-1600 webp copies used by the pages
assets/docs/              resume, certificates and the four presentation decks (PDF)
assets/video/             BloodScope project video
docs/                     design research and site audit
```

Each project's slide cover links to its full deck (`BloodScopeSlide.pdf`, `Slide_NSC_PakD-2.pdf`,
`nutrimatch-pitch-deck.pdf`, `TDET-Slide.pdf`). `NutriMatch.pdf` is an earlier proposal document and is
intentionally **not linked** from any page.

The header and footer are repeated in each HTML file (no templating). If you change the
navigation, edit all eight pages.

## Design system in brief

- **Type.** Instrument Serif (display, Latin only), IBM Plex Sans Thai (body; Thai and Latin),
  IBM Plex Mono (data labels). Thai text never uses the serif face and never gets letter-spacing.
- **Colour.** Two separate palettes, *paper* (light) and *instrument* (dark), sharing a teal accent
  and an amber/vermilion signal colour. Text contrast meets WCAG AA in both (checked with axe-core; the base text tokens are 5:1 or better).
- **Thai paragraphs.** Long-form paragraphs use `text-align: justify` with
  `text-justify: inter-character`, only from 720 px up and only where the browser supports it.
  Measured extra spacing is at most 0.07 em per glyph.
- **Motion.** Reveal on scroll (0.7 s), hover states, ≤ 14 px parallax on one image, a
  0.26 s cross-document fade. No intro, no scroll hijacking.
- **Pointer.** The hero spotlight and card glow follow the pointer only on `(hover: hover) and
  (pointer: fine)` and only when `prefers-reduced-motion` is not set. There is no custom cursor.
- **Without JavaScript.** All content is visible, and the navigation is a wrapped row.
- **Security.** Every page carries a strict CSP (`script-src 'self'` plus Google Tag Manager,
  `style-src 'self'`, no executable inline scripts, no inline styles). Do not add `style="..."` attributes or inline
  `<script>` blocks; use classes and the JS files instead.

## Analytics

The existing GA4 property `G-PE6Z9FWNFP` is initialised from `assets/js/main.js` when the browser is
idle. The Tarot app keeps its own property. The Google Search Console verification file is unchanged.

## Documentation

- `docs/design-research.md` — reference-site research (14 portfolios from four galleries)
- `docs/site-audit.md` — inventory and defects found in the previous version, and how each was addressed

## Legacy files

`Styles.css`, `Script.js`, `resume.pdf` and the three `cert-*.pdf` files at the repository root
are not referenced by any page. They were left in place because old links might still point at them.
