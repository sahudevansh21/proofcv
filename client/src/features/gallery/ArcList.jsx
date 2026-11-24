import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const STEP_DEG = 17;
const WHEEL_COOLDOWN_MS = 320;

/**
 * Titles that turn along an arc beside a preview of the active item.
 * Hover, wheel, arrow keys and swipe change the active item; click or Enter opens it.
 */
export function ArcList({ items, getImage, onOpen, label = 'Choose an item' }) {
  const [active, setActive] = useState(0);
  const lastWheel = useRef(0);
  const touchY = useRef(null);
  const list = useRef(null);
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const n = items.length;
  const clamp = (i) => Math.max(0, Math.min(n - 1, i));
  const move = (delta) => setActive((a) => clamp(a + delta));

  // Wheel must be non-passive so the page doesn't scroll while the arc turns, except at the ends.
  useEffect(() => {
    const el = list.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      const a = activeRef.current;
      if ((dir < 0 && a === 0) || (dir > 0 && a === n - 1)) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel.current < WHEEL_COOLDOWN_MS) return;
      lastWheel.current = now;
      setActive(Math.max(0, Math.min(n - 1, a + dir)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [n]);

  const onKeyDown = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) {
      e.preventDefault();
      move(keys[e.key]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(active);
    }
  };

  const item = items[active];

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-12">
      <div
        ref={list}
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={`arc-${active}`}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          if (touchY.current === null) return;
          const dy = touchY.current - e.changedTouches[0].clientY;
          if (Math.abs(dy) > 30) move(Math.sign(dy));
          touchY.current = null;
        }}
        className="relative h-[340px] overflow-hidden rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[#3a3550] sm:h-[460px]"
      >
        {/* The arc's guide line. */}
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
          <path d="M 2 0 Q 30 50 2 100" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        </svg>
        {items.map((it, i) => {
          const d = i - active;
          const rad = (d * STEP_DEG * Math.PI) / 180;
          const visible = Math.abs(d) <= 3;
          const x = Math.cos(rad) * 18 - 8; // % of width: furthest out when active
          const y = 50 + Math.sin(rad) * 62; // % of height
          const on = d === 0;
          return (
            <div
              key={it.key}
              id={`arc-${i}`}
              role="option"
              aria-selected={on}
              onMouseEnter={() => setActive(i)}
              onClick={() => (on ? onOpen(i) : setActive(i))}
              className="arc-item absolute left-0 top-0 w-[92%] cursor-pointer select-none"
              style={{
                transform: `translate(${x}%, -50%) translateY(0) rotate(${d * 5}deg)`,
                top: `${y}%`,
                left: '6%',
                opacity: visible ? 1 - Math.abs(d) * 0.28 : 0,
                pointerEvents: visible ? 'auto' : 'none',
                transformOrigin: 'left center',
              }}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={`font-display uppercase leading-[0.95] transition-[font-size,color] duration-300 motion-reduce:transition-none ${
                    on ? 'text-[clamp(30px,4.4vw,56px)] font-semibold' : 'text-[clamp(20px,2.6vw,32px)] font-medium opacity-80'
                  }`}
                >
                  {it.title}
                </span>
              </span>
              <span
                className={`block pl-8 font-serif text-[15px] italic transition-opacity duration-300 ${on ? 'opacity-80' : 'opacity-0'}`}
              >
                {it.subtitle}
              </span>
            </div>
          );
        })}
      </div>

      <figure className="relative">
        <button
          type="button"
          onClick={() => onOpen(active)}
          className="group block w-full bg-[#f6ead8] p-6 sm:p-10"
          aria-label={`Open ${item.title}`}
          tabIndex={-1}
        >
          <img
            key={item.key}
            src={getImage(item)}
            alt=""
            className="arc-preview mx-auto aspect-[567/763] w-full max-w-[360px] shadow-[0_24px_50px_-28px_rgba(58,53,80,.55)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
          />
        </button>
        <figcaption className="mt-4 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{item.meta}</span>
          <button
            type="button"
            onClick={() => onOpen(active)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#3a3550] px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#fff9ec] hover:bg-[#2a2640]"
          >
            Open <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </button>
        </figcaption>
      </figure>
    </div>
  );
}
