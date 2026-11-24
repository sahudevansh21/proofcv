import { useMemo, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { analyze, PRESETS, SAMPLES } from '@proofcv/shared';

const mono = 'font-mono text-[11px] uppercase tracking-[0.14em]';

/** The same sample resume before and after ProofCV, built only from real engine output. */
function useComparison() {
  return useMemo(() => {
    const sample = SAMPLES[0];
    const preset = PRESETS.find((p) => p.id === sample.presetId);
    const r = analyze(sample.resume, preset.jd);
    const rewrites = new Map(r.bullets.filter((b) => b.rewrite && b.rewrite !== b.text).map((b) => [b.text, b.rewrite]));
    const lines = sample.resume.split('\n').map((raw) => {
      const bullet = raw.match(/^\s*[-•*]\s+(.*)$/);
      if (bullet) {
        const text = bullet[1].trim();
        return { kind: 'bullet', before: text, after: rewrites.get(text) ?? text, changed: rewrites.has(text) };
      }
      const t = raw.trim();
      if (!t) return { kind: 'gap' };
      if (/^[A-Z][A-Z &/]+$/.test(t)) return { kind: 'heading', before: t, after: t };
      return { kind: 'text', before: t, after: t };
    });
    const placeholders = [...rewrites.values()].reduce((n, t) => n + (t.match(/\[[^\]]+\]/g)?.length ?? 0), 0);
    return { sample, preset, r, lines, changed: rewrites.size, placeholders };
  }, []);
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

function Sheet({ lines, side, tag }) {
  const after = side === 'after';
  return (
    <div className="h-full bg-surface px-6 py-7 sm:px-10 sm:py-9">
      <div className={`mb-5 flex ${after ? 'justify-end' : ''}`}>
        <p className={`${mono} rounded-full px-3 py-1 ${after ? 'bg-chip-on text-[#3a3550]' : 'bg-band text-fg-muted'}`}>{tag}</p>
      </div>
      <div className="font-serif text-[14.5px] leading-[1.55] text-fg sm:text-[15.5px]">
        {lines.map((l, i) => {
          if (l.kind === 'gap') return <div key={i} className="h-2.5" />;
          if (l.kind === 'heading')
            return (
              <p key={i} className="mt-1 border-b border-line pb-0.5 font-display text-[13px] font-medium uppercase tracking-[0.12em]">
                {l.before}
              </p>
            );
          if (l.kind === 'text') return <p key={i} className={i === 0 ? 'font-display text-[22px] font-semibold uppercase leading-tight' : ''}>{l.before}</p>;
          const text = after ? l.after : l.before;
          return (
            <p key={i} className="relative pl-4">
              <span aria-hidden className="absolute left-0">
                •
              </span>
              <span className={after && l.changed ? 'bg-[#fceb93]/40' : l.changed ? 'text-fg-muted' : ''}>
                {after ? <Placeholders text={text} /> : text}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

/** Drag the handle (or use the arrow keys) to wipe between the original resume and the ProofCV version. */
export function ResumeCompare() {
  const { sample, preset, r, lines, changed, placeholders } = useComparison();
  const [pos, setPos] = useState(50);
  const box = useRef(null);
  const dragging = useRef(false);

  const fromPointer = (clientX) => {
    const rect = box.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div>
      <div
        ref={box}
        className="relative cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[10px] border border-line-strong shadow-[0_30px_70px_-40px_rgba(58,53,80,.55)]"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* Both sheets share one grid cell so the box is as tall as the longer one. */}
        <div className="grid">
          <div className="col-start-1 row-start-1">
            <Sheet lines={lines} side="before" tag="Normal resume" />
          </div>
          <div className="col-start-1 row-start-1" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <Sheet lines={lines} side="after" tag="With ProofCV" />
          </div>
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-[#3a3550]" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#3a3550] bg-[#fceb93] text-[#3a3550] shadow-md">
            <MoveHorizontal className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare the normal resume with the ProofCV version"
          aria-valuetext={`${Math.round(pos)}% normal resume`}
          className="compare-range absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-line bg-line md:grid-cols-4">
        {[
          [`${changed}`, 'bullets reworded'],
          [`${r.coverage.now}% → ${r.coverage.potential}%`, 'JD keyword coverage, if the reworded skills are true'],
          [`${placeholders}`, '[N] gaps left for real numbers'],
          ['0', 'skills, tools or numbers invented'],
        ].map(([v, k]) => (
          <div key={k} className="flex flex-col bg-surface px-5 py-4">
            <dt className={`${mono} order-2 mt-2 text-fg-muted`}>{k}</dt>
            <dd className="font-display text-[30px] font-semibold leading-none">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-serif text-[15px] italic text-fg-muted">
        {sample.name}’s sample resume against the {preset.role} posting, exactly as the engine returns it. Coverage is a rule
        of thumb, not a hiring score.
      </p>
    </div>
  );
}
