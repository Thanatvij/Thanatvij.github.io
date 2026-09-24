import { test, expect } from '@playwright/test';

// Type must not balloon on wide screens: no horizontal overflow at common desktop widths, and the body/h1 sizes stay in bounds.
const widths = [1280, 1440, 1920, 2560];
const pages = ['/', '/projects/', '/about/', '/contact/', '/personal-projects/', '/projects/bloodscope/', '/projects/pakd/', '/projects/nutrimatch/', '/projects/tdet-scan/'];

for (const w of widths) {
  test(`type scale and overflow at ${w}px`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 1000 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const problems: string[] = [];
    for (const p of pages) {
      await page.goto(p);
      const m = await page.evaluate(() => {
        const size = (s: string) => { const e = document.querySelector(s); return e ? parseFloat(getComputedStyle(e).fontSize) : 0; };
        return { over: document.documentElement.scrollWidth - innerWidth, body: size('body'), h1: size('h1'), h2: size('h2') };
      });
      if (m.over > 0) problems.push(`${p}: horizontal overflow ${m.over}px`);
      if (m.body > 19) problems.push(`${p}: body ${m.body}px`);
      if (m.h1 > 110) problems.push(`${p}: h1 ${m.h1}px`);
      if (m.h1 > w * 0.085) problems.push(`${p}: h1 ${m.h1}px is over 8.5% of the viewport width`);
    }
    expect(problems).toEqual([]);
    await ctx.close();
  });
}
