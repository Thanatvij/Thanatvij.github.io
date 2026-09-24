import { test, expect } from '@playwright/test';

// Pixel diff against saved baselines in tests/__screenshots__/. Update deliberately with `npm run test:update`.
const shots = [
  { name: 'home', path: '/' },
  { name: 'projects', path: '/projects/' },
];
const viewports = [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 800 }];

for (const s of shots) for (const v of viewports) for (const theme of ['light', 'dark'] as const) {
  test(`visual: ${s.name} · ${v.name} · ${theme}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(s.path);
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    await page.evaluate(() => Promise.all([...document.images].map((i) => (i.loading = 'eager', i.decode().catch(() => {})))));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot(`${s.name}-${v.name}-${theme}.png`, { fullPage: true });
    await ctx.close();
  });
}
