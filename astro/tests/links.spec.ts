import { test, expect } from '@playwright/test';

// Every internal link, asset and #anchor on each built page must resolve (external http(s) links are only checked for shape).
const pages = ['/', '/projects/', '/about/', '/contact/', '/personal-projects/', '/projects/bloodscope/', '/projects/pakd/', '/projects/nutrimatch/', '/projects/tdet-scan/'];

for (const path of pages) {
  test(`internal links resolve: ${path}`, async ({ page, request }) => {
    await page.goto(path);
    const refs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href], img[src], link[href], script[src]')].map((el) => (el as HTMLAnchorElement).href || (el as HTMLImageElement).src));
    const base = new URL(page.url());
    const internal = [...new Set(refs.map((r) => new URL(r)).filter((u) => u.origin === base.origin))];
    expect(internal.length).toBeGreaterThan(5);
    const failures: string[] = [];
    for (const u of internal) {
      const res = await request.get(u.origin + u.pathname + u.search);
      if (!res.ok()) failures.push(`${u.pathname} → ${res.status()}`);
      if (u.hash && u.pathname === base.pathname && !(await page.locator(`[id="${decodeURIComponent(u.hash.slice(1))}"]`).count())) failures.push(`missing anchor ${u.hash}`);
    }
    expect(failures).toEqual([]);
  });

  test(`external links open safely: ${path}`, async ({ page }) => {
    await page.goto(path);
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')]
        .filter((a) => new URL(a.href).origin !== location.origin)
        .filter((a) => a.target === '_blank' && !/noopener/.test(a.rel))
        .map((a) => a.href));
    expect(bad).toEqual([]);
  });
}

test('home: featured TutorHub card links straight to the live demo', async ({ page }) => {
  await page.goto('/');
  const a = page.locator('#personal a.stretch');
  await expect(a).toHaveAttribute('href', 'https://thanatvij.github.io/TutorHub/');
  await expect(a).toHaveAttribute('target', '_blank');
  await expect(a).toHaveAttribute('rel', /noopener/);
});
