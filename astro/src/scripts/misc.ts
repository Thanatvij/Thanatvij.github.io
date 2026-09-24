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
