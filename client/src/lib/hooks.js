import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Returns `value` after it has stopped changing for `delay` ms. */
export function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Animates a number towards `target` (returns `target` directly when the user prefers reduced motion). */
export function useCountUp(target, duration = 600) {
  const reduce = prefersReducedMotion();
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduce) {
      from.current = target;
      return undefined;
    }
    const start = performance.now();
    const origin = from.current;
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(origin + (target - origin) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduce]);
  return reduce ? target : value;
}


export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ProofCV` : 'ProofCV: Sharper resume. Zero fiction.';
  }, [title]);
}

export const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
