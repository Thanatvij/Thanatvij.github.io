import { test, expect, type Page } from '@playwright/test';

// The strengthened motion set (Phase F): bigger reveal travel, staggering on the static pages, count-up numbers,
// hero load-in on every inner page, larger parallax, circle pop on step diagrams, stronger hover responses.
// Reduced-motion variants prove none of it runs when the visitor asks for less motion.

const matrixY = (t: string) => (t === 'none' ? 0 : Number(t.match(/matrix\(([^)]+)\)/)![1].split(',')[5]));

async function sweep(page: Page, selector: string) {
  return page.evaluate(async (sel) => {
    const el = document.querySelector(sel) as HTMLElement;
    let max = 0;
    for (let y = 0; y < document.body.scrollHeight; y += 120) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 30));
      const v = parseFloat((getComputedStyle(el).translate || '0 0').split(' ')[1] || '0');
      max = Math.max(max, Math.abs(v));
    }
    return max;
  }, selector);
}

test.describe('reveal', () => {
  for (const path of ['/', '/about/']) {
    test(`unrevealed items start 32px low on ${path}`, async ({ page }) => {
      await page.goto(path);
      const y = await page.evaluate(() => {
        const el = [...document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)')].find((e) => e.getBoundingClientRect().top > innerHeight * 1.2)!;
        return getComputedStyle(el).transform;
      });
      expect(matrixY(y)).toBeCloseTo(32, 0);
    });
  }

  test('static pages stagger items that arrive together (120 ms steps)', async ({ page }) => {
    await page.goto('/personal-projects/');
    await page.evaluate(() => {
      const w = window as unknown as { __delays: string[] };
      w.__delays = [];
      new MutationObserver((ms) => ms.forEach((m) => {
        const d = (m.target as HTMLElement).style.transitionDelay;
        if (d) w.__delays.push(d);
      })).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
    });
    await page.locator('section[aria-labelledby="more-title"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const delays = await page.evaluate(() => (window as unknown as { __delays: string[] }).__delays);
    expect(delays).toContain('120ms');
  });
});

test.describe('count-up', () => {
  test('home stats count up and end on the exact original text', async ({ page }) => {
    await page.goto('/');
    const strip = page.locator('.strip-item strong').last();
    await strip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const mid = await strip.locator('[aria-hidden="true"]').textContent();
    expect(Number(mid)).toBeLessThan(13);
    await expect(strip.locator('.sr-only')).toHaveText('13');
    await page.waitForTimeout(1400);
    await expect(strip.locator('[aria-hidden="true"]')).toHaveText('13');
  });

  test('case-study metrics keep decimals, commas and %', async ({ page }) => {
    await page.goto('/projects/bloodscope/');
    const metric = page.locator('.metric strong').first();
    await metric.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600);
    await expect(metric).toHaveText(/^86\.04%/);
  });

  test('reduced motion: numbers are never touched', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.locator('.strip-item strong').last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await page.locator('.strip-item strong .sr-only').count()).toBe(0);
    await expect(page.locator('.strip-item strong').last()).toHaveText('13');
    await ctx.close();
  });
});

test.describe('hero load-in on inner pages', () => {
  const inner = ['/projects/', '/about/', '/personal-projects/', '/projects/bloodscope/', '/projects/pakd/', '/projects/nutrimatch/', '/projects/tdet-scan/'];
  for (const path of inner) {
    test(`rises in on ${path}; not under reduced motion`, async ({ browser }) => {
      const on = await browser.newContext();
      const p1 = await on.newPage();
      await p1.goto(path);
      const name = await p1.evaluate(() => getComputedStyle(document.querySelector('.page-hero .wrap > *, .case-hero .wrap > *')!).animationName);
      expect(name).toBe('rise-lg');
      await on.close();
      const off = await browser.newContext({ reducedMotion: 'reduce' });
      const p2 = await off.newPage();
      await p2.goto(path);
      const name2 = await p2.evaluate(() => getComputedStyle(document.querySelector('.page-hero .wrap > *, .case-hero .wrap > *')!).animationName);
      expect(name2).toBe('none');
      await off.close();
    });
  }
});

test.describe('parallax range', () => {
  test('desktop cards travel well beyond the old ±12px', async ({ page }) => {
    await page.goto('/personal-projects/');
    expect(await sweep(page, '.card-media img[data-parallax]')).toBeGreaterThan(17);
  });

  test('phones get half the travel', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/personal-projects/');
    const max = await sweep(page, '.card-media img[data-parallax]');
    expect(max).toBeGreaterThan(5);
    expect(max).toBeLessThanOrEqual(12.5);
    await ctx.close();
  });

  test('case-study slide images have parallax (videos are left alone)', async ({ page }) => {
    await page.goto('/projects/tdet-scan/');
    expect(await page.locator('.case-media img[data-parallax]').count()).toBeGreaterThan(0);
    await page.goto('/projects/bloodscope/');
    expect(await page.locator('.case-media video[data-parallax]').count()).toBe(0);
  });
});

test.describe('step diagram circles', () => {
  test('pop in when their step arrives (home, Astro)', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => getComputedStyle(document.querySelector('.pipe-step:not(.is-in)')!, '::before').opacity);
    expect(before).toBe('0');
    await page.locator('.pipeline').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => [...document.querySelectorAll('.pipe-step')].map((e) => getComputedStyle(e, '::before').opacity));
    expect(after.every((o) => o === '1')).toBe(true);
  });

  test('reduced motion: circles are simply there', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const o = await page.evaluate(() => [...document.querySelectorAll('.pipe-step')].map((e) => getComputedStyle(e, '::before').opacity));
    expect(o.every((v) => v === '1')).toBe(true);
    await ctx.close();
  });
});

test.describe('hover responses', () => {
  test('event photos zoom on hover (TDET-Scan)', async ({ page }) => {
    await page.goto('/projects/tdet-scan/');
    const img = page.locator('.photo-grid img').first();
    await img.scrollIntoViewIfNeeded();
    await img.hover();
    await page.waitForTimeout(1000);
    const a = await img.evaluate((e) => parseFloat(getComputedStyle(e).transform.split('(')[1]));
    expect(a).toBeGreaterThan(1.03);
  });

  test('contact rows slide further and the arrow moves', async ({ page }) => {
    await page.goto('/contact/');
    const row = page.locator('a.contact-row').first();
    await row.hover();
    await page.waitForTimeout(500);
    expect(await row.evaluate((e) => parseFloat(getComputedStyle(e).paddingLeft))).toBeGreaterThan(14);
    expect(await row.locator('svg').evaluate((e) => getComputedStyle(e).transform)).not.toBe('none');
  });

  test('link arrows travel 5px', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('.link-arrow').first();
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await page.waitForTimeout(500);
    const m = await link.locator('svg').evaluate((e) => getComputedStyle(e).transform);
    expect(m).toContain('5, -5');
  });
});

test('keyboardTrans output flashes when the result changes', async ({ page }) => {
  await page.goto('/personal-projects/');
  await page.locator('#kt-in').fill('l;ylfu8iy[');
  await expect(page.locator('#kt-out')).toHaveClass(/is-flash/);
});
