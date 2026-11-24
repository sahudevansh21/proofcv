import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleHelp, CircleSlash, Gauge, PenLine } from 'lucide-react';
import { analyze, PRESETS, SAMPLES } from '@proofcv/shared';

const VISIBLE = 5;
const INTERVAL_MS = 2400;

const KINDS = {
  matched: { icon: CircleCheck, tone: 'bg-success-soft text-success-fg', label: 'Matched' },
  reworded: { icon: CircleHelp, tone: 'bg-warning-soft text-warning-fg', label: 'Worded differently' },
  missing: { icon: CircleSlash, tone: 'bg-danger-soft text-danger-fg', label: 'Not claimed' },
  rewrite: { icon: PenLine, tone: 'bg-chip-on text-[#3a3550]', label: 'Rewrite' },
  coverage: { icon: Gauge, tone: 'bg-band text-fg', label: 'Coverage' },
};

/** Builds the feed from real engine output on the four sample resumes, interleaved so kinds alternate. */
function buildEvents() {
  const perSample = SAMPLES.map((sample) => {
    const preset = PRESETS.find((p) => p.id === sample.presetId);
    const r = analyze(sample.resume, preset.jd);
    const first = sample.name.split(' ')[0];
    const events = [];
    const pick = (status) => r.skills.filter((s) => s.status === status);
    for (const s of pick('reworded').slice(0, 2)) {
      events.push({ kind: 'reworded', title: `“${s.resumeTerms[0]}” counts as ${s.name}`, meta: `${first}’s resume · ${preset.role}` });
    }
    for (const s of pick('matched').slice(0, 2)) {
      events.push({ kind: 'matched', title: `${s.name} found, word for word`, meta: `${first}’s resume · ${preset.role}` });
    }
    const bullet = r.bullets.find((b) => b.rewrite && b.startsWeak) ?? r.bullets.find((b) => b.rewrite);
    if (bullet) events.push({ kind: 'rewrite', title: bullet.rewrite, meta: `${first}’s bullet, real number left for them to fill` });
    for (const s of pick('missing').slice(0, 1)) {
      events.push({ kind: 'missing', title: `${s.name} not found, so it isn’t suggested`, meta: `${first} decides if it’s true` });
    }
    events.push({
      kind: 'coverage',
      title: `${r.coverage.now}% now → ${r.coverage.potential}% after rewording true skills`,
      meta: `${first}’s JD keyword coverage · rule of thumb`,
    });
    return events;
  });
  // Round-robin across kinds (each kind cycling through the samples) so neighbouring cards differ.
  const order = ['reworded', 'rewrite', 'matched', 'coverage', 'missing'];
  const buckets = order.map((kind) => perSample.flatMap((events) => events.filter((e) => e.kind === kind)));
  const out = [];
  for (let i = 0; buckets.some((b) => b[i]); i++) for (const b of buckets) if (b[i]) out.push(b[i]);
  return out.map((e, i) => ({ ...e, id: i }));
}

function Placeholders({ text }) {
  return text.split(/(\[[^\]]+\])/).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="hl-placeholder">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** A feed of cards that slide in at the top while older ones settle downward. Pauses on hover, off-screen and with reduced motion. */
export function LiveFeed() {
  const events = useMemo(() => buildEvents(), []);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [items, setItems] = useState(() => events.slice(0, VISIBLE).map((e, i) => ({ ...e, key: `k${i}` })));
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const cursor = useRef(VISIBLE);
  const root = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || !visible) return undefined;
    const t = setInterval(() => {
      const next = events[cursor.current % events.length];
      const key = `k${cursor.current}`;
      cursor.current += 1;
      setItems((list) => [{ ...next, key }, ...list].slice(0, VISIBLE));
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [events, reduced, paused, visible]);

  return (
    <div ref={root} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative">
      <ul className="flex flex-col gap-3" aria-label="Examples from the sample audits">
        {items.map((e, i) => {
          const k = KINDS[e.kind];
          return (
            <li
              key={e.key}
              className="feed-card flex items-start gap-4 rounded-[10px] border border-line bg-surface p-4 shadow-[0_10px_30px_-22px_rgba(58,53,80,.5)]"
              style={{ opacity: 1 - i * 0.14, transform: `scale(${1 - i * 0.02})` }}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${k.tone}`}>
                <k.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg-subtle">{k.label}</p>
                <p className="mt-0.5 line-clamp-2 font-serif text-[17px] leading-snug text-fg">
                  <Placeholders text={e.title} />
                </p>
                <p className="mt-1 font-serif text-[14px] italic text-fg-muted">{e.meta}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
