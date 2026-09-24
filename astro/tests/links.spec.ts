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

test('personal-projects: TutorHub embed points at the live site and the CSP allows it', async ({ page }) => {
  await page.goto('/personal-projects/');
  await expect(page.locator('iframe[title^="TutorHub"]')).toHaveAttribute('src', 'https://thanatvij.github.io/TutorHub/');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toMatch(/frame-src[^;]*https:\/\/thanatvij\.github\.io/);
});

test('the TutorHub links are all the live-site URL', async ({ page }) => {
  for (const p of ['/', '/personal-projects/']) {
    await page.goto(p);
    const hrefs = await page.$$eval('a[href*="TutorHub"]:not([href*="github.com"])', (as) => as.map((a) => (a as HTMLAnchorElement).href));
    expect(hrefs.length, p).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).toBe('https://thanatvij.github.io/TutorHub/');
  }
});

test('every embedded iframe is allowed by that page\'s frame-src', async ({ page }) => {
  await page.goto('/personal-projects/');
  const csp = (await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'))!;
  const frameSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('frame-src'))!;
  const srcs = await page.$$eval('iframe', (fs) => fs.map((f) => (f as HTMLIFrameElement).src));
  expect(srcs.length).toBe(2);
  for (const src of srcs) {
    const origin = new URL(src).origin;
    const ok = (origin === new URL(page.url()).origin && frameSrc.includes("'self'")) || frameSrc.includes(origin);
    expect(ok, src).toBe(true);
  }
});
