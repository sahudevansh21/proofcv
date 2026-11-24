import { useState } from 'react';
import { CircleCheck, CircleX, ClipboardList, Info, Search, Star } from 'lucide-react';
import { Badge, Card, EmptyState, ProgressRing, Tabs } from '../../components/ui/index.js';
import { useCountUp } from '../../lib/hooks.js';
import { CopyButton } from './CopyButton.jsx';

function CountStat({ value, label, tone, icon: Icon }) {
  const shown = useCountUp(value);
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5">
      <Icon aria-hidden className={`h-5 w-5 shrink-0 ${tone}`} />
      <div>
        <p className="text-lg font-bold leading-none tabular-nums text-fg">{shown}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-fg-muted">{label}</p>
      </div>
    </div>
  );
}

export function CoveragePanel({ coverage, bulletStats }) {
  if (!coverage) {
    return (
      <Card className="flex h-full items-center">
        <EmptyState icon={Search} title="Add a job description" className="w-full border-0 py-6">
          Paste a posting or pick a role preset to see JD keyword coverage.
        </EmptyState>
      </Card>
    );
  }
  const gain = coverage.potential - coverage.now;
  return (
    <Card className="print-break">
      <h2 className="text-sm font-semibold text-fg">JD keyword coverage</h2>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
        <ProgressRing value={coverage.now} secondary={coverage.potential} label="Coverage now" size={156} />
        <div className="w-full space-y-3">
          <div>
            <p className="flex items-center gap-2 text-sm text-fg">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-success" />
              Coverage now
              <b className="ml-auto tabular-nums">{coverage.now}%</b>
            </p>
            <p className="text-xs text-fg-muted">Exact matches only.</p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm text-fg">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-warning" />
              After rewording true skills
              <b className="ml-auto tabular-nums">{coverage.potential}%</b>
            </p>
            <p className="text-xs text-fg-muted">
              {gain > 0 ? `+${gain} points by using the posting's words for skills you really have.` : 'Nothing to reword.'}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <CountStat value={coverage.matched} label="Already in resume" tone="text-success" icon={CircleCheck} />
        <CountStat value={coverage.reworded} label="Worded differently" tone="text-warning-fg" icon={Search} />
        <CountStat value={coverage.missing} label="Not found" tone="text-danger" icon={CircleX} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-fg-muted">
        <div>
          <dd className="text-sm font-semibold tabular-nums text-fg">
            {bulletStats.strongVerb}/{bulletStats.total}
          </dd>
          <dt>strong openers</dt>
        </div>
        <div>
          <dd className="text-sm font-semibold tabular-nums text-fg">
            {bulletStats.withMetric}/{bulletStats.total}
          </dd>
          <dt>with a result</dt>
        </div>
        <div>
          <dd className="text-sm font-semibold tabular-nums text-fg">
            {bulletStats.strong}/{bulletStats.total}
          </dd>
          <dt>strong bullets</dt>
        </div>
      </dl>
      <p className="mt-4 flex gap-1.5 text-[11px] leading-snug text-fg-subtle">
        <Info aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />A rule of thumb for this one posting, using ProofCV&apos;s own dictionary
        and weights. Not an ATS score, and it doesn&apos;t predict any hiring decision.
      </p>
    </Card>
  );
}

const BUCKETS = {
  matched: { label: 'Already in resume', icon: CircleCheck, tone: 'success', blurb: 'Same wording as the posting.' },
  reworded: {
    label: 'Worded differently',
    icon: Search,
    tone: 'warning',
    blurb: "Related wording is already in your resume. Use the posting's term only if it describes what you really did.",
  },
  missing: { label: 'Not found', icon: CircleX, tone: 'danger', blurb: "Real gaps. Don't claim these unless they're true." },
};
const LEVEL = { required: 'Required', standard: 'Listed', preferred: 'Nice to have' };

export function SkillsPanel({ skills }) {
  const [tab, setTab] = useState('reworded');
  if (skills.length === 0) return null;
  const items = skills.filter((s) => s.status === tab);
  const b = BUCKETS[tab];
  return (
    <Card className="print-break">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-fg">Skills in this posting</h2>
        <span className="flex items-center gap-1 text-xs text-fg-muted">
          <Star aria-hidden className="h-3.5 w-3.5" /> = required
        </span>
      </div>
      <Tabs
        className="mt-3 w-full"
        label="Skill buckets"
        value={tab}
        onChange={setTab}
        tabs={Object.entries(BUCKETS).map(([value, x]) => ({
          value,
          label: x.label,
          icon: x.icon,
          count: skills.filter((s) => s.status === value).length,
          panelId: 'skills-panel',
        }))}
      />
      <div id="skills-panel" role="tabpanel" className="mt-3">
        <p className="text-xs text-fg-muted">{b.blurb}</p>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-fg-subtle">Nothing here.</p>
        ) : tab === 'matched' ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {items.map((s) => (
              <li key={s.name}>
                <Badge tone="success" icon={s.level === 'required' ? Star : CircleCheck} title={s.advice}>
                  {s.name}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            {items.map((s) => (
              <li key={s.name} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={b.tone} icon={b.icon}>
                    {s.name}
                  </Badge>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${s.level === 'required' ? 'text-fg' : 'text-fg-subtle'}`}
                  >
                    {s.level === 'required' && <Star aria-hidden className="mr-0.5 inline h-3 w-3" />}
                    {LEVEL[s.level]}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{s.advice}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

export function FixList({ fixes }) {
  if (fixes.length === 0) return null;
  return (
    <Card className="print-break">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <ClipboardList aria-hidden className="h-4 w-4 text-primary" />
          Top {fixes.length} fixes
        </h2>
        <CopyButton label="Copy list" text={fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')} />
      </div>
      <ol className="mt-3 space-y-2.5">
        {fixes.map((f, i) => (
          <li key={f} className="flex gap-3 text-sm text-fg">
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-soft-fg"
            >
              {i + 1}
            </span>
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

const FORMAT_TIPS = [
  'Single column. No tables, columns or text boxes.',
  'Selectable text (not a scanned image).',
  'Standard headings: Education, Skills, Projects, Experience.',
  'PDF unless the posting asks for .docx.',
  'Contact details in the body, not the header/footer.',
];

export function FormatChecklist() {
  return (
    <Card className="print-break">
      <h2 className="text-sm font-semibold text-fg">Format checklist</h2>
      <p className="mt-1 text-xs text-fg-muted">
        ProofCV reads pasted text only, so it can&apos;t check your file&apos;s layout. These are tips to check yourself.
      </p>
      <ul className="mt-3 space-y-2">
        {FORMAT_TIPS.map((t) => (
          <li key={t}>
            <label className="flex cursor-pointer gap-2.5 text-sm text-fg">
              <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]" />
              {t}
            </label>
          </li>
        ))}
      </ul>
    </Card>
  );
}
