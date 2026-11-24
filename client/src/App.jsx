import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { analyze, PRESETS as BUNDLED_PRESETS, SAMPLE_RESUME as BUNDLED_SAMPLE } from '@proofcv/shared';
import TextPane from './components/TextPane.jsx';
import CoverageCard from './components/CoverageCard.jsx';
import SkillBuckets from './components/SkillBuckets.jsx';
import BulletAudit from './components/BulletAudit.jsx';
import BulletBuilder from './components/BulletBuilder.jsx';
import CopyButton from './components/CopyButton.jsx';

const STORAGE_KEY = 'proofcv:v1';

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (saved && typeof saved.resume === 'string' && typeof saved.jd === 'string') return saved;
  } catch { /* corrupted storage: start fresh */ }
  return { resume: '', jd: '' };
}

const RESUME_LEGEND = [
  { kind: 'matched', sample: 'React', text: 'matches posting' },
  { kind: 'reworded', sample: 'GitHub', text: 'posting uses another term' },
  { kind: 'weak', sample: 'worked on', text: 'weak phrase' },
];
const JD_LEGEND = [
  { kind: 'matched', sample: 'Node.js', text: 'in your resume' },
  { kind: 'reworded', sample: 'REST APIs', text: 'related wording in resume' },
  { kind: 'missing', sample: 'Docker', text: 'not found' },
];

function Section({ title, subtitle, action, children }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const [{ resume, jd }, setInputs] = useState(loadSaved);
  const [catalog, setCatalog] = useState({ sampleResume: BUNDLED_SAMPLE, presets: BUNDLED_PRESETS });
  const [presetId, setPresetId] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/presets', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => { if (Array.isArray(data.presets) && data.presets.length) setCatalog(data); })
      .catch(() => { /* offline or static hosting: bundled presets are already loaded */ });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ resume, jd })), 300);
    return () => clearTimeout(t);
  }, [resume, jd]);

  const deferredResume = useDeferredValue(resume);
  const deferredJd = useDeferredValue(jd);
  const result = useMemo(() => analyze(deferredResume, deferredJd), [deferredResume, deferredJd]);
  const stale = deferredResume !== resume || deferredJd !== jd;

  const setResume = useCallback((value) => setInputs((s) => ({ ...s, resume: value })), []);
  const setJd = useCallback((value) => { setPresetId(''); setInputs((s) => ({ ...s, jd: value })); }, []);

  const loadSample = () => {
    const preset = catalog.presets[0];
    setPresetId(preset.id);
    setInputs({ resume: catalog.sampleResume, jd: preset.jd });
  };
  const choosePreset = (id) => {
    const preset = catalog.presets.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setInputs((s) => ({ ...s, jd: preset.jd }));
  };

  const applyBullet = useCallback((bullet, text) => {
    setInputs((s) => {
      if (s.resume.slice(bullet.start, bullet.end) !== bullet.text) return s; // resume changed underneath; skip safely
      return { ...s, resume: s.resume.slice(0, bullet.start) + text + s.resume.slice(bullet.end) };
    });
  }, []);

  const resumeTools = useMemo(
    () => [...new Set(result.bullets.flatMap((b) => b.tools))].sort((a, b) => a.localeCompare(b)),
    [result.bullets],
  );

  const hasInput = resume.trim() || jd.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-9 w-9" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ProofCV</h1>
            <p className="text-sm text-slate-500">Improve your resume without inventing experience.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 sm:inline">
            🔒 Your resume never leaves your browser
          </span>
          <button type="button" onClick={loadSample} className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Load sample
          </button>
          <select
            value={presetId}
            onChange={(e) => choosePreset(e.target.value)}
            aria-label="Use a sample job description"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          >
            <option value="" disabled>Sample JD by role…</option>
            {catalog.presets.map((p) => <option key={p.id} value={p.id}>{p.role}</option>)}
          </select>
          {hasInput && (
            <button type="button" onClick={() => { setPresetId(''); setInputs({ resume: '', jd: '' }); }} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100">
              Clear
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <TextPane
          id="resume"
          label="Your resume"
          hint="Paste plain text. Remove phone number and address if you like."
          value={resume}
          onChange={setResume}
          highlights={result.highlights}
          legend={RESUME_LEGEND}
          placeholder={'EDUCATION\n...\n\nPROJECTS\n- Built ...\n- Worked on ...'}
        />
        <TextPane
          id="jd"
          label="Job description"
          hint="Paste the internship posting, or pick a sample role above."
          value={jd}
          onChange={setJd}
          highlights={result.jdHighlights}
          legend={JD_LEGEND}
          placeholder={'Requirements:\n- ...\n\nNice to have:\n- ...'}
        />
      </div>

      {result.warnings.length > 0 && hasInput && (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs">
          {result.warnings.map((w) => <li key={w} className="rounded-full bg-slate-200/70 px-3 py-1 text-slate-600">{w}</li>)}
        </ul>
      )}

      {!hasInput ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-800">Paste your resume and a job description, or try the sample.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            ProofCV shows which keywords from the job posting your resume already covers, which ones you may already have
            under a different name, and which you should only add if they are true.
          </p>
          <button type="button" onClick={loadSample} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Load sample resume + SDE intern JD
          </button>
        </div>
      ) : (
        <div className={`mt-8 space-y-10 transition-opacity ${stale ? 'opacity-70' : ''}`}>
          <CoverageCard coverage={result.coverage} bulletStats={result.bulletStats} />

          {result.fixes.length > 0 && (
            <Section
              title="Top fixes"
              subtitle="Most useful changes first. Copy them as a to-do list."
              action={<CopyButton label="Copy fix list" text={result.fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')} />}
            >
              <ol className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {result.fixes.map((f, i) => (
                  <li key={f} className="flex gap-3 text-sm text-slate-700">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{i + 1}</span>
                    {f}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {result.skills.length > 0 && (
            <Section title="Skills in this posting" subtitle="★ marks required skills. A word in your resume isn't proof of a skill. Only you know what's true.">
              <SkillBuckets skills={result.skills} />
            </Section>
          )}

          {result.bullets.length > 0 && (
            <Section title="Bullet audit" subtitle="Each bullet is checked, and a rewrite is suggested. Missing results become [placeholders] for you to fill in with real numbers.">
              <BulletAudit bullets={result.bullets} onApply={applyBullet} />
            </Section>
          )}

          <Section title="Bullet template" subtitle="Write a new bullet from scratch: verb + what + tool + a result you can verify.">
            <BulletBuilder tools={resumeTools} />
          </Section>

          <Section title="What ProofCV can't check">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <p>
                ProofCV reads pasted text only. It can't see your PDF's layout, so it can't tell whether a screener parses
                it correctly. Screening differs by employer and system. Before you upload:
              </p>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {['Single column, no tables or text boxes', 'Text is selectable (not a scanned image)', 'Standard headings: Education, Skills, Projects', 'Saved as PDF unless the posting asks for .docx'].map((t) => (
                  <li key={t} className="flex gap-2"><span className="text-slate-400">☐</span>{t}</li>
                ))}
              </ul>
            </div>
          </Section>

          <div className="flex justify-end no-print">
            <button type="button" onClick={() => window.print()} className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              Print / save report as PDF
            </button>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        ProofCV · Built at The Battle Royale hackathon, GDG on Campus AITR · Rule-based and open about its limits.
      </footer>
    </div>
  );
}
