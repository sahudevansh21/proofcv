import { useCallback, useMemo, useRef, useState } from 'react';
import { BookmarkPlus, FileText, FileUp, Printer, RotateCcw, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Button, EmptyState, Input, Modal, Select, Tabs, useToast } from '../components/ui/index.js';
import { EditorPane } from '../features/audit/EditorPane.jsx';
import { CoveragePanel, FixList, FormatChecklist, SkillsPanel } from '../features/audit/ResultsPanels.jsx';
import { BulletInspector, sortBullets } from '../features/audit/BulletInspector.jsx';
import { BulletTemplate } from '../features/audit/BulletTemplate.jsx';
import { toAuditSnapshot, useAudit } from '../features/audit/useAudit.js';
import { PRESETS, SAMPLES, loadSample, presetById } from '../features/samples/samples.js';
import { ACCEPT_ATTR, extractText } from '../features/import/extractors.js';
import { EMPTY_DRAFT, useStore } from '../lib/store.js';
import { formatDateTime, useDocumentTitle } from '../lib/hooks.js';

const RESUME_LEGEND = [
  { kind: 'matched', sample: 'React', text: 'matches posting' },
  { kind: 'reworded', sample: 'GitHub', text: 'posting uses other words' },
  { kind: 'weak', sample: 'worked on', text: 'weak phrase' },
  { kind: 'placeholder', sample: 'N', text: 'fill in' },
];
const JD_LEGEND = [
  { kind: 'matched', sample: 'Node.js', text: 'in your resume' },
  { kind: 'reworded', sample: 'REST APIs', text: 'related wording' },
  { kind: 'missing', sample: 'Docker', text: 'not found' },
];

export default function Audit() {
  useDocumentTitle('Audit');
  const { draft, result, pending, analysedResume, analysedJd } = useAudit();
  const updateDraft = useStore((s) => s.updateDraft);
  const saveResume = useStore((s) => s.saveResume);
  const saveAudit = useStore((s) => s.saveAudit);
  const toast = useToast();
  const [mobileTab, setMobileTab] = useState('resume');
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const fileRef = useRef(null);

  const preset = presetById(draft.presetId);
  const hasInput = draft.resume.trim() || draft.jd.trim();

  const setResume = useCallback((resume) => updateDraft({ resume }), [updateDraft]);
  const setJd = useCallback((jd) => updateDraft({ jd, presetId: '' }), [updateDraft]);

  const applyBullet = useCallback(
    (bullet, text) => {
      const current = useStore.getState();
      const d = current.data[current.session.id]?.draft;
      if (!d || d.resume.slice(bullet.start, bullet.end) !== bullet.text) {
        toast('Your resume changed while editing. Pick the bullet again.', { tone: 'warning' });
        return;
      }
      updateDraft({ resume: d.resume.slice(0, bullet.start) + text + d.resume.slice(bullet.end) });
      toast('Bullet applied. Coverage updated.', { tone: 'success' });
    },
    [toast, updateDraft],
  );

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await extractText(file);
      updateDraft({ resume: text, resumeId: null, title: file.name.replace(/\.[^.]+$/, '') });
      toast(`Imported ${file.name}.`, { tone: 'success' });
    } catch (err) {
      toast(err.message, { tone: 'error', duration: 6000 });
    }
  };

  const openSave = () => {
    setSaveTitle(draft.title || '');
    setSaveOpen(true);
  };
  const confirmSave = () => {
    const title = saveTitle.trim() || 'Untitled resume';
    const resumeId = saveResume({ id: draft.resumeId ?? undefined, title, text: draft.resume });
    updateDraft({ resumeId, title });
    saveAudit(toAuditSnapshot({ draft: { ...draft, title }, result, role: preset?.role, resumeId }));
    setSaveOpen(false);
    toast(`Saved "${title}" to History on this device.`, { tone: 'success' });
  };

  const print = () => {
    if (result.placeholders > 0)
      toast(
        `${result.placeholders} placeholder${result.placeholders > 1 ? 's' : ''} unfilled in your resume. The report shows them highlighted.`,
        { tone: 'warning', duration: 5000 },
      );
    window.print();
  };

  const bullets = useMemo(() => sortBullets(result.bullets), [result.bullets]);
  const tools = useMemo(() => [...new Set(result.bullets.flatMap((b) => b.tools))].sort(), [result.bullets]);

  const resumePane = (
    <EditorPane
      id="resume-input"
      title={draft.title ? `Resume: ${draft.title}` : 'Your resume'}
      hint="Plain text. Put each achievement on its own line starting with “-”."
      value={draft.resume}
      analysedValue={analysedResume}
      onChange={setResume}
      highlights={result.highlights}
      legend={RESUME_LEGEND}
      placeholder={'EDUCATION\n...\n\nSKILLS\n...\n\nPROJECTS\n- Built ...\n- Worked on ...'}
      actions={
        <>
          <input ref={fileRef} type="file" accept={ACCEPT_ATTR} className="sr-only" onChange={importFile} tabIndex={-1} aria-hidden />
          <Button variant="ghost" size="sm" icon={FileUp} onClick={() => fileRef.current?.click()} className="no-print">
            Import .txt
          </Button>
        </>
      }
    />
  );
  const jdPane = (
    <EditorPane
      id="jd-input"
      title={preset ? `Job: ${preset.role}` : 'Job description'}
      hint="Paste the internship posting, or choose a role preset."
      value={draft.jd}
      analysedValue={analysedJd}
      onChange={setJd}
      highlights={result.jdHighlights}
      legend={JD_LEGEND}
      placeholder={'Requirements:\n- ...\n\nNice to have:\n- ...'}
    />
  );

  const results = hasInput ? (
    <div className={`space-y-4 transition-opacity duration-200 ${pending ? 'opacity-60' : ''}`} aria-busy={pending}>
      {result.warnings.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Notes">
          {result.warnings.map((w) => (
            <li key={w} className="rounded-full bg-surface-2 px-3 py-1 text-xs text-fg-muted">
              {w}
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CoveragePanel coverage={result.coverage} bulletStats={result.bulletStats} />
        <SkillsPanel skills={result.skills} />
        <FixList fixes={result.fixes} />
      </div>
      <BulletInspector bullets={bullets} onApply={applyBullet} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <BulletTemplate tools={tools} />
        <FormatChecklist />
      </div>
    </div>
  ) : (
    <EmptyState
      icon={Sparkles}
      title="Paste your resume and a job description"
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            icon={Sparkles}
            onClick={() => {
              loadSample();
              setMobileTab('results');
            }}
          >
            Load sample
          </Button>
          <Button variant="secondary" icon={Target} onClick={() => updateDraft({ jd: PRESETS[0].jd, presetId: PRESETS[0].id })}>
            Use SDE intern JD
          </Button>
        </div>
      }
    >
      Or try a sample to see how ProofCV works. Everything runs in your browser.
    </EmptyState>
  );

  return (
    <div className="space-y-5">
      {/* Print header */}
      <div className="print-only mb-4">
        <h1 className="text-2xl font-bold">ProofCV report{draft.title ? `: ${draft.title}` : ''}</h1>
        <p className="text-sm">
          {preset?.role ?? 'Custom job description'} · {formatDateTime(new Date().toISOString())} · JD keyword coverage is a rule of thumb
          for this tool, not an ATS score.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-3 no-print">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-fg">Audit</h1>
          <p className="flex items-center gap-1.5 text-sm text-fg-muted">
            <ShieldCheck aria-hidden className="h-4 w-4 text-success" />
            Analysed on your device. Re-scores as you type.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Select
            aria-label="Load a sample resume"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                loadSample(e.target.value);
                toast('Sample loaded.', { tone: 'success' });
              }
            }}
            className="w-44"
          >
            <option value="">Load sample…</option>
            {SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({presetById(s.presetId)?.role.replace(' Intern', '')})
              </option>
            ))}
          </Select>
          <Select
            aria-label="Role preset"
            value={draft.presetId}
            onChange={(e) => {
              const p = presetById(e.target.value);
              if (p) updateDraft({ jd: p.jd, presetId: p.id });
            }}
            className="w-52"
          >
            <option value="" disabled>
              Role preset…
            </option>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.role}
              </option>
            ))}
          </Select>
          <Button variant="secondary" icon={Printer} onClick={print} disabled={!hasInput}>
            Print
          </Button>
          <Button icon={BookmarkPlus} onClick={openSave} disabled={!draft.resume.trim()}>
            Save audit
          </Button>
          {hasInput && (
            <Button variant="ghost" icon={RotateCcw} onClick={() => updateDraft({ ...EMPTY_DRAFT })} aria-label="Clear both panes">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile: tabs. Desktop: side by side. */}
      <div className="md:hidden no-print">
        <Tabs
          className="w-full"
          label="Workspace"
          value={mobileTab}
          onChange={setMobileTab}
          tabs={[
            { value: 'resume', label: 'Resume', icon: FileText },
            { value: 'jd', label: 'Job', icon: Target },
            { value: 'results', label: 'Results', icon: Sparkles, count: result.coverage ? `${result.coverage.now}%` : undefined },
          ]}
        />
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-2 no-print">
        {resumePane}
        {jdPane}
      </div>
      <div className="md:hidden">
        {mobileTab === 'resume' && resumePane}
        {mobileTab === 'jd' && jdPane}
        {mobileTab === 'results' && results}
      </div>
      <div className="hidden md:block">{results}</div>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save this audit"
        description="Saves the resume and a snapshot of this audit to History, in this browser only."
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave} icon={BookmarkPlus}>
              Save
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmSave();
          }}
        >
          <Input
            label="Resume name"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="e.g. SDE internship – Nov"
            autoFocus
            maxLength={80}
          />
        </form>
        {draft.resumeId && (
          <p className="mt-3 text-xs text-fg-muted">This updates your saved resume and adds a new audit to its history.</p>
        )}
      </Modal>
    </div>
  );
}
