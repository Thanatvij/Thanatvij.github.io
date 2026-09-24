/**
 * Content-Security-Policy for the built site. Kept out of the content files on purpose: it is
 * security configuration, not text. Same policy the hand-written pages use today:
 * no inline scripts or styles, only same-origin assets plus Google Tag Manager / GA4.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com",
  "style-src 'self'",
  "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com",
  "media-src 'self'",
  'connect-src \'self\' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com',
  "font-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');
