/** Existing GA4 property, initialised at idle time so it never competes with first paint. */
const GA_ID = 'G-PE6Z9FWNFP';
type W = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function initAnalytics() {
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer!.push(arguments); };
  w.gtag('js', new Date());
  w.gtag('config', GA_ID);
  const load = () => {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 4000 });
  else window.setTimeout(load, 2000);
}
