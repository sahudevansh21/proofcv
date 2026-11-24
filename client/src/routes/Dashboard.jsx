import { useNavigate } from 'react-router';
import { ArrowRight, ClipboardPaste, FileText, History as HistoryIcon, Sparkles, Target, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, IconButton, useToast } from '../components/ui/index.js';
import { PRESETS, SAMPLES, loadSample } from '../features/samples/samples.js';
import { EMPTY_DRAFT, useStore, useUserData } from '../lib/store.js';
import { RoleSelect } from '../features/samples/RoleSelect.jsx';
import { formatDate, formatDateTime, useDocumentTitle } from '../lib/hooks.js';

/** Tiny inline trend line for a resume's coverage over time. */
function Sparkline({ values }) {
  if (values.length < 2) return <span className="text-xs text-fg-subtle">Save 2+ audits to see a trend</span>;
  const w = 120;
  const h = 32;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`).join(' ');
  const delta = values.at(-1) - values[0];
  return (
    <span className="flex items-center gap-2">
      <svg
        width={w}
        height={h}
        viewBox={`0 -2 ${w} ${h + 4}`}
        role="img"
        aria-label={`Coverage trend from ${values[0]}% to ${values.at(-1)}%`}
      >
        <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <Badge tone={delta > 0 ? 'success' : delta < 0 ? 'danger' : 'neutral'}>
        {delta > 0 ? '+' : ''}
        {delta} pts
      </Badge>
    </span>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const navigate = useNavigate();
  const toast = useToast();
  const session = useStore((s) => s.session);
  const updateDraft = useStore((s) => s.updateDraft);
  const deleteResume = useStore((s) => s.deleteResume);
  const { resumes, audits, draft } = useUserData();

  const openResume = (r) => {
    updateDraft({ resume: r.text, resumeId: r.id, title: r.title });
    navigate('/app/audit');
  };
  const quick = {
    paste: () => {
      updateDraft({ ...EMPTY_DRAFT });
      navigate('/app/audit');
    },
    sample: () => {
      loadSample();
      navigate('/app/audit');
    },
    preset: (p) => {
      updateDraft({ jd: p.jd, presetId: p.id });
      navigate('/app/audit');
    },
  };
  const remove = (r) => {
    if (!window.confirm(`Delete "${r.title}" from this device? Its past audits stay in History.`)) return;
    deleteResume(r.id);
    toast('Resume deleted.', { tone: 'success' });
  };

  const trendFor = (id) =>
    audits
      .filter((a) => a.resumeId === id && a.coverageNow !== null)
      .map((a) => a.coverageNow)
      .reverse();
  const hasDraft = draft.resume.trim().length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[36px] font-semibold leading-none text-fg">Hi, {session?.name?.split(' ')[0]} 👋</h1>
        <p className="text-fg-muted">Pick up an audit or start a new one.</p>
      </div>

      <section aria-labelledby="quick">
        <h2 id="quick" className="sr-only">
          Quick start
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card as="button" type="button" onClick={quick.paste} className="text-left transition duration-300 ease-out hover:shadow-[var(--shadow-pop)] motion-safe:hover:-translate-y-1">
            <ClipboardPaste aria-hidden className="h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold text-fg">Paste your resume</p>
            <p className="mt-1 text-sm text-fg-muted">Start a fresh audit with your own text and posting.</p>
          </Card>
          <Card as="button" type="button" onClick={quick.sample} className="text-left transition duration-300 ease-out hover:shadow-[var(--shadow-pop)] motion-safe:hover:-translate-y-1">
            <Sparkles aria-hidden className="h-6 w-6 text-g-yellow" />
            <p className="mt-3 font-semibold text-fg">Try a sample</p>
            <p className="mt-1 text-sm text-fg-muted">
              {SAMPLES[0].name}&apos;s parody resume against a {PRESETS.find((p) => p.id === SAMPLES[0].presetId)?.role} posting.
            </p>
          </Card>
          <Card className="flex flex-col">
            <Target aria-hidden className="h-6 w-6 text-g-green" />
            <p className="mt-3 font-semibold text-fg">Role presets</p>
            <p className="mt-1 text-sm text-fg-muted">{PRESETS.length} postings, tech and non-tech.</p>
            <RoleSelect
              className="mt-3"
              label="Start an audit with a role posting"
              value=""
              emptyLabel="Pick a role…"
              onChange={(id) => {
                const p = PRESETS.find((x) => x.id === id);
                if (p) quick.preset(p);
              }}
            />
          </Card>
        </div>
        {hasDraft && (
          <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-primary-soft/40">
            <p className="text-sm text-fg">
              <b>Current draft</b>
              {draft.title ? `: ${draft.title}` : ''}. Continue where you left off.
            </p>
            <Button to="/app/audit" size="sm" iconRight={ArrowRight}>
              Continue
            </Button>
          </Card>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="saved">
          <h2 id="saved" className="mb-3 text-lg font-semibold text-fg">
            Saved resumes
          </h2>
          {resumes.length === 0 ? (
            <EmptyState icon={FileText} title="No saved resumes yet">
              In an audit, press <b>Save audit</b>. Resumes are stored in this browser only.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {resumes.map((r) => (
                <li key={r.id}>
                  <Card className="flex flex-wrap items-center gap-4">
                    <FileText aria-hidden className="h-8 w-8 shrink-0 text-fg-subtle" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-fg">{r.title}</p>
                      <p className="text-xs text-fg-muted">
                        Updated {formatDate(r.updatedAt)} · {trendFor(r.id).length} audit{trendFor(r.id).length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Sparkline values={trendFor(r.id)} />
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="soft" onClick={() => openResume(r)}>
                        Open
                      </Button>
                      <IconButton icon={Trash2} label={`Delete ${r.title}`} size="sm" variant="danger-ghost" onClick={() => remove(r)} />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent" className="text-lg font-semibold text-fg">
              Recent audits
            </h2>
            {audits.length > 0 && (
              <Button to="/app/history" size="sm" variant="ghost" iconRight={ArrowRight}>
                All
              </Button>
            )}
          </div>
          {audits.length === 0 ? (
            <EmptyState icon={HistoryIcon} title="No audits yet">
              Saved audits show up here with their coverage.
            </EmptyState>
          ) : (
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {audits.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{a.title}</p>
                      <p className="truncate text-xs text-fg-muted">
                        {a.role} · {formatDateTime(a.createdAt)}
                      </p>
                    </div>
                    {a.coverageNow !== null && (
                      <span className="text-right">
                        <span className="block text-sm font-bold tabular-nums text-fg">{a.coverageNow}%</span>
                        <span className="block text-[11px] text-fg-subtle">→ {a.coveragePotential}%</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
