import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, CircleCheck, CircleX, GitCompare, History as HistoryIcon, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, IconButton, Modal, useToast } from '../components/ui/index.js';
import { useStore, useUserData } from '../lib/store.js';
import { formatDateTime, useDocumentTitle } from '../lib/hooks.js';

const STATUS = {
  matched: { tone: 'success', icon: CircleCheck, label: 'In resume' },
  reworded: { tone: 'warning', icon: Search, label: 'Worded differently' },
  missing: { tone: 'danger', icon: CircleX, label: 'Not found' },
};

function Compare({ a, b }) {
  const names = [...new Set([...a.skills, ...b.skills].map((s) => s.name))];
  const statusIn = (audit, name) => audit.skills.find((s) => s.name === name)?.status;
  const changed = names.filter((n) => statusIn(a, n) !== statusIn(b, n));
  const rows = [
    ['Coverage now', `${a.coverageNow ?? '–'}%`, `${b.coverageNow ?? '–'}%`],
    ['After rewording true skills', `${a.coveragePotential ?? '–'}%`, `${b.coveragePotential ?? '–'}%`],
    ['Strong bullets', `${a.bulletStats.strong}/${a.bulletStats.total}`, `${b.bulletStats.strong}/${b.bulletStats.total}`],
    ['Bullets with a result', `${a.bulletStats.withMetric}/${a.bulletStats.total}`, `${b.bulletStats.withMetric}/${b.bulletStats.total}`],
  ];
  return (
    <div className="space-y-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-fg-muted">
            <th className="pb-2 font-medium">Metric</th>
            <th className="pb-2 font-medium">
              {a.title}
              <br />
              <span className="font-normal">{formatDateTime(a.createdAt)}</span>
            </th>
            <th className="pb-2 font-medium">
              {b.title}
              <br />
              <span className="font-normal">{formatDateTime(b.createdAt)}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(([label, x, y]) => (
            <tr key={label}>
              <th scope="row" className="py-2 text-left font-normal text-fg-muted">
                {label}
              </th>
              <td className="py-2 font-semibold tabular-nums">{x}</td>
              <td className="py-2 font-semibold tabular-nums">{y}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3 className="text-sm font-semibold text-fg">Skills that changed ({changed.length})</h3>
        {changed.length === 0 ? (
          <p className="mt-1 text-sm text-fg-muted">Same skill results in both audits.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {changed.map((n) => {
              const sa = STATUS[statusIn(a, n)];
              const sb = STATUS[statusIn(b, n)];
              return (
                <li key={n} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-40 truncate font-medium text-fg">{n}</span>
                  {sa ? (
                    <Badge tone={sa.tone} icon={sa.icon}>
                      {sa.label}
                    </Badge>
                  ) : (
                    <Badge>Not in posting</Badge>
                  )}
                  <ArrowRight aria-label="became" className="h-4 w-4 text-fg-subtle" />
                  {sb ? (
                    <Badge tone={sb.tone} icon={sb.icon}>
                      {sb.label}
                    </Badge>
                  ) : (
                    <Badge>Not in posting</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  useDocumentTitle('History');
  const { audits } = useUserData();
  const deleteAudit = useStore((s) => s.deleteAudit);
  const updateDraft = useStore((s) => s.updateDraft);
  const navigate = useNavigate();
  const toast = useToast();
  const [picked, setPicked] = useState([]);
  const [comparing, setComparing] = useState(false);

  // Oldest first, so the comparison reads as "before -> after".
  const pair = useMemo(
    () =>
      picked
        .map((id) => audits.find((a) => a.id === id))
        .filter(Boolean)
        .sort((x, y) => x.createdAt.localeCompare(y.createdAt)),
    [picked, audits],
  );

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p.slice(-1), id]));
  const reopen = (a) => {
    updateDraft({ resume: a.resume, jd: a.jd, resumeId: a.resumeId ?? null, title: a.title, presetId: '' });
    navigate('/app/audit');
  };
  const remove = (a) => {
    if (!window.confirm(`Delete this audit of "${a.title}"? This can't be undone.`)) return;
    deleteAudit(a.id);
    setPicked((p) => p.filter((x) => x !== a.id));
    toast('Audit deleted.', { tone: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-fg">History</h1>
          <p className="text-fg-muted">Saved audits on this device. Tick two to compare.</p>
        </div>
        <Button icon={GitCompare} disabled={pair.length !== 2} onClick={() => setComparing(true)}>
          Compare {pair.length}/2
        </Button>
      </div>

      {audits.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No saved audits" action={<Button to="/app/audit">Start an audit</Button>}>
          Run an audit and press <b>Save audit</b> to keep a snapshot here.
        </EmptyState>
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {audits.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap">
                <input
                  type="checkbox"
                  checked={picked.includes(a.id)}
                  onChange={() => toggle(a.id)}
                  aria-label={`Select ${a.title} from ${formatDateTime(a.createdAt)} to compare`}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{a.title}</p>
                  <p className="truncate text-xs text-fg-muted">
                    {a.role} · {formatDateTime(a.createdAt)}
                  </p>
                </div>
                {a.counts && (
                  <div className="hidden gap-1.5 md:flex">
                    <Badge tone="success" icon={CircleCheck}>
                      {a.counts.matched}
                    </Badge>
                    <Badge tone="warning" icon={Search}>
                      {a.counts.reworded}
                    </Badge>
                    <Badge tone="danger" icon={CircleX}>
                      {a.counts.missing}
                    </Badge>
                  </div>
                )}
                <span className="w-24 text-right">
                  <span className="block text-sm font-bold tabular-nums text-fg">{a.coverageNow ?? '–'}%</span>
                  <span className="block text-[11px] text-fg-subtle">reworded {a.coveragePotential ?? '–'}%</span>
                </span>
                <div className="flex gap-1">
                  <IconButton icon={RotateCcw} label={`Reopen ${a.title}`} size="sm" onClick={() => reopen(a)} />
                  <IconButton
                    icon={Trash2}
                    label={`Delete audit of ${a.title}`}
                    size="sm"
                    variant="danger-ghost"
                    onClick={() => remove(a)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={comparing && pair.length === 2} onClose={() => setComparing(false)} title="Compare audits" size="lg">
        {pair.length === 2 && <Compare a={pair[0]} b={pair[1]} />}
      </Modal>
    </div>
  );
}
