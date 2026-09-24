# Design research

Visual research for the portfolio redesign, captured on **19 September 2026**.
All reference sites were treated as reference material only. Nothing here is copied
from them: no code, text, branding, layouts or distinctive visual identities.

## Method

- Tool: Playwright with headless Chromium (v153), run locally.
- For each of the four galleries, I loaded the page and took a screenshot.
- From the galleries I opened **14 live portfolio websites**. Each one was loaded on
  desktop (1440 × 900) and on an iPhone 13 profile (390 × 844, touch).
- For each site I captured screenshots at the top of the page and at about 35 % and 70 %
  of the scroll, plus one after moving the pointer.
  I also recorded computed fonts, detected library signatures, custom-cursor markup,
  reduced-motion and dark-mode CSS rules, the focus ring on the first `Tab`, page
  height, image and video counts, request count and transferred bytes.
- I read the screenshots myself. Observations below marked **(seen)** come from a screenshot.
  Observations marked **(measured)** come from the automated probe.
  Screenshots I did not open are not described.

### Limits of this research

- Timings, byte counts and loader states come from a single unthrottled headless run with
  software rendering (no GPU). Loaders and WebGL scenes may finish sooner on real hardware.
  Byte counts sum `content-length` headers seen in an ~8-second visit that included
  scrolling, so streamed video is undercounted rather than overcounted.
- Library detection is a text/regex heuristic (for example, "three" also matches the word
  "webgl"). It shows what a page appears to use, not a verified stack.
- Cookie banners were not accepted or dismissed.
- I did not test any site with a screen reader, so the accessibility notes only cover
  what the probe can see (focus ring on first `Tab`, reduced-motion CSS rules).
- All 4 galleries and all 14 sites loaded. **No site blocked access.**

## Galleries visited

| Gallery | Result | What I noted (seen) |
| --- | --- | --- |
| [Awwwards · Portfolio](https://www.awwwards.com/websites/portfolio/) | Loaded (HTTP 200) | 9,632 portfolio entries. Large 3-column thumbnail grid with filters for category, tag, technology, country, **font** and **colour**. Cookie banner over the grid. |
| [Siteinspire · Portfolio](https://www.siteinspire.com/websites/category/portfolio) | Loaded (HTTP 200) | Very quiet UI: light-weight type, generous whitespace, thumbnails matted on grey, one-line captions. |
| [Framer Gallery · Portfolio](https://www.framer.com/community/gallery/categories/portfolio/) | Loaded (HTTP 200) | Dark 4-column grid, "Trending / Recent" tabs, an explicit "Open" button per entry. |
| [Eleken · 50 best website design examples](https://www.eleken.co/blog-posts/best-website-design-examples) | Loaded (HTTP 200) | Long editorial article (updated 27 Jul 2026, ~40 min read) with a "Visit website" link per example. Cookie banner with a "necessary only" choice. |

## Portfolio sites inspected

| # | Site | Source gallery | Desktop | Mobile |
| --- | --- | --- | --- | --- |
| 1 | https://danielkiss.hu/ | Awwwards | seen | seen |
| 2 | https://www.juanmoraromero.com/ | Awwwards | seen | seen |
| 3 | https://www.doordennis.nl/ | Awwwards | seen | seen |
| 4 | https://emitakahashi.ca/ | Siteinspire | seen | probed only |
| 5 | https://gilhuybrecht.com/ | Siteinspire | seen | probed only |
| 6 | https://jasonbradley.co/ | Siteinspire | seen | probed only |
| 7 | https://taradash.me/ | Siteinspire | seen | probed only |
| 8 | https://www.xhulia.com/ | Framer | seen | seen |
| 9 | https://kynejang.com/ | Framer | seen | seen |
| 10 | https://karolinahess.com/ | Framer | seen | probed only |
| 11 | https://matthewencina.com/ | Framer | seen | probed only |
| 12 | https://helloakriti.com/ | Framer | seen | seen |
| 13 | https://flayks.com/ | Eleken | seen | probed only |
| 14 | https://lusion.co/ | Eleken | seen | probed only |

"Probed only" means the mobile screenshots were captured and the mobile overflow test ran
(none of the 14 sites had horizontal overflow at 390 px), but I did not open those
particular images.

## Per-site notes

**1 · danielkiss.hu** — dark, condensed display type with one red accent, technical
"instrument" details (ruler ticks, coordinate readouts) and an image that reacts to the
pointer (seen). GSAP and WebGL signatures; 9.6 MB in 55 requests; 13,159 px tall page with
112 images (89 lazy) and 5 videos; one `prefers-reduced-motion` rule; visible focus outline
(measured). On mobile the layout collapses to a hamburger and keeps the name legible, but
there is a large empty dark area above it (seen).
*Useful:* a quiet technical layer (marks, mono labels) that makes a page feel built rather
than templated. *Unsuitable:* the loud "chaos" tone, the weight, and the coordinate/ruler
identity, which is distinctive to this site and which I chose not to reproduce.

**2 · juanmoraromero.com** — hairline-ruled grid, one large statement paragraph as the
hero, a horizontally scrolling project strip with an `01/05` counter, and a side column that
gives **Client** and **Role** next to each project (seen). Next.js signature, 2.5 MB, one
reduced-motion rule, visible focus outline (measured).
*Useful:* project metadata (role, client) beside the work; statement-first hero; a counter
that orients the visitor. *Unsuitable:* on mobile, the intro text sits directly over
imagery and blends with it, so parts of it are hard to read (seen).

**3 · doordennis.nl** — serif display headline with an italic phrase, pill navigation with
clear hover and current states, cross-page transitions (swup signature) (seen/measured).
339 requests (4.4 MB). The first `Tab` press showed no visible focus ring on the element I
sampled (measured). On both viewports the cookie banner covered the lower part of the first
screen (seen).
*Useful:* italic emphasis inside a serif headline; pill nav with an obvious current state.
*Unsuitable:* request count, banner over the hero, and weak first-focus visibility.

**4 · emitakahashi.ca** — text-first, two-column page with a dense "Information" panel of
contact, clients, collaborators, education and exhibitions, and a "Thumbnail View" toggle
(seen). No `<h1>` and no `lang` attribute (measured). About **110 MB** transferred in the
visit (measured).
*Useful:* credits and evidence stated plainly beside the work. *Unsuitable:* payload,
missing document structure, small default type.

**5 · gilhuybrecht.com** — full-screen black loader with a percentage counter. After 4.5 s
in my headless run it still read "98 %" (seen). About 84 elements carry "cursor" in their
class name, i.e. a custom cursor system (measured). 48 MB, 225 requests.
*Useful:* evidence that custom cursors are common at the high end. *Unsuitable:* a loader
that blocks all content, which is exactly what the brief says to avoid.

**6 · jasonbradley.co** — full-bleed video hero with a filmstrip of thumbnails at the bottom
and pill buttons for "General Info" and "Contact" (seen). The probe counted 20 video elements
and about **394 MB** transferred (measured).
*Useful:* a persistent, obvious way to switch between projects. *Unsuitable:* payload by
two orders of magnitude, and the page is a single 900 px screen.

**7 · taradash.me** — Swiss-style typographic grid: a four-column intro, small black label
buttons ("Linkedin", "Email"), object captions such as "Obj. Pedal 4." (seen). 23,624 px
tall, 23 videos, 132 MB, 14 px body text (measured).
*Useful:* an intro in columns with real reading measure and captions that name the object.
*Unsuitable:* body text this small, and the weight of the media.

**8 · xhulia.com** — centred serif headline with an italic word, a floating pill nav made of
icons, and case-study rows that state the **outcome in the row itself** ("~83 % faster
purchase · 18 → 5 taps") beside a "View case study" button. A thin coloured progress bar
runs along the top, and the sheets stack over each other as you scroll (seen). On mobile the
same structure holds and the pill nav stays usable (seen). One `prefers-color-scheme` rule
(measured). 90 MB, 15 videos (measured).
*Useful:* the best storytelling pattern of the set. It puts role, timing and result in the
list so a recruiter learns something before clicking. Also the scroll-progress indicator.
*Unsuitable:* the toy-like coloured tags in the hero; the media weight; icon-only nav
labels.

**9 · kynejang.com** — very large serif headline with italic letter variants and a soft
colour glow rising from the bottom, small parenthesised nav, "(scroll down & explore)" cue
(seen). Very light: 0.3 MB and 39 requests at capture (measured). Mobile keeps the same
composition, and the hamburger icon is legible (seen).
*Useful:* one confident typographic idea per screen, and near-zero weight. *Unsuitable:*
decorative glyph swaps that would hurt legibility if applied to Thai.

**10 · karolinahess.com** — floating bottom pill navigation with a clearly highlighted
current item, and a rotated "Quick info" tab on the right edge (seen). At 35 % scroll the
whole viewport showed only the words "Recent works" on an empty grey field (seen).
*Useful:* the highlighted current item in a compact nav. *Unsuitable:* whole screens that
are empty until scroll-driven content arrives; a visitor who scrolls quickly sees nothing.

**11 · matthewencina.com** — full-bleed video hero with a highlights carousel (dots) and a
"Scroll" cue; the headline leads with client names as credibility (seen). 24 MB, 7 videos
(measured).
*Useful:* leading with proof instead of adjectives. *Unsuitable:* autoplaying full-screen
video for a portfolio that has to load fast on phones.

**12 · helloakriti.com** — oversized grotesk headline, a monospaced navigation, mono
outlined tags, a small serif paragraph, and a paper grain background with a few coloured
squares (seen). 0.3 MB at capture; on mobile the headline reflows onto four lines and the
"Start a project" button stays reachable (seen).
*Useful:* the type pairing of a display face, a serif for prose and mono for labels; outlined
mono tags. *Unsuitable:* the confetti squares, which would add noise to a data-focused page.

**13 · flayks.com** — dark page with a left rail of section dots ("WORK" active), large
project frames with pagination dots and a fixed "Currently in …" status line (seen). Lenis
signature, 75.7 MB, 11 videos (measured).
*Useful:* a section rail that shows where you are; a fixed availability line.
*Unsuitable:* payload and the amount of fixed UI competing with content.

**14 · lusion.co** — WebGL preloader: a black screen, an animating mark and a counter that
read "100" at 4.5 s (seen). 3 canvases, 20.9 MB (measured).
*Useful:* nothing for this project. It is the clearest example of the **long intro** the
brief rules out.

## Patterns worth using

- **Composition.** One idea per screen. A hero that says what the person does, then evidence
  soon after. Hairline rules and a visible grid (Mora Romero, Taradash, Akriti) give
  editorial structure without decoration.
- **Typography.** A serif display face with one italic phrase (Xhulia, Door Dennis, Kyne),
  a plain sans for reading, and mono for labels (Akriti, Kiss). I adopt the *idea* of the
  three-voice system, with different typefaces and different roles.
- **Case-study lists.** State role, timing and outcome in the list row (Xhulia) and put role
  and client beside the work (Mora Romero). I use this for every competition project.
- **Navigation.** Pill or pill-like current-item states are easy to read (Karolina, Door
  Dennis). A thin reading-progress bar (Xhulia) orients on long case studies. A visible
  section rail helps on long pages (Flayks); I use a sticky table of contents.
- **Hover and pointer.** Custom cursors exist across the high-end set (Gil Huybrecht,
  Daniel Kiss). None of the ones I saw was needed to use the site. I keep the native
  cursor and add a lagging ring that grows on interactive elements.
- **Motion.** The strongest sites use one or two motions with clear purpose. I limit myself
  to reveal-on-scroll, small parallax, hover states and a short cross-fade between pages.
- **Responsive.** All 14 sites had no horizontal overflow at 390 px. The good mobile
  layouts (Kyne, Akriti, Xhulia) reduce the number of things on screen instead of shrinking
  them.
- **Performance.** The lightest sites (Kyne 0.3 MB, Akriti 0.3 MB, Mora Romero 2.5 MB) were
  also among the most readable. I follow that: two fonts families self-hosted in Latin +
  Thai subsets only, lazy media below the fold, no video autoplay.

## Patterns rejected

- Full-screen preloaders and counters (Lusion, Gil Huybrecht).
- Autoplaying full-bleed video and 100 MB+ pages (Jason Bradley, Emi Takahashi, Taradash).
- Text over imagery with blend modes on mobile (Mora Romero).
- Whole empty screens waiting on scroll triggers (Karolina Hess).
- Cookie banners that cover the hero. (This site has no banner. Its existing GA4 tag does set analytics cookies; whether that needs a consent notice is a decision for the owner and was not changed.)
- Confetti, mascots and toy-like sticker tags (Xhulia hero, Akriti squares).
- Coordinate rulers and HUD readouts as a signature (Daniel Kiss). This is that site's
  identity, so I do not reproduce it.
- Tiny body text (14 px on Taradash) and icon-only navigation.
- Any scroll hijacking (Lenis-style smoothing was detected on several sites). Native
  scrolling is kept.

## Decisions taken for this portfolio

| Topic | Decision | Informed by |
| --- | --- | --- |
| Type | Instrument Serif (display, Latin only), IBM Plex Sans Thai (body, Thai + Latin), IBM Plex Mono (data labels). All self-hosted, Latin and Thai subsets only, 116 KB in total. | Serif + sans + mono pairings (Xhulia, Akriti, Door Dennis) |
| Thai handling | Thai never uses the serif face and never gets letter-spacing. Justification is enabled only where the browser supports `text-justify: inter-character`, and only from 720 px up; other browsers stay start-aligned. | Own testing, see `docs/site-audit.md` |
| Colour | Light "paper" and dark "instrument" are two separate palettes. Same teal accent hue, but the dark one raises luminance, uses borders and surface steps instead of shadows, and dims images slightly. All text ≥ 5:1. | Avoiding a simple inversion |
| Hero | Statement headline + Thai lead + a flagship card for BloodScope with real numbers. A dot grid with a pointer-following spotlight is the only "technical" background. | Statement-first hero (Mora Romero); quiet technical layer (Kiss) |
| Project list | Index rows with role, event, status and evidence, each row a stretched link | Xhulia, Mora Romero |
| Case study | Sticky table of contents, reading progress, numbered sections, metrics as cards, a bar chart and pipeline diagram drawn from the real numbers | Xhulia progress bar, Flayks rail |
| Pointer | Lagging accent ring, grows on links and shows "Open" over project links. Only on `(hover: hover) and (pointer: fine)` and only without reduced motion. | Custom cursors (Gil Huybrecht, Kiss) |
| Motion | Reveal on scroll (0.7 s, 18 px), hover states, ≤ 14 px parallax on one image, a 0.26 s cross-document fade. No scroll hijacking, no intro. | Rejected list above |
| Loading | No render-blocking third-party requests; media lazy-loaded; the 21 MB video does not preload; the Tarot demo loads only near the viewport. | Payload measurements |
| Accessibility | Visible 3 px focus ring, 44 px targets, skip link, one labelled nav landmark, `prefers-reduced-motion` respected in CSS and JS, works without JS. | First-`Tab` focus probe; reduced-motion rule counts |
