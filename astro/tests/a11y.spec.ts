import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// '/' and '/projects/' are the Astro build; the rest are the static pages that are still served from the repo root.
const pages = ['/', '/projects/', '/about/', '/contact/', '/personal-projects/', '/projects/bloodscope/', '/projects/pakd/', '/projects/nutrimatch/', '/projects/tdet-scan/'];
const themes = ['light', 'dark'] as const;
const motion = ['no-preference', 'reduce'] as const;

for (const path of pages) for (const theme of themes) for (const m of motion) {
  test(`axe: ${path} · ${theme} · motion ${m}`, async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: theme, reducedMotion: m });
    const page = await ctx.newPage();
    await page.goto(path);
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    // Reveal-on-scroll content must be visible before it is scanned.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const { violations } = await new AxeBuilder({ page }).exclude('iframe')   // embedded demos (TutorHub) are separate apps with their own landmarks
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    await ctx.close();
  });
}
