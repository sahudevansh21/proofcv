import { useEffect, useState } from 'react';
import { countPlaceholders } from '@proofcv/shared';
import CopyButton from './CopyButton.jsx';

const CHECKS = [
  ['strongVerb', 'Strong verb'],
  ['namesTool', 'Names a tool'],
  ['hasResult', 'Real result'],
  ['goodLength', '12–25 words'],
];

const STRENGTH = {
  strong: 'bg-emerald-100 text-emerald-800',
  okay: 'bg-amber-100 text-amber-800',
  weak: 'bg-rose-100 text-rose-800',
};

function BulletCard({ bullet, onApply }) {
  const [draft, setDraft] = useState(bullet.rewrite ?? bullet.text);
  useEffect(() => setDraft(bullet.rewrite ?? bullet.text), [bullet.rewrite, bullet.text]);
  const placeholders = countPlaceholders(draft);
  const changed = draft.trim() !== bullet.text.trim();

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${STRENGTH[bullet.strength]}`}>{bullet.strength}</span>
        <p className="min-w-0 flex-1 text-sm text-slate-700"><span className="text-slate-400">Before: </span>{bullet.text}</p>
      </div>

      <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Checklist">
        {CHECKS.map(([key, label]) => (
          <li
            key={key}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${bullet.checklist[key] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
          >
            {bullet.checklist[key] ? '✓' : '○'} {label}
          </li>
        ))}
      </ul>

      {bullet.issues.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-slate-600">
          {bullet.issues.map((i) => <li key={i.kind}>{i.message}</li>)}
        </ul>
      )}

      {(bullet.rewrite || bullet.strength !== 'strong') && (
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-500" htmlFor={`after-${bullet.start}`}>
            After (edit it; replace every [bracket] with a true detail or delete it)
          </label>
          <textarea
            id={`after-${bullet.start}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-indigo-50/40 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          {bullet.questions.length > 0 && (
            <div className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Answer honestly to fill the result: </span>
              {bullet.questions.join(' · ')}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!changed || placeholders > 0}
              onClick={() => onApply(bullet, draft.trim())}
              className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 no-print"
              title={placeholders > 0 ? 'Fill or remove the [placeholders] first' : 'Replace this bullet in your resume'}
            >
              Apply to resume
            </button>
            <CopyButton text={draft} />
            {placeholders > 0 && (
              <span className="text-xs font-medium text-amber-700">
                {placeholders} placeholder{placeholders > 1 ? 's' : ''} to fill. ProofCV never makes up numbers.
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export default function BulletAudit({ bullets, onApply }) {
  if (bullets.length === 0) return null;
  return (
    <ul className="space-y-3">
      {bullets.map((b) => <BulletCard key={`${b.start}-${b.text}`} bullet={b} onApply={onApply} />)}
    </ul>
  );
}
