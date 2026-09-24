import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const require = createRequire(import.meta.url);
const KT = require('../../assets/js/keyboardtrans-core.js');
const read = (f: string) => JSON.parse(readFileSync(path.join(here, 'fixtures', f), 'utf8'));

// The 27 cases from accuracy_test.py in github.com/Thanatvij/keyboardTrans, exported as JSON.
const groups = read('keyboardtrans-cases.json') as Record<string, [string, string][]>;

test.describe('keyboardTrans core (JS port of KeyboardTran.py)', () => {
  for (const [label, cases] of Object.entries(groups)) {
    test(`${label}: ${cases.length}/${cases.length} documented cases`, () => {
      for (const [input, expected] of cases) expect(KT.fix(input).trim(), input).toBe(expected.trim());
    });
  }

  test('27 documented cases in total', () => {
    expect(Object.values(groups).flat()).toHaveLength(27);
  });

  test('matches the Python implementation on 600 random inputs', () => {
    const fuzz = read('keyboardtrans-python-fuzz.json') as [string, string][];   // [input, output of Python fix()]
    const bad = fuzz.filter(([input, python]) => KT.fix(input) !== python).map(([input]) => input);
    expect(bad).toEqual([]);
  });
});

test.describe('keyboardTrans widget on /personal-projects/', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('converts live, detects direction and copies via the Clipboard API', async ({ page }) => {
    await page.goto('/personal-projects/');
    const input = page.locator('#kt-in');
    await input.fill('l;ylfu8iy[');
    await expect(page.locator('#kt-out')).toHaveText('สวัสดีครับ');
    await expect(page.locator('#kt-mode')).toContainText('English keys → Thai');
    await page.locator('#kt-copy').click();
    await expect(page.locator('#kt-status')).toContainText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('สวัสดีครับ');
  });

  test('button mode: does not convert until asked when live is off', async ({ page }) => {
    await page.goto('/personal-projects/');
    await page.locator('#kt-live').uncheck();
    await page.locator('#kt-in').fill('l;ylfu8iy[');
    await expect(page.locator('#kt-out')).toHaveText('');
    await page.locator('#kt-convert').click();
    await expect(page.locator('#kt-out')).toHaveText('สวัสดีครับ');
  });

  test('examples, Thai→English direction and clear', async ({ page }) => {
    await page.goto('/personal-projects/');
    await page.locator('.kt-chip').nth(1).click();
    await expect(page.locator('#kt-out')).toHaveText('ok ครับเดี๋ยว check ให้');
    await expect(page.locator('#kt-mode')).toContainText('Thai characters');
    await page.locator('#kt-clear').click();
    await expect(page.locator('#kt-in')).toHaveValue('');
    await expect(page.locator('#kt-copy')).toBeDisabled();
  });

  test('is featured; Tarot is a regular card in "More builds"', async ({ page }) => {
    await page.goto('/personal-projects/');
    await expect(page.locator('#keyboardtrans')).toBeVisible();
    await expect(page.locator('#tarot')).toHaveCount(0);
    await expect(page.locator('section[aria-labelledby="more-title"] h3', { hasText: 'Tarot Web App' })).toHaveCount(1);
    await expect(page.locator('iframe[src*="tarot"]')).toHaveCount(0);
  });
});
