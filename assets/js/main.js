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

  /** Skill tags: hover and keyboard focus are pure CSS; this adds tap-to-toggle (touch browsers often don't focus buttons) and Escape / outside-tap dismissal. */
  const initSkillTips = () => {
    const skills = Array.from(document.querySelectorAll('.skill'));
    const close = (except) => skills.forEach((s) => {
      if (s === except) return;
      s.classList.remove('is-open');
      s.querySelector('.skill-btn')?.setAttribute('aria-expanded', 'false');
    });
    skills.forEach((s) => s.querySelector('.skill-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !s.classList.contains('is-open');
      close(s);
      place(s);
      s.classList.toggle('is-open', open);
      e.currentTarget.setAttribute('aria-expanded', String(open));
    }));
    document.addEventListener('click', () => close());
    // Keep the bubble inside the viewport: measure it at its natural spot and shift it sideways by --tip-x.
    const place = (s) => {
      const tip = s.querySelector('.skill-tip');
      tip.style.setProperty('--tip-x', '0px');
      const box = tip.getBoundingClientRect();
      const margin = 12;
      let dx = 0;
      if (box.right > window.innerWidth - margin) dx = window.innerWidth - margin - box.right;
      if (box.left + dx < margin) dx = margin - box.left;
      tip.style.setProperty('--tip-x', dx + 'px');
    };
    skills.forEach((s) => {
      ['pointerenter', 'focusin'].forEach((type) => s.addEventListener(type, () => place(s)));
      const undismiss = () => s.classList.remove('is-dismissed');
      s.addEventListener('pointerleave', undismiss);
      s.addEventListener('focusout', undismiss);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      close();
      skills.forEach((s) => { if (s.matches(':hover, :focus-within')) s.classList.add('is-dismissed'); });
    });
  };

  initSkillTips();

  /** Count-up for stat numbers (.strip-item / .metric): "17,767", "86.04%", "13" run from 0 to their value the first time they scroll into view.
   *  The original text stays in the DOM (screen readers get it) until the animation starts, and nothing runs under reduced motion. */
  const initCountUp = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const targets = Array.from(document.querySelectorAll('.strip-item strong, .metric strong'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.6 });
    const run = (el) => {
      const finalText = el.textContent.trim();
      const m = finalText.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(\D*)$/);
      if (!m) return;
      const [, prefix, numText, suffix] = m;
      const value = parseFloat(numText.replace(/,/g, ''));
      const decimals = (numText.split('.')[1] || '').length;
      const grouped = numText.includes(',');
      const format = (v) => prefix + (grouped
        ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : v.toFixed(decimals)) + suffix;
      const visual = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true');
      const reader = document.createElement('span');
      reader.className = 'sr-only';
      reader.textContent = finalText;
      el.textContent = '';
      el.append(visual, reader);
      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        visual.textContent = t < 1 ? format(value * eased) : finalText;
        if (t < 1) requestAnimationFrame(tick);
      };
      visual.textContent = format(0);
      requestAnimationFrame(tick);
    };
    targets.forEach((el) => observer.observe(el));
  };

  initCountUp();

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

  /* ---------- Reveal on scroll (items that arrive together stagger 120 ms apart, like the Astro build) ---------- */
  const revealTargets = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      const arriving = entries
        .filter(entry => entry.isIntersecting)
        .sort((x, y) => (x.boundingClientRect.top - y.boundingClientRect.top) || (x.boundingClientRect.left - y.boundingClientRect.left));
      arriving.forEach((entry, index) => {
        const element = entry.target;
        revealObserver.unobserve(element);
        if (index && !reduceMotion.matches) {
          element.style.transitionDelay = `${index * 120}ms`;
          setTimeout(() => { element.style.transitionDelay = ''; }, index * 120 + 1200);   // don't leave the delay on later hover transitions
        }
        element.classList.add('is-in');
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    revealTargets.forEach(element => revealObserver.observe(element));
  } else {
    revealTargets.forEach(element => element.classList.add('is-in'));
  }

  /* ---------- Pointer accents: hero spotlight, card glow ---------- */
  let fxActive = false;
  const cleanups = [];

  const enablePointerFx = () => {
    if (fxActive) return;
    fxActive = true;

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
    // Light touch: a short ease-out (0.5 s, quartic). `?lenis=old` restores the previous heavy setting (lerp 0.1) for comparison.
    const legacy = new URLSearchParams(location.search).get('lenis') === 'old';
    lenis = new window.Lenis({ autoRaf: false, ...(legacy ? { lerp: 0.1 } : { duration: 0.5, easing: t => 1 - Math.pow(1 - t, 4) }), smoothWheel: true, anchors: { offset: -80 }, stopInertiaOnNavigate: true });
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
        const limit = (parseFloat(element.dataset.parallaxMax) || 14) * (window.innerWidth < 720 ? 0.5 : 1);   // half the travel on phones
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
