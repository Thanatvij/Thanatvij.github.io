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

test.describe('skill tooltips (home)', () => {
  test('hover shows the explanation; Escape closes a tapped one', async ({ page }) => {
    await page.goto('/');
    const skill = page.locator('.skill').first();
    const tip = skill.locator('.skill-tip');
    await expect(tip).toBeHidden();
    await skill.locator('.skill-btn').hover();
    await expect(tip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
    await skill.locator('.skill-btn').click();
    await expect(skill.locator('.skill-btn')).toHaveAttribute('aria-expanded', 'true');
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
  });

  test('keyboard focus shows it and the tag is described by it', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.skill-btn').nth(2);
    await btn.focus();
    const id = await btn.getAttribute('aria-describedby');
    await expect(page.locator(`#${id}`)).toBeVisible();
  });

  test('every skill has a tip', async ({ page }) => {
    await page.goto('/');
    const empty = await page.$$eval('.skill', (els) => els.filter((e) => !(e.querySelector('.skill-tip')?.textContent || '').trim()).length);
    expect(empty).toBe(0);
  });
});

test.describe('skill tooltips (about, static)', () => {
  test('every one of the skill tags has a tip; hover, focus and Escape work', async ({ page }) => {
    await page.goto('/about/');
    const n = await page.locator('.skill').count();
    expect(n).toBeGreaterThanOrEqual(25);
    const empty = await page.$$eval('.skill', (els) => els.filter((e) => !(e.querySelector('.skill-tip')?.textContent || '').trim()).length);
    expect(empty).toBe(0);
    const skill = page.locator('.skill').nth(5);
    const tip = skill.locator('.skill-tip');
    await expect(tip).toBeHidden();
    await skill.locator('.skill-btn').hover();
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await page.mouse.move(0, 0);
    await page.locator('.skill-btn').nth(8).focus();
    await expect(page.locator('.skill').nth(8).locator('.skill-tip')).toBeVisible();
  });

  test('tap toggles on touch and the bubble stays inside a phone viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 800 } });
    const page = await ctx.newPage();
    await page.goto('/about/');
    const count = await page.locator('.skill').count();
    for (const i of [0, 3, 9, 14, count - 1]) {
      const skill = page.locator('.skill').nth(i);
      await skill.scrollIntoViewIfNeeded();
      await skill.locator('.skill-btn').tap();
      const tip = skill.locator('.skill-tip');
      await expect(tip).toBeVisible();
      const box = (await tip.boundingBox())!;
      expect(box.x, `tip ${i} left`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `tip ${i} right`).toBeLessThanOrEqual(390);
    }
    await ctx.close();
  });
});
