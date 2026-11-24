import { useMemo, useState } from 'react';
import { Highlighter, PenLine } from 'lucide-react';
import { Tabs } from '../../components/ui/index.js';

/** Splits text into plain and highlighted segments. Ranges are sorted and non-overlapping. */
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

const LEGEND_ICON = { matched: '✓', reworded: '≈', missing: '✕', weak: '!', placeholder: '[ ]' };

export function EditorPane({ id, title, hint, value, analysedValue, onChange, highlights, legend, placeholder, actions }) {
  const [mode, setMode] = useState('edit');
  // Highlights belong to the last analysed text; only render them when it matches what's on screen.
  const segments = useMemo(
    () => (analysedValue === value ? toSegments(value, highlights) : [{ text: value }]),
    [value, analysedValue, highlights],
  );
  const showHighlights = mode === 'highlight' && value.trim().length > 0;

  return (
    <section aria-labelledby={`${id}-title`} className="flex min-h-0 flex-col rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-sm font-semibold text-fg"><label htmlFor={id}>{title}</label></h2>
          <p className="truncate text-xs text-fg-muted">{hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Tabs
            size="sm"
            label={`${title} view`}
            value={mode}
            onChange={setMode}
            tabs={[{ value: 'edit', label: 'Edit', icon: PenLine }, { value: 'highlight', label: 'Highlights', icon: Highlighter }]}
          />
        </div>
      </header>

      {showHighlights ? (
        <div
          className="h-[min(60vh,30rem)] overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[13px] leading-6 text-fg"
          onDoubleClick={() => setMode('edit')}
        >
          {segments.map((seg, i) => (seg.kind
            ? <mark key={i} className={`hl hl-${seg.kind}`} title={seg.label}>{seg.text}</mark>
            : <span key={i}>{seg.text}</span>))}
        </div>
      ) : (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck="false"
          className="h-[min(60vh,30rem)] resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-fg outline-none placeholder:text-fg-subtle focus:bg-primary-soft/30"
        />
      )}

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-2 text-[11px] text-fg-muted">
        <span className="tabular-nums">{value.length.toLocaleString()} chars</span>
        {mode === 'highlight' ? legend.map((l) => (
          <span key={l.kind} className="flex items-center gap-1">
            <mark className={`hl hl-${l.kind}`}>{LEGEND_ICON[l.kind]} {l.sample}</mark>{l.text}
          </span>
        )) : value.trim() && <span>Switch to <b>Highlights</b> to see what was found. Hover a highlight for tips.</span>}
      </footer>
    </section>
  );
}
