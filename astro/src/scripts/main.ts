/**
 * Client entry, bundled by Vite into one external module (no inline script, so the strict CSP holds).
 * Everything here is an enhancement: the page is complete and navigable without it.
 */
import { initTheme } from './theme';
import { initMenu } from './menu';
import { initAnalytics } from './analytics';
import { initMisc, initCountUp } from './misc';
import { initMotion } from './motion';

// theme.js (blocking, in <head>) removes the `.js` flag after 4 s if this file never arrives.
(window as unknown as { __portfolioReady?: boolean }).__portfolioReady = true;
document.documentElement.classList.add('js');

initTheme();
initMenu();
initAnalytics();
initMisc();
initCountUp();
initMotion();
