import { defineConfig } from '@playwright/test';

// Tests run against the built site (./dist) served by the merged preview server (dist first, legacy repo root as fallback).
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: { baseURL: 'http://localhost:4399', locale: 'th-TH' },
  webServer: {
    command: 'npm run build && node scripts/serve-merged.mjs',
    url: 'http://localhost:4399/',
    env: { PORT: '4399' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
