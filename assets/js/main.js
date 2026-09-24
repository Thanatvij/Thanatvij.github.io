/* Portfolio behaviour: theme, menu, reveal, pointer accents, parallax, case-study helpers.
   Everything here is an enhancement — pages are fully readable and navigable without it. */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');
  window.__portfolioReady = true;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktopNav = window.matchMedia('(min-width: 1024px)');
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } }
  };

  /* ---------- Analytics (existing GA4 property), loaded when the browser is idle ---------- */
  const GA_ID = 'G-PE6Z9FWNFP';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const loadAnalytics = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(loadAnalytics, { timeout: 4000 });
  else window.setTimeout(loadAnalytics, 2000);

  /* ---------- Theme ---------- */
  const themeButtons = $$('[data-theme-toggle]');
  const themeMeta = $('meta[name="theme-color"]');
  const themeColors = { light: '#f5f3ee', dark: '#0a1012' };
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    themeButtons.forEach(button => button.setAttribute('aria-label', dark ? 'ใช้ธีมสว่าง' : 'ใช้ธีมมืด'));
    if (themeMeta) themeMeta.setAttribute('content', themeColors[dark ? 'dark' : 'light']);
  };
  themeButtons.forEach(button => button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('portfolio-theme', next);
    syncTheme();
  }));
  // Follow the system setting until the visitor makes an explicit choice.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (store.get('portfolio-theme')) return;
    root.dataset.theme = event.matches ? 'dark' : 'light';
    syncTheme();
  });
  syncTheme();

  /* ---------- Mobile menu ---------- */
  const menuButton = $('[data-menu]');
  const inertTargets = $$('main, .site-footer');
  const setMenu = open => {
    if (!menuButton) return;
    document.body.classList.toggle('nav-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
    inertTargets.forEach(element => { element.inert = open; });
    document.dispatchEvent(new CustomEvent('portfolio:menu', { detail: { open } }));
  };
  menuButton?.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
  $$('.site-nav a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      setMenu(false);
      menuButton?.focus();
    }
  });
  desktopNav.addEventListener('change', event => { if (event.matches) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    revealTargets.forEach(element => revealObserver.observe(element));
  } else {
    revealTargets.forEach(element => element.classList.add('is-in'));
  }

  /* ---------- Pointer accents: cursor ring, hero spotlight, card glow ---------- */
  let fxActive = false;
  const cleanups = [];
  const linkSelector = 'a[href], button, summary, label, input, select, textarea, [role="button"], [data-cursor]';

  const enablePointerFx = () => {
    if (fxActive) return;
    fxActive = true;

    // Cursor ring (the native cursor stays visible; the ring is a lagging accent).
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<div class="cursor-ring"><span class="cursor-label">Open</span></div>';
    document.body.appendChild(cursor);
    const label = $('.cursor-label', cursor);
    let targetX = 0, targetY = 0, x = 0, y = 0, running = false;
    const tick = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2) requestAnimationFrame(tick);
      else running = false;
    };
    const onMove = event => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      if (!cursor.classList.contains('is-active')) { x = targetX = event.clientX; y = targetY = event.clientY; }
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('is-active');
      cursor.classList.remove('is-hidden');
      if (!running) { running = true; requestAnimationFrame(tick); }
    };
    const onOver = event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const hidden = target.closest('iframe, [data-cursor="hide"]');
      const view = target.closest('[data-cursor="view"]');
      cursor.classList.toggle('is-hidden', Boolean(hidden));
      cursor.classList.toggle('is-view', Boolean(view) && !hidden);
      cursor.classList.toggle('is-link', Boolean(target.closest(linkSelector)) && !view && !hidden);
      if (view) label.textContent = view.getAttribute('data-cursor-label') || 'Open';
    };
    const onDown = () => cursor.classList.add('is-down');
    const onUp = () => cursor.classList.remove('is-down');
    const onLeave = () => cursor.classList.add('is-hidden');
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cursor.remove();
    });

    // Hero spotlight (dot-grid highlight that follows the pointer).
    $$('[data-spotlight]').forEach(area => {
      const field = $('.hero-field', area) || area;
      let frame = 0, px = 0, py = 0;
      const paint = () => {
        frame = 0;
        const box = area.getBoundingClientRect();
        field.style.setProperty('--mx', `${px - box.left}px`);
        field.style.setProperty('--my', `${py - box.top}px`);
      };
      const move = event => { px = event.clientX; py = event.clientY; if (!frame) frame = requestAnimationFrame(paint); };
      area.addEventListener('pointermove', move, { passive: true });
      cleanups.push(() => area.removeEventListener('pointermove', move));
    });

    // Soft glow that follows the pointer inside cards.
    $$('.card').forEach(card => {
      let frame = 0, px = 0, py = 0;
      const paint = () => {
        frame = 0;
        const box = card.getBoundingClientRect();
        card.style.setProperty('--px', `${px - box.left}px`);
        card.style.setProperty('--py', `${py - box.top}px`);
      };
      const move = event => { px = event.clientX; py = event.clientY; if (!frame) frame = requestAnimationFrame(paint); };
      card.addEventListener('pointermove', move, { passive: true });
      cleanups.push(() => card.removeEventListener('pointermove', move));
    });
  };
  const disablePointerFx = () => {
    fxActive = false;
    while (cleanups.length) cleanups.pop()();
  };
  const syncPointerFx = () => {
    if (finePointer.matches && !reduceMotion.matches) enablePointerFx();
    else disablePointerFx();
  };
  syncPointerFx();
  finePointer.addEventListener('change', syncPointerFx);
  reduceMotion.addEventListener('change', syncPointerFx);

  /* ---------- Smooth wheel scrolling (Lenis, vendored in assets/js/vendor) ----------
     Same rules as the Astro build: precise pointer only, never with reduced motion, torn down if either changes. */
  let lenis = null, lenisFrame = 0, lenisLoading = false;
  const lenisTick = time => { lenis.raf(time); lenisFrame = requestAnimationFrame(lenisTick); };
  const onMenuLock = event => { if (lenis) event.detail.open ? lenis.stop() : lenis.start(); };
  const startLenis = () => {
    if (lenis || !window.Lenis) return;
    lenis = new window.Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, anchors: { offset: -80 }, stopInertiaOnNavigate: true });
    lenisFrame = requestAnimationFrame(lenisTick);
    document.addEventListener('portfolio:menu', onMenuLock);
  };
  const stopLenis = () => {
    if (!lenis) return;
    cancelAnimationFrame(lenisFrame);
    document.removeEventListener('portfolio:menu', onMenuLock);
    lenis.destroy();
    lenis = null;
  };
  const syncLenis = () => {
    if (!(finePointer.matches && !reduceMotion.matches)) { stopLenis(); return; }
    if (window.Lenis) { startLenis(); return; }
    if (lenisLoading) return;
    lenisLoading = true;
    const own = document.querySelector('script[src$="assets/js/main.js"]');
    const script = document.createElement('script');
    script.src = own ? own.src.replace(/main\.js(\?.*)?$/, 'vendor/lenis.min.js') : '/assets/js/vendor/lenis.min.js';
    script.onload = () => { lenisLoading = false; if (finePointer.matches && !reduceMotion.matches) startLenis(); };
    script.onerror = () => { lenisLoading = false; };
    document.head.appendChild(script);
  };
  syncLenis();
  finePointer.addEventListener('change', syncLenis);
  reduceMotion.addEventListener('change', syncLenis);

  /* ---------- Parallax (small, only while visible; uses the independent `translate` property) ---------- */
  const parallaxItems = $$('[data-parallax]');
  if (parallaxItems.length && 'IntersectionObserver' in window) {
    const visible = new Set();
    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      visible.forEach(element => {
        const box = element.getBoundingClientRect();
        const factor = parseFloat(element.dataset.parallax) || 0.05;
        const limit = parseFloat(element.dataset.parallaxMax) || 14;
        const offset = Math.max(-limit, Math.min(limit, (middle - (box.top + box.height / 2)) * factor));
        element.style.translate = `0 ${offset.toFixed(1)}px`;
      });
    };
    const request = () => { if (!frame && !reduceMotion.matches) frame = requestAnimationFrame(update); };
    const parallaxObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      request();
    });
    parallaxItems.forEach(element => parallaxObserver.observe(element));
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) parallaxItems.forEach(element => { element.style.translate = ''; });
      else request();
    });
  }

  /* ---------- Case study: reading progress + table-of-contents highlight ---------- */
  const progress = $('[data-progress]');
  if (progress) {
    let frame = 0;
    const paint = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0})`;
    };
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(paint); }, { passive: true });
    paint();
  }
  const tocLinks = $$('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const sections = tocLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
    const tocObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(section => tocObserver.observe(section));
  }

  /* ---------- Keyboard focus ring for embedded demos (iframes do not match :focus-visible / :focus-within) ---------- */
  const embeds = $$('.live-embed');
  if (embeds.length) {
    let usingKeyboard = false;
    document.addEventListener('keydown', () => { usingKeyboard = true; }, true);
    document.addEventListener('pointerdown', () => { usingKeyboard = false; }, true);
    window.addEventListener('blur', () => {
      window.setTimeout(() => {
        embeds.forEach(embed => embed.classList.toggle('has-focus', usingKeyboard && embed.contains(document.activeElement)));
      }, 0);
    });
    window.addEventListener('focus', () => embeds.forEach(embed => embed.classList.remove('has-focus')));
  }

  /* ---------- Copy email ---------- */
  const copyButton = $('[data-copy-email]');
  const copyStatus = $('[data-copy-status]');
  copyButton?.addEventListener('click', async () => {
    const address = copyButton.getAttribute('data-copy-email');
    try {
      await navigator.clipboard.writeText(address);
      copyStatus.textContent = 'คัดลอกอีเมลแล้ว';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#email-address'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = 'เลือกอีเมลไว้แล้ว กด Ctrl/⌘ + C เพื่อคัดลอก';
    }
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
})();
