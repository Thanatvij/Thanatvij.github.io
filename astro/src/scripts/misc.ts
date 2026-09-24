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
    s.classList.toggle('is-open', open);
    (e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', () => close());
  skills.forEach((s) => {
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
