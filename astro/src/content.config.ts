import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Collections hold ALL editable text:
 *   src/content/site/site.yaml      → navigation, footer, contact links, UI labels (shared by every page)
 *   src/content/pages/<page>.yaml   → every word on one page (one collection per page: `home`, `projects`, …)
 * Components in src/components only lay content out; they contain no copy. The schemas below make
 * a typo in a YAML file (missing field, wrong type) fail the build with a readable message.
 */

const link = z.object({ label: z.string(), href: z.string(), external: z.boolean().optional() });
const image = z.object({ src: z.string(), alt: z.string(), width: z.number(), height: z.number(), small: z.string().optional() });
const heading = z.object({ eyebrow: z.string(), titleStart: z.string(), titleEmphasis: z.string(), lead: z.string() });

const site = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/site' }),
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    brandMark: z.string(),
    university: z.string(),
    skipLink: z.string(),
    homeLabel: z.string(),
    navLabel: z.string(),
    nav: z.array(z.object({ label: z.string(), href: z.string(), key: z.string() })),
    resume: link,
    labels: z.object({
      newTab: z.string(),
      themeToDark: z.string(),
      themeToLight: z.string(),
      menuOpen: z.string(),
      menuClose: z.string(),
    }),
    contact: z.object({ email: z.string(), github: z.string().url(), linkedin: z.string().url() }),
    footer: z.object({
      sub: z.string(),
      pagesHeading: z.string(),
      elsewhereHeading: z.string(),
      pages: z.array(link),
      elsewhere: z.array(link),
      legal: z.string(),
      legalRight: z.string(),
    }),
    seoDefaults: z.object({ image: z.string(), imageWidth: z.number(), imageHeight: z.number(), themeColor: z.string() }),
    knowsAbout: z.array(z.string()),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: 'home.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string(), path: z.string() }),
    hero: z.object({
      eyebrow: z.string(),
      titleStart: z.string(),
      titleEmphasis: z.string(),
      lead: z.string(),
      primary: link,
      secondary: link,
      note: z.string(),
    }),
    flagship: z.object({
      badge: z.string(),
      image: image,
      meta: z.string(),
      title: z.string(),
      description: z.string(),
      stats: z.array(z.object({ label: z.string(), value: z.string() })),
      link: link,
    }),
    stats: z.object({ ariaLabel: z.string(), items: z.array(z.object({ value: z.string(), label: z.string() })) }),
    work: heading.extend({
      flagLabel: z.string(),
      deckLabel: z.string(),
      rows: z.array(z.object({
        title: z.string(),
        flagship: z.boolean().default(false),
        href: z.string(),
        thumb: image,
        description: z.string(),
        event: z.string(),
        status: z.object({ kind: z.enum(['built', 'concept', 'personal']), label: z.string() }),
        deck: z.object({ href: z.string(), size: z.string() }),
      })),
      more: link,
    }),
    method: heading.extend({
      steps: z.array(z.object({ title: z.string(), text: z.string(), label: z.string() })),
      foot: z.object({ text: z.string(), linkLabel: z.string(), linkHref: z.string() }),
    }),
    personal: heading.extend({
      notice: z.string(),
      card: z.object({
        // The visual is either a screenshot (`image`) or a mock terminal (`terminal`, for command-line tools). Exactly one.
        image: image.optional(),
        terminal: z.object({
          filename: z.string(),
          ariaLabel: z.string(),                       // the mock is decorative text; screen readers get this one sentence
          lines: z.array(z.object({ prefix: z.string().optional(), text: z.string(), muted: z.boolean().optional() })),
        }).optional(),
        status: z.string(),
        meta: z.string(),
        title: z.string(),
        titleThai: z.boolean().optional(),             // true → title is set in the Thai-friendly sans face
        description: z.string(),
        tags: z.array(z.string()),
        cta: z.string(),
        href: z.string(),
        external: z.boolean().optional(),              // true → opens in a new tab (other sites)
      }).refine((c) => Boolean(c.image) !== Boolean(c.terminal), { message: 'card needs exactly one of `image` or `terminal`' }),
      more: link,
    }),
    toolbox: heading.extend({
      hint: z.string(),
      groups: z.array(z.object({ name: z.string(), items: z.array(z.object({ name: z.string(), tip: z.string() })) })),
      more: link,
    }),
    cta: heading.extend({ primary: link, secondary: link }),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: 'projects.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ title: z.string(), description: z.string(), path: z.string() }),
    hero: z.object({
      eyebrow: z.string(),
      titleStart: z.string(),
      titleEmphasis: z.string(),
      lead: z.string(),
      legendLabel: z.string(),
      legend: z.array(z.object({ kind: z.enum(['built', 'concept', 'personal']), label: z.string(), text: z.string() })),
      more: link,
    }),
    list: z.object({
      ariaLabel: z.string(),
      deckLabel: z.string(),
      items: z.array(z.object({
        id: z.string(),
        flag: z.string().optional(),                 // "Flagship project" badge; only the flagship has one
        status: z.object({ kind: z.enum(['built', 'concept', 'personal']), label: z.string() }),
        ordinal: z.string(),
        title: z.string(),
        titleThai: z.string().optional(),
        description: z.string(),
        facts: z.array(z.object({ label: z.string(), value: z.string() })),
        tags: z.array(z.string()),
        cover: image,
        href: z.string(),
        primaryLabel: z.string(),
        deck: z.object({ href: z.string(), size: z.string() }),
        certificate: link,
      })),
    }),
    beyond: heading.extend({ cta: link }),
  }),
});

export const collections = { site, home, projects };
