/** Small helpers. (Copy-email and the iframe focus ring move here when the pages that use them are migrated.) */
/** Skill tags: hover and keyboard focus are pure CSS; this adds tap-to-toggle (touch browsers often don't focus buttons) and Escape / outside-tap dismissal. */
function initSkillTips() {
  const skills = Array.from(document.querySelectorAll<HTMLElement>('.skill'));
  const close = (except?: HTMLElement) => skills.forEach((s) => {
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
    (e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', () => close());
  // Keep the bubble inside the viewport: measure it at its natural spot and shift it sideways by --tip-x.
  const place = (s: HTMLElement) => {
    const tip = s.querySelector<HTMLElement>('.skill-tip')!;
    tip.style.setProperty('--tip-x', '0px');
    const box = tip.getBoundingClientRect();
    const margin = 12;
    let dx = 0;
    if (box.right > window.innerWidth - margin) dx = window.innerWidth - margin - box.right;
    if (box.left + dx < margin) dx = margin - box.left;
    tip.style.setProperty('--tip-x', `${dx}px`);
  };
  skills.forEach((s) => {
    (['pointerenter', 'focusin'] as const).forEach((type) => s.addEventListener(type, () => place(s)));
    const undismiss = () => s.classList.remove('is-dismissed');
    s.addEventListener('pointerleave', undismiss);
    s.addEventListener('focusout', undismiss);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    close();
    skills.forEach((s) => { if (s.matches(':hover, :focus-within')) s.classList.add('is-dismissed'); });
  });
}

export function initMisc() {
  initSkillTips();
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
}

/** Count-up for stat numbers (.strip-item / .metric): "17,767", "86.04%", "13" run from 0 to their value the first time they scroll into view.
 *  The original text stays in the DOM (screen readers get it) until the animation starts, and nothing runs under reduced motion. */
export function initCountUp() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.strip-item strong, .metric strong'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target as HTMLElement);
    });
  }, { threshold: 0.6 });
  const run = (el: HTMLElement) => {
    const finalText = el.textContent.trim();
    const m = finalText.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(\D*)$/);
    if (!m) return;
    const [, prefix, numText, suffix] = m;
    const value = parseFloat(numText.replace(/,/g, ''));
    const decimals = (numText.split('.')[1] || '').length;
    const grouped = numText.includes(',');
    const format = (v: number) => prefix + (grouped
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
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      visual.textContent = t < 1 ? format(value * eased) : finalText;
      if (t < 1) requestAnimationFrame(tick);
    };
    visual.textContent = format(0);
    requestAnimationFrame(tick);
  };
  targets.forEach((el) => observer.observe(el));
}
