import { useState } from 'react';
import { CircleCheck, CircleDashed, CircleHelp, Lightbulb, Replace, TriangleAlert } from 'lucide-react';
import { countPlaceholders } from '@proofcv/shared';
import { Badge, Button, Card, Select } from '../../components/ui/index.js';
import { CopyButton } from './CopyButton.jsx';

export const VERB_GROUPS = {
  'Built something': ['Built', 'Developed', 'Engineered', 'Implemented', 'Created', 'Designed'],
  'Made it better': ['Optimized', 'Reduced', 'Improved', 'Accelerated', 'Refactored', 'Streamlined'],
  'Automated / integrated': ['Automated', 'Integrated', 'Deployed', 'Migrated', 'Configured'],
  'Analysed / researched': ['Analyzed', 'Evaluated', 'Trained', 'Visualized', 'Researched'],
  'People / events': ['Led', 'Coordinated', 'Organized', 'Mentored', 'Presented', 'Collaborated'],
};

const CHECKS = [
  ['strongVerb', 'Strong verb'],
  ['namesTool', 'Names a tool'],
  ['hasResult', 'Real result'],
  ['goodLength', '12–25 words'],
];
const STRENGTH = {
  strong: ['success', CircleCheck, 'Strong'],
  okay: ['warning', CircleDashed, 'Okay'],
  weak: ['danger', TriangleAlert, 'Weak'],
};
const TYPE_LABEL = { web: 'App / site', optimization: 'Optimisation', ml: 'ML / data', team: 'Team / event', general: 'General' };

/** Renders [placeholders] highlighted inside plain text. */
function WithPlaceholders({ text }) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="hl hl-placeholder">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function Inspector({ bullet, onApply }) {
  // The parent keys this component by bullet, so state resets when a different bullet is shown.
  const [draft, setDraft] = useState(bullet.rewrite ?? bullet.text);
  const placeholders = countPlaceholders(draft);
  const changed = draft.trim() !== bullet.text.trim() && draft.trim().length > 0;

  const swapVerb = (verb) => {
    if (!verb) return;
    setDraft((d) => d.replace(/^\s*\S+/, verb));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Before</p>
        <p className="mt-1 rounded-xl bg-surface-2 px-3 py-2.5 text-sm text-fg">{bullet.text}</p>
      </div>

      <ul className="flex flex-wrap gap-1.5" aria-label="Checklist">
        {CHECKS.map(([key, label]) => (
          <li key={key}>
            <Badge tone={bullet.checklist[key] ? 'success' : 'neutral'} icon={bullet.checklist[key] ? CircleCheck : CircleDashed}>
              <span className="sr-only">{bullet.checklist[key] ? 'Done: ' : 'Missing: '}</span>
              {label}
            </Badge>
          </li>
        ))}
      </ul>

      {bullet.issues.length > 0 && (
        <ul className="space-y-1 text-sm text-fg-muted">
          {bullet.issues.map((i) => (
            <li key={i.kind} className="flex gap-2">
              <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              {i.message}
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
        <Select label="Swap the opening verb" value="" onChange={(e) => swapVerb(e.target.value)}>
          <option value="">Choose a verb…</option>
          {Object.entries(VERB_GROUPS).map(([group, verbs]) => (
            <optgroup key={group} label={group}>
              {verbs.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </optgroup>
          ))}
        </Select>
        {bullet.questions.length > 0 && (
          <div className="rounded-xl bg-warning-soft px-3 py-2.5 text-sm text-warning-fg">
            <p className="flex items-center gap-1.5 font-semibold">
              <CircleHelp aria-hidden className="h-4 w-4" />
              Answer honestly to fill the result ({TYPE_LABEL[bullet.type]})
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px]">
              {bullet.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="bullet-after" className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          After (edit freely)
        </label>
        <textarea
          id="bullet-after"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
        <p className="mt-1.5 rounded-xl bg-primary-soft/50 px-3 py-2 text-sm leading-relaxed text-fg" aria-label="Live preview">
          <WithPlaceholders text={draft} />
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          icon={Replace}
          disabled={!changed || placeholders > 0}
          onClick={() => onApply(bullet, draft.trim())}
          title={placeholders > 0 ? 'Fill or delete the [placeholders] first' : 'Replace this bullet in your resume'}
        >
          Apply to resume
        </Button>
        <CopyButton text={draft} />
        {placeholders > 0 ? (
          <span className="text-xs font-medium text-warning-fg">
            {placeholders} placeholder{placeholders > 1 ? 's' : ''} unfilled. ProofCV never makes up numbers. Use yours, or delete the
            bracket.
          </span>
        ) : !changed ? (
          <span className="text-xs text-fg-muted">Edit the text to enable Apply.</span>
        ) : null}
      </div>
    </div>
  );
}

export function BulletInspector({ bullets, onApply }) {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, Math.max(0, bullets.length - 1));
  if (bullets.length === 0) return null;
  const current = bullets[index];

  return (
    <Card padded={false} className="overflow-hidden print-break">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-fg">Bullet inspector</h2>
        <p className="flex items-center gap-1.5 text-xs text-fg-muted">
          <Lightbulb aria-hidden className="h-3.5 w-3.5" />
          Weak bullets first. Pick one to rewrite.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <ul className="max-h-[32rem] overflow-y-auto border-b border-line p-2 lg:border-b-0 lg:border-r" aria-label="Bullets">
          {bullets.map((b, i) => {
            const [tone, Icon, label] = STRENGTH[b.strength];
            const active = i === index;
            return (
              <li key={`${b.start}-${i}`}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-current={active || undefined}
                  className={`flex w-full flex-col gap-1.5 rounded-xl px-3 py-2.5 text-left transition-colors ${active ? 'bg-primary-soft' : 'hover:bg-surface-2'}`}
                >
                  <Badge tone={tone} icon={Icon}>
                    {label}
                  </Badge>
                  <span className={`line-clamp-2 text-sm ${active ? 'text-fg' : 'text-fg-muted'}`}>{b.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="p-5">
          <Inspector key={`${current.start}-${current.text}`} bullet={current} onApply={onApply} />
        </div>
      </div>
    </Card>
  );
}

/** Ordered weakest-first so the most useful rewrite is selected by default. */
export const sortBullets = (bullets) => {
  const rank = { weak: 0, okay: 1, strong: 2 };
  return [...bullets].sort((a, b) => rank[a.strength] - rank[b.strength] || a.start - b.start);
};
