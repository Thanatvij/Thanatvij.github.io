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

// Lenis should follow the wheel almost immediately: a 600px wheel step must be ~done within half a second.
for (const path of ['/', '/about/']) {
  test(`Lenis feels light on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForSelector('html.lenis');
    await page.waitForTimeout(400);
    await page.mouse.move(700, 450);
    await page.evaluate(() => {
      const w = window as unknown as { __s: [number, number][] };
      w.__s = []; const t0 = performance.now();
      const tick = () => { w.__s.push([performance.now() - t0, scrollY]); if (performance.now() - t0 < 2000) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(2100);
    const s = await page.evaluate(() => (window as unknown as { __s: [number, number][] }).__s);
    const final = s[s.length - 1][1];
    const start = s.find((x) => x[1] > 1)![0];
    const t99 = s.find((x) => x[1] >= final * 0.99)![0] - start;
    expect(final).toBeGreaterThan(550);
    expect(t99).toBeLessThan(500);      // the old lerp:0.1 setting took ~750 ms
  });
}
