import { useMemo, useState } from 'react';

/** Splits text into plain and highlighted segments. Ranges must be sorted and non-overlapping. */
function toSegments(text, ranges) {
  const out = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor || r.end > text.length) continue;
    if (r.start > cursor) out.push({ text: text.slice(cursor, r.start) });
    out.push({ text: text.slice(r.start, r.end), kind: r.kind, label: r.label });
    cursor = r.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}

export default function TextPane({ id, label, hint, value, onChange, highlights, legend, placeholder }) {
  const [mode, setMode] = useState('edit');
  const segments = useMemo(() => toSegments(value, highlights), [value, highlights]);
  const showHighlights = mode === 'highlight' && value.trim().length > 0;

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-slate-800">{label}</label>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium no-print" role="tablist" aria-label={`${label} view`}>
          {['edit', 'highlight'].map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 capitalize transition ${mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {m === 'edit' ? 'Edit' : 'Highlights'}
            </button>
          ))}
        </div>
      </header>

      {showHighlights ? (
        <div
          className="h-[26rem] overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-6 text-slate-800"
          onDoubleClick={() => setMode('edit')}
          title="Double-click to edit"
        >
          {segments.map((seg, i) => (seg.kind
            ? <mark key={i} className={`hl-${seg.kind} cursor-help`} title={seg.label}>{seg.text}</mark>
            : <span key={i}>{seg.text}</span>))}
        </div>
      ) : (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck="false"
          className="h-[26rem] resize-none rounded-b-xl px-4 py-3 font-mono text-[13px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:bg-indigo-50/30"
        />
      )}

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
        <span>{value.length.toLocaleString()} chars</span>
        {mode === 'highlight' && legend.map((l) => (
          <span key={l.kind} className="flex items-center gap-1"><mark className={`hl-${l.kind} px-1`}>{l.sample}</mark>{l.text}</span>
        ))}
      </footer>
    </section>
  );
}
