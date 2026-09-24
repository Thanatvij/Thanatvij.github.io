import { test, expect } from '@playwright/test';
import path_ from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path_.dirname(fileURLToPath(import.meta.url));

// The TutorHub cover is 1600x900 and its text lives in the safe zone x 230..1370, y 140..760 (docs/covers/tutorhub-cover.html).
// Cards draw it with object-fit: cover plus a parallax scale of 1.2 and up to +-24px (12px on phones) of travel, so
// the visible slice can be much smaller than the image. This checks that slice still contains the whole safe zone.
const W = 1600, H = 900, SAFE = { x1: 230, x2: 1370, y1: 140, y2: 760 }, PARALLAX_SCALE = 1.2;

for (const path of ['/', '/personal-projects/']) {
  for (const width of [390, 768, 1024, 1199, 1200, 1280, 1440, 1920, 2560]) {
    test(`cover text is never cropped: ${path} at ${width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(path);
      const box = await page.evaluate(() => {
        const r = document.querySelector('img[src*="tutorhub-cover"]')!.parentElement!.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      const s = Math.max(box.w / W, box.h / H) * PARALLAX_SCALE;     // source px -> screen px
      const travel = (width < 720 ? 12 : 24) / s;                    // worst-case parallax shift, in source px
      const visW = box.w / s, visH = box.h / s;
      const left = (W - visW) / 2, right = (W + visW) / 2;
      const top = (H - visH) / 2 + travel, bottom = (H + visH) / 2 - travel;
      expect(left, 'left edge').toBeLessThanOrEqual(SAFE.x1);
      expect(right, 'right edge').toBeGreaterThanOrEqual(SAFE.x2);
      expect(top, 'top edge').toBeLessThanOrEqual(SAFE.y1);
      expect(bottom, 'bottom edge').toBeGreaterThanOrEqual(SAFE.y2);
      await ctx.close();
    });
  }
}

test('the cover source keeps every text element inside the safe zone', async ({ page }) => {
  await page.goto('file://' + path_.resolve(here, '../../docs/covers/tutorhub-cover.html'));
  await page.evaluate(() => document.fonts.ready);
  const boxes = await page.evaluate(() => [...document.querySelectorAll('.top span, h1, .tag, .sub, .bottom span')].map((e) => {
    const r = e.getBoundingClientRect(); return { name: (e.textContent || '').trim().slice(0, 24), x1: r.left, x2: r.right, y1: r.top, y2: r.bottom };
  }));
  for (const b of boxes) {
    expect(b.x1, `${b.name} left`).toBeGreaterThanOrEqual(SAFE.x1 - 1);
    expect(b.x2, `${b.name} right`).toBeLessThanOrEqual(SAFE.x2 + 1);
    expect(b.y1, `${b.name} top`).toBeGreaterThanOrEqual(SAFE.y1 - 1);
    expect(b.y2, `${b.name} bottom`).toBeLessThanOrEqual(SAFE.y2 + 1);
  }
});
