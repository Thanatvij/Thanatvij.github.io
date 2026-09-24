/** Mobile menu: the same <nav> becomes a full-height sheet under 1024px. Announces open/close for Lenis. */
export function initMenu() {
  const button = document.querySelector<HTMLButtonElement>('[data-menu]');
  const inertTargets = Array.from(document.querySelectorAll<HTMLElement>('main, .site-footer'));
  const desktop = window.matchMedia('(min-width: 1024px)');
  if (!button) return;

  const set = (open: boolean) => {
    document.body.classList.toggle('nav-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', (open ? button.dataset.labelClose : button.dataset.labelOpen) ?? '');
    inertTargets.forEach((el) => { el.inert = open; });
    document.dispatchEvent(new CustomEvent('portfolio:menu', { detail: { open } }));
  };

  button.addEventListener('click', () => set(!document.body.classList.contains('nav-open')));
  document.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { set(false); button.focus(); }
  });
  desktop.addEventListener('change', (e) => { if (e.matches) set(false); });
}
