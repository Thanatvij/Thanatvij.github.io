/**
 * Scroll- and pointer-driven motion: GSAP + ScrollTrigger for reveal / parallax / cursor, Lenis for
 * smooth wheel scrolling. All of it sits behind media queries via gsap.matchMedia():
 *
 *   prefers-reduced-motion: reduce      → nothing here runs; CSS shows all content immediately
 *   (hover: hover) and (pointer: fine)  → Lenis smooth scroll + cursor ring + hero spotlight + card glow
 *   touch / coarse pointer              → reveal + parallax only; native scrolling, no pointer effects
 *
 * If the user flips a setting while the page is open, matchMedia reverts everything cleanly.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const $$ = <T extends HTMLElement = HTMLElement>(selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(selector));

export function initMotion() {
  const mm = gsap.matchMedia();

  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', fine: '(hover: hover) and (pointer: fine)' },
    (context) => {
      const { motion, fine } = context.conditions as { motion: boolean; fine: boolean };
      if (!motion) return;

      const cleanups: Array<() => void> = [];
      reveal();
      parallax();
      if (fine) {
        cleanups.push(smoothScroll());
        cleanups.push(pointerEffects());
      }
      // Fonts and lazy images can shift layout; recompute trigger positions once they settle.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh, { once: true });
      document.fonts?.ready.then(refresh);

      return () => cleanups.forEach((fn) => fn());
    },
  );
}

/* ---------- reveal on scroll ---------- */
function show(el: HTMLElement) {
  el.classList.add('is-in');
  gsap.set(el, { clearProps: 'opacity,transform' });
}

function reveal() {
  // Anything already scrolled past (e.g. reload mid-page) must not stay hidden.
  $$('.reveal').forEach((el) => { if (el.getBoundingClientRect().bottom < 0) show(el); });

  ScrollTrigger.batch('.reveal:not(.is-in)', {
    start: 'top 94%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: true,
          onStart() { (this.targets() as HTMLElement[]).forEach((el) => el.classList.add('is-in')); },
          onComplete() { (this.targets() as HTMLElement[]).forEach(show); },
        },
      );
    },
  });
}

/* ---------- parallax: the image drifts slower than the page, ±max px, 0 when centred in the viewport ----------
   Tweens a CSS variable (--py), so it never fights the hover `transform: scale()` on the same element. */
function parallax() {
  $$('[data-parallax]').forEach((el) => {
    const max = Number(el.dataset.parallaxMax ?? 12);
    const factor = Number(el.dataset.parallax ?? 0.06);          // px of drift per px of scroll, as before
    const range = max / factor;                                   // scroll distance over which it travels −max → +max
    gsap.fromTo(
      el,
      { '--py': `${-max}px` },
      {
        '--py': `${max}px`,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: `center center+=${range}`,
          end: `center center-=${range}`,
          scrub: true,
        },
      },
    );
  });
}

/* ---------- Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync ---------- */
function smoothScroll() {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    anchors: { offset: -80 },        // sticky header; also covers the skip link (#main)
    stopInertiaOnNavigate: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Scrolling is locked while the mobile menu is open; give it back on close.
  const onMenu = (e: Event) => ((e as CustomEvent<{ open: boolean }>).detail.open ? lenis.stop() : lenis.start());
  document.addEventListener('portfolio:menu', onMenu);

  return () => {
    document.removeEventListener('portfolio:menu', onMenu);
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}

/* ---------- precise-pointer effects: cursor ring, hero spotlight, card glow ---------- */
function pointerEffects() {
  const linkSelector = 'a[href], button, summary, label, input, select, textarea, [role="button"], [data-cursor]';

  // Cursor ring. The native cursor is never hidden; the ring is a lagging accent.
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="cursor-ring"><span class="cursor-label">Open</span></div>';
  document.body.appendChild(cursor);
  const label = cursor.querySelector<HTMLElement>('.cursor-label')!;
  const moveX = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3' });
  const moveY = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3' });

  const onMove = (e: PointerEvent) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (!cursor.classList.contains('is-active')) gsap.set(cursor, { x: e.clientX, y: e.clientY });
    moveX(e.clientX);
    moveY(e.clientY);
    cursor.classList.add('is-active');
    cursor.classList.remove('is-hidden');
  };
  const onOver = (e: PointerEvent) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const hidden = t.closest('iframe, [data-cursor="hide"]');
    const view = t.closest<HTMLElement>('[data-cursor="view"]');
    cursor.classList.toggle('is-hidden', Boolean(hidden));
    cursor.classList.toggle('is-view', Boolean(view) && !hidden);
    cursor.classList.toggle('is-link', Boolean(t.closest(linkSelector)) && !view && !hidden);
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

  // Hero spotlight: the accent dot grid follows the pointer with a little easing.
  const spotlightCleanups = $$('[data-spotlight]').map((area) => {
    const field = area.querySelector<HTMLElement>('.hero-field') ?? area;
    const box = area.getBoundingClientRect();
    gsap.set(field, { '--mx': `${box.width * 0.72}px`, '--my': `${box.height * 0.3}px` });
    const mx = gsap.quickTo(field, '--mx', { duration: 0.5, ease: 'power3' });
    const my = gsap.quickTo(field, '--my', { duration: 0.5, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      mx(e.clientX - r.left);
      my(e.clientY - r.top);
    };
    area.addEventListener('pointermove', move, { passive: true });
    return () => area.removeEventListener('pointermove', move);
  });

  // Soft glow that follows the pointer inside cards.
  const cardCleanups = $$('.card').map((card) => {
    const setX = gsap.quickSetter(card, '--px', 'px') as (v: number) => void;
    const setY = gsap.quickSetter(card, '--py', 'px') as (v: number) => void;
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      setX(e.clientX - r.left);
      setY(e.clientY - r.top);
    };
    card.addEventListener('pointermove', move, { passive: true });
    return () => card.removeEventListener('pointermove', move);
  });

  return () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    spotlightCleanups.forEach((fn) => fn());
    cardCleanups.forEach((fn) => fn());
    cursor.remove();
  };
}
