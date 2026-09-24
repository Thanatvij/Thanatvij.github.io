import { test, expect } from '@playwright/test';

// Every page should get the same motion effects. "/" and "/projects/" are Astro (GSAP + Lenis); the rest are static
// pages (assets/js/main.js + vendored Lenis). Both must behave the same.
const pages = ['/', '/projects/', '/about/', '/contact/', '/personal-projects/', '/projects/bloodscope/', '/projects/pakd/', '/projects/nutrimatch/', '/projects/tdet-scan/'];

for (const path of pages) {
  test(`fine pointer: cursor ring, Lenis, reveal and hero spotlight on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.mouse.move(300, 300); await page.mouse.move(340, 320);
    await expect(page.locator('.cursor-ring')).toHaveCount(1);
    await expect(page.locator('html.lenis')).toHaveCount(1, { timeout: 5000 });
    expect(await page.locator('.reveal').count()).toBeGreaterThan(0);
    await expect(page.locator('header[data-spotlight], section[data-spotlight]').first()).toBeAttached();
    await expect(page.locator('.hero-field').first()).toBeAttached();
  });

  test(`reduced motion: no cursor ring, no Lenis, content visible on ${path}`, async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(path);
    await page.mouse.move(300, 300); await page.mouse.move(340, 320);
    await page.waitForTimeout(400);
    await expect(page.locator('.cursor-ring')).toHaveCount(0);
    await expect(page.locator('html.lenis')).toHaveCount(0);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity === '0').length);
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test(`touch: no pointer effects and no Lenis on ${path}`, async ({ browser }) => {
    const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(path);
    await page.waitForTimeout(400);
    await expect(page.locator('.cursor-ring')).toHaveCount(0);
    await expect(page.locator('html.lenis')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}

test('parallax images exist on home and personal-projects', async ({ page }) => {
  for (const p of ['/', '/personal-projects/']) {
    await page.goto(p);
    expect(await page.locator('[data-parallax]').count(), p).toBeGreaterThan(0);
  }
});
