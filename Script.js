// Intersection Observer for fade-up
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up, .ach-item').forEach(el => observer.observe(el));

// Hero load sequence: stagger fade-ups, then trigger the scan + detection frame
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .fade-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 120 * i);
  });
  document.body.classList.add('loaded');
});