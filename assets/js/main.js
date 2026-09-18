(() => {
  if (!window.dataLayer) {
    window.dataLayer = [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-PE6Z9FWNFP');
    const analytics = document.createElement('script');
    analytics.async = true;
    analytics.src = 'https://www.googletagmanager.com/gtag/js?id=G-PE6Z9FWNFP';
    document.head.appendChild(analytics);
  }

  const root = document.documentElement;
  const menuButton = document.querySelector('[data-menu]');
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('portfolio-theme');
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  root.dataset.theme = savedTheme || (preferredDark ? 'dark' : 'light');

  const syncThemeLabels = () => {
    const dark = root.dataset.theme === 'dark';
    themeButtons.forEach(button => button.setAttribute('aria-label', dark ? 'ใช้ธีมสว่าง' : 'ใช้ธีมมืด'));
  };
  syncThemeLabels();

  themeButtons.forEach(button => button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', root.dataset.theme);
    syncThemeLabels();
  }));

  menuButton?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.mobile-panel a').forEach(link => link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.body.classList.remove('nav-open');
      menuButton?.setAttribute('aria-expanded', 'false');
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  const filterButtons = document.querySelectorAll('[data-filter]');
  const projects = document.querySelectorAll('[data-category]');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    projects.forEach(project => {
      const categories = project.dataset.category.split(' ');
      project.hidden = filter !== 'all' && !categories.includes(filter);
    });
  }));

  const copyButton = document.querySelector('[data-copy-email]');
  const copyStatus = document.querySelector('[data-copy-status]');
  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('thanat34423@gmail.com');
      copyStatus.textContent = 'คัดลอกอีเมลแล้ว';
    } catch {
      copyStatus.textContent = 'เลือกอีเมลด้านบนแล้วกดคัดลอก';
    }
  });

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
