import { test, expect } from '@playwright/test';

test.describe('keyboard & focus', () => {
  test('skip link is first tab stop and moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('every tab stop has a visible focus indicator', async ({ page }) => {
    await page.goto('/');
    const missing: string[] = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (el === document.body) return null;                      // tabbed past the last stop
        const cs = getComputedStyle(el);
        const outlined = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        return { label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40), outlined: outlined || cs.boxShadow !== 'none' };
      });
      if (!info) break;
      if (!info.outlined) missing.push(info.label);
    }
    expect(missing).toEqual([]);
  });

  test('theme toggle works by keyboard and persists', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('[data-theme-toggle]').first();
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await btn.focus(); await page.keyboard.press('Enter');
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(after).not.toBe(before);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(after);
  });

  test('mobile menu: opens, Escape/Tab behave, aria-expanded tracks state', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/');
    const toggle = page.locator('[data-menu]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.tap();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-nav a').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await ctx.close();
  });
});

test.describe('reduced motion', () => {
  test('all content is visible immediately and nothing is transformed', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('.reveal')].filter((el) => { const cs = getComputedStyle(el); return cs.opacity === '0' || cs.visibility === 'hidden'; }).length);
    expect(hidden).toBe(0);
    await expect(page.locator('.cursor, [data-cursor-ring]')).toHaveCount(0);
    await ctx.close();
  });

  test('no smooth-scroll library is driving the page', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('html.lenis')).toHaveCount(0);
    await ctx.close();
  });
});

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } });

  test('no horizontal overflow and tap targets are at least 24px', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('button, .site-header a')].filter((el) => {
        const r = el.getBoundingClientRect(); return r.width > 0 && (r.width < 24 || r.height < 24);
      }).map((el) => el.outerHTML.slice(0, 60)));
    expect(small).toEqual([]);
  });

  test('pointer-only effects are not created on touch devices', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html.lenis')).toHaveCount(0);
  });
});
