// Inertial page scrolling for mouse wheels and trackpads: the wheel sets a target and the page eases toward it.
// Keyboard, scrollbar dragging, touch and programmatic scrolls stay native. Widgets that handle the wheel
// themselves (the 3D gallery, the arc list) call preventDefault, and nested scroll areas keep their own scrolling.

const EASE = 0.12; // share of the remaining distance covered each frame

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

/** True if the wheel event should scroll an element between the target and the page instead of the page. */
function nestedCanScroll(target, dy) {
  for (let el = target; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.closest?.('[data-native-scroll]')) return true;
    const { overflowY } = getComputedStyle(el);
    if (!/(auto|scroll|overlay)/.test(overflowY) || el.scrollHeight <= el.clientHeight) continue;
    if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
  }
  return false;
}

export function initSmoothScroll() {
  if (typeof window === 'undefined' || window.__proofcvSmooth) return;
  window.__proofcvSmooth = true;

  let target = window.scrollY;
  let current = window.scrollY;
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const step = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo({ top: current, behavior: 'instant' });
    frame = current === target ? 0 : requestAnimationFrame(step);
  };

  window.addEventListener(
    'wheel',
    (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || reducedMotion()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // horizontal swipes stay native
      if (maxScroll() <= 0 || nestedCanScroll(e.target, e.deltaY)) return;
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
      if (!frame) current = target = window.scrollY;
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
      e.preventDefault();
      if (!frame) frame = requestAnimationFrame(step);
    },
    { passive: false },
  );

  // Anything else that moves the page (keys, scrollbar, links, route changes) wins over an animation in flight.
  const interrupt = () => frame && stop();
  window.addEventListener('keydown', interrupt);
  window.addEventListener('pointerdown', interrupt);
  window.addEventListener('touchstart', interrupt, { passive: true });
  window.addEventListener('popstate', interrupt);
  const push = history.pushState;
  history.pushState = function pushState(...args) {
    interrupt();
    return push.apply(this, args);
  };
}
