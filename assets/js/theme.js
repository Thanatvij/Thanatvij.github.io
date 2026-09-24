/* Runs before first paint: resolves the theme and flags that JS is available.
   Kept tiny and external so the pages need no inline scripts (strict CSP). */
(function () {
  var root = document.documentElement;
  var theme = null;
  try { theme = localStorage.getItem('portfolio-theme'); } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.setAttribute('data-theme', theme);
  root.classList.add('js');
  // Safety net: if main.js never arrives, do not leave reveal-on-scroll content hidden.
  setTimeout(function () { if (!window.__portfolioReady) root.classList.remove('js'); }, 4000);
})();
