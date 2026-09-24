const root = document.documentElement;
const colors = { light: '#f5f3ee', dark: '#0a1012' };
const store = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } },
};

export function initTheme() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]'));
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    buttons.forEach((b) => b.setAttribute('aria-label', (dark ? b.dataset.labelLight : b.dataset.labelDark) ?? ''));
    meta?.setAttribute('content', dark ? colors.dark : colors.light);
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('portfolio-theme', next);
    sync();
  }));

  // Follow the system setting until the visitor has chosen explicitly.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (store.get('portfolio-theme')) return;
    root.dataset.theme = e.matches ? 'dark' : 'light';
    sync();
  });
  sync();
}
