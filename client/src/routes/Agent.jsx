import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, CircleAlert, FileSearch, LayoutTemplate, LoaderCircle, RotateCcw, Save, SkipForward, Sparkles } from 'lucide-react';
import { PRESETS, countPlaceholders } from '@proofcv/shared';
import { Button, Card, useToast } from '../components/ui/index.js';
import { CopyButton } from '../features/audit/CopyButton.jsx';
import { RoleSelect } from '../features/samples/RoleSelect.jsx';
import { useStore } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';

const STORAGE_KEY = 'proofcv-agent';
const MIN_ANSWERS_TO_BUILD = 2;
const label = 'mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted';
const field =
  'w-full rounded-[6px] border border-line-strong bg-surface px-3.5 py-2.5 font-serif text-[16px] text-fg placeholder:text-fg-subtle outline-none focus:border-fg focus:ring-2 focus:ring-[#fceb93]';

const EMPTY = { stage: 'setup', presetId: '', role: '', jd: '', profile: {}, answers: [], current: null, resume: null };

async function callAgent(payload) {
  const res = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? `The AI agent is unavailable right now (${res.status}).`);
  return data;
}

/** Plain-text resume in the shape the audit engine reads (section headings, "-" bullets). */
export function resumeToText(r) {
  const out = [r.name.toUpperCase(), r.contact.filter(Boolean).join(' | ')];
  if (r.summary) out.push('', r.summary);
  if (r.education.length) {
    out.push('', 'EDUCATION');
    for (const e of r.education) out.push([e.school, e.degree, e.dates].filter(Boolean).join(', '), ...(e.details ? [e.details] : []));
  }
  if (r.skills.length) {
    out.push('', 'SKILLS');
    for (const g of r.skills) out.push(`${g.group}: ${g.items.join(', ')}`);
  }
  if (r.projects.length) {
    out.push('', 'PROJECTS');
    for (const p of r.projects) out.push(p.tech ? `${p.name} (${p.tech})` : p.name, ...p.bullets.map((b) => `- ${b}`));
  }
  if (r.experience.length) {
    out.push('', 'EXPERIENCE');
    for (const e of r.experience) out.push([e.title, e.org, e.dates].filter(Boolean).join(', '), ...e.bullets.map((b) => `- ${b}`));
  }
  if (r.achievements.length) out.push('', 'ACHIEVEMENTS', ...r.achievements.map((a) => `- ${a}`));
  return out.join('\n').trim();
}

function WithPlaceholders({ text }) {
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

function H({ children }) {
  return <h3 className="mt-5 border-b border-[#3a3550]/30 pb-1 font-mono text-[11px] uppercase tracking-[0.14em]">{children}</h3>;
}

function ResumeSheet({ r }) {
  return (
    <article className="light-scope rounded-[4px] bg-[#fffdf7] p-7 font-serif text-[15px] leading-relaxed text-[#3a3550] shadow-[0_18px_40px_-24px_rgba(58,53,80,.45)] sm:p-10">
      <h2 className="font-display text-[34px] font-semibold uppercase leading-none">{r.name}</h2>
      {r.contact.length > 0 && <p className="mt-2 text-[14px] opacity-80">{r.contact.join(' · ')}</p>}
      {r.summary && (
        <p className="mt-3 italic">
          <WithPlaceholders text={r.summary} />
        </p>
      )}
      {r.education.length > 0 && (
        <>
          <H>Education</H>
          {r.education.map((e, i) => (
            <div key={i} className="mt-2">
              <p className="flex justify-between gap-4">
                <span className="font-medium">{[e.school, e.degree].filter(Boolean).join(' · ')}</span>
                <span className="shrink-0 opacity-75">{e.dates}</span>
              </p>
              {e.details && (
                <p className="opacity-85">
                  <WithPlaceholders text={e.details} />
                </p>
              )}
            </div>
          ))}
        </>
      )}
      {r.skills.length > 0 && (
        <>
          <H>Skills</H>
          {r.skills.map((g) => (
            <p key={g.group} className="mt-1">
              <span className="font-medium">{g.group}:</span> {g.items.join(', ')}
            </p>
          ))}
        </>
      )}
      {[
        ['Projects', r.projects.map((p) => ({ head: p.name, sub: p.tech, bullets: p.bullets }))],
        ['Experience', r.experience.map((e) => ({ head: [e.title, e.org].filter(Boolean).join(' · '), sub: e.dates, bullets: e.bullets }))],
      ].map(
        ([title, list]) =>
          list.length > 0 && (
            <section key={title}>
              <H>{title}</H>
              {list.map((x, i) => (
                <div key={i} className="mt-2">
                  <p className="flex justify-between gap-4">
                    <span className="font-medium">{x.head}</span>
                    <span className="shrink-0 italic opacity-75">{x.sub}</span>
                  </p>
                  <ul className="ml-4 list-disc">
                    {x.bullets.map((b, j) => (
                      <li key={j}>
                        <WithPlaceholders text={b} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ),
      )}
      {r.achievements.length > 0 && (
        <>
          <H>Achievements</H>
          <ul className="ml-4 mt-2 list-disc">
            {r.achievements.map((a, i) => (
              <li key={i}>
                <WithPlaceholders text={a} />
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

export default function Agent() {
  useDocumentTitle('AI resume builder');
  const navigate = useNavigate();
  const toast = useToast();
  const session = useStore((s) => s.session);
  const savedProfile = useStore((s) => (s.session ? s.profiles?.[s.session.id] : null));

  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (saved?.stage) return saved;
    } catch {
      /* ignore unreadable state */
    }
    return {
      ...EMPTY,
      presetId: savedProfile?.targetRole ?? '',
      profile: {
        name: savedProfile?.name ?? (session?.provider === 'guest' ? '' : (session?.name ?? '')),
        email: session?.email ?? '',
        phone: '',
        links: '',
        college: '',
        degree: savedProfile?.branch ?? '',
        year: savedProfile?.year ?? '',
      },
    };
  });
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const answerRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.stage === 'interview' && !busy) answerRef.current?.focus();
  }, [state.stage, state.current, busy]);

  const patch = (p) => setState((s) => ({ ...s, ...p }));
  const setProfile = (key) => (e) => setState((s) => ({ ...s, profile: { ...s.profile, [key]: e.target.value } }));
  const payload = (answers, action) => ({
    action,
    presetId: state.presetId,
    role: state.presetId ? '' : state.role,
    jd: state.presetId ? '' : state.jd,
    profile: state.profile,
    answers,
  });

  const run = async (kind, fn) => {
    setError('');
    setBusy(kind);
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const start = () =>
    run('next', async () => {
      if (!state.presetId && !state.role.trim()) throw new Error('Pick a role, or type the one you want.');
      const q = await callAgent(payload([], 'next'));
      patch({ stage: 'interview', answers: [], current: q });
    });

  const send = (skip = false) =>
    run(skip ? 'skip' : 'next', async () => {
      if (!skip && !answer.trim()) throw new Error('Type an answer, or skip this question.');
      const answers = [...state.answers, { question: state.current.question, answer: skip ? '' : answer.trim() }];
      const q = await callAgent(payload(answers, 'next'));
      setAnswer('');
      patch({ answers, current: q });
    });

  const build = () =>
    run('draft', async () => {
      const { resume } = await callAgent(payload(state.answers, 'draft'));
      patch({ stage: 'draft', resume });
    });

  const reset = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAnswer('');
    setError('');
    setState((s) => ({ ...EMPTY, presetId: s.presetId, role: s.role, jd: s.jd, profile: s.profile }));
  };

  const preset = PRESETS.find((p) => p.id === state.presetId);
  const text = state.resume ? resumeToText(state.resume) : '';
  const answered = state.answers.filter((a) => a.answer).length;

  const openInAudit = () => {
    useStore.getState().updateDraft({
      resume: text,
      jd: preset?.jd ?? state.jd,
      presetId: preset?.id ?? '',
      resumeId: null,
      title: `${state.resume.name} (AI draft)`,
    });
    navigate('/app/audit');
  };
  const openInTemplates = () => {
    useStore.getState().updateDraft({
      resume: text,
      jd: preset?.jd ?? state.jd,
      presetId: preset?.id ?? '',
      resumeId: null,
      title: `${state.resume.name} (AI draft)`,
    });
    navigate('/app/templates?source=draft');
  };
  const save = () => {
    useStore.getState().saveResume({ title: `${state.resume.name} – ${preset?.role ?? state.role}`, text });
    toast('Saved to your resumes on this device.', { tone: 'success' });
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">Powered by Claude · optional</p>
      <h1 className="mt-1 text-[36px] font-semibold leading-none text-fg">AI resume builder</h1>
      <p className="mt-2 max-w-[62ch] font-serif text-[17px] text-fg-muted">
        Answer a few questions and the agent drafts a resume for your target role from your answers only. Anything it can’t back up with
        what you said becomes a <mark className="hl-placeholder">[N]</mark> for you to fill.
      </p>

      {error && (
        <p role="alert" className="mt-5 flex gap-2 rounded-[6px] bg-danger-soft px-4 py-3 font-serif text-[15px] text-danger-fg">
          <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {state.stage === 'setup' && (
        <Card className="mt-6">
          <fieldset>
            <legend className={label}>Role you want</legend>
            <RoleSelect
              label="Role you want"
              value={state.presetId}
              emptyLabel="Something else (describe it below)"
              onChange={(presetId) => patch({ presetId })}
            />
          </fieldset>
          {!state.presetId && (
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="ag-role" className={label}>
                  Role title
                </label>
                <input
                  id="ag-role"
                  className={field}
                  placeholder="e.g. Android Developer Intern"
                  value={state.role}
                  onChange={(e) => patch({ role: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="ag-jd" className={label}>
                  Job posting (optional)
                </label>
                <textarea
                  id="ag-jd"
                  rows={5}
                  className={field}
                  placeholder="Paste the posting to tailor the wording."
                  value={state.jd}
                  onChange={(e) => patch({ jd: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['name', 'Full name', 'name'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone (optional)', 'tel'],
              ['links', 'GitHub / LinkedIn (optional)', 'url'],
              ['college', 'College', 'organization'],
              ['degree', 'Degree and branch', 'off'],
            ].map(([key, text, auto]) => (
              <div key={key}>
                <label htmlFor={`ag-${key}`} className={label}>
                  {text}
                </label>
                <input id={`ag-${key}`} autoComplete={auto} className={field} value={state.profile[key] ?? ''} onChange={setProfile(key)} />
              </div>
            ))}
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-[6px] bg-band p-4 font-serif text-[15px] text-fg">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[#3a3550]"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I understand this feature sends my answers and the details above to Anthropic’s Claude API to write the draft. ProofCV doesn’t
              store them. Audits still run only in my browser.
            </span>
          </label>

          <Button className="mt-5" size="lg" iconRight={ArrowRight} disabled={!consent} loading={busy === 'next'} onClick={start}>
            Start the interview
          </Button>
        </Card>
      )}

      {state.stage === 'interview' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <Card>
            <ol className="space-y-4" aria-label="Interview so far">
              {state.answers.map((a, i) => (
                <li key={i} className="space-y-2">
                  <p className="max-w-[85%] rounded-[10px] rounded-tl-none bg-band px-4 py-3 font-serif text-[16px]">{a.question}</p>
                  <p className="ml-auto max-w-[85%] rounded-[10px] rounded-tr-none bg-primary px-4 py-3 font-serif text-[16px] text-primary-fg">
                    {a.answer || <span className="italic opacity-70">Skipped</span>}
                  </p>
                </li>
              ))}
              {state.current && (
                <li className="space-y-2" aria-live="polite">
                  <p className="max-w-[85%] rounded-[10px] rounded-tl-none bg-band px-4 py-3 font-serif text-[17px] font-medium">
                    <Sparkles aria-hidden className="mr-1.5 inline h-4 w-4" />
                    {state.current.question}
                  </p>
                  {state.current.why && <p className="font-serif text-[14px] italic text-fg-muted">{state.current.why}</p>}
                </li>
              )}
            </ol>

            {state.current && !state.current.done && (
              <div className="mt-5">
                {state.current.examples?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {state.current.examples.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        className="rounded-full border border-line-strong px-3 py-1 text-left font-serif text-[14px] hover:border-fg"
                        onClick={() => setAnswer(ex)}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
                <label htmlFor="ag-answer" className="sr-only">
                  Your answer
                </label>
                <textarea
                  id="ag-answer"
                  ref={answerRef}
                  rows={4}
                  maxLength={2000}
                  className={field}
                  placeholder="Answer in your own words. Real numbers help, but never guess."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
                  }}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button iconRight={ArrowRight} loading={busy === 'next'} disabled={Boolean(busy)} onClick={() => send()}>
                    Send
                  </Button>
                  <Button variant="ghost" icon={SkipForward} loading={busy === 'skip'} disabled={Boolean(busy)} onClick={() => send(true)}>
                    Skip
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <aside className="space-y-4">
            <Card>
              <p className={label}>Progress</p>
              <p className="font-display text-[44px] font-medium leading-none">{answered}</p>
              <p className="font-serif text-[15px] text-fg-muted">answers for {preset?.role ?? state.role}</p>
              <Button
                className="mt-4 w-full"
                size="lg"
                icon={Sparkles}
                disabled={answered < MIN_ANSWERS_TO_BUILD || Boolean(busy)}
                loading={busy === 'draft'}
                onClick={build}
              >
                Build my resume
              </Button>
              {answered < MIN_ANSWERS_TO_BUILD && (
                <p className="mt-2 font-serif text-[14px] italic text-fg-muted">Answer at least {MIN_ANSWERS_TO_BUILD} questions first.</p>
              )}
              {busy === 'draft' && (
                <p className="mt-2 flex items-center gap-2 font-serif text-[14px] text-fg-muted" role="status">
                  <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> Writing your draft, about 20 seconds…
                </p>
              )}
            </Card>
            <Button variant="ghost" icon={RotateCcw} onClick={reset} disabled={Boolean(busy)}>
              Start over
            </Button>
          </aside>
        </div>
      )}

      {state.stage === 'draft' && state.resume && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <ResumeSheet r={state.resume} />
          <aside className="space-y-4">
            <Card>
              <p className={label}>Next</p>
              <div className="grid gap-2">
                <Button icon={FileSearch} onClick={openInAudit}>
                  Audit this draft
                </Button>
                <Button variant="secondary" icon={LayoutTemplate} onClick={openInTemplates}>
                  Re-create in a template
                </Button>
                <Button variant="secondary" icon={Save} onClick={save}>
                  Save to my resumes
                </Button>
                <CopyButton text={text} label="Copy as text" size="md" />
              </div>
              <p className="mt-3 font-serif text-[14px] text-fg-muted">
                {countPlaceholders(text) > 0
                  ? `${countPlaceholders(text)} placeholders to fill with real details.`
                  : 'No placeholders left.'}
              </p>
            </Card>
            {(state.resume.checks?.length > 0 || state.resume.notes?.length > 0) && (
              <Card>
                <p className={label}>Honesty checks</p>
                <ul className="space-y-2 font-serif text-[15px]">
                  {[...(state.resume.checks ?? []), ...(state.resume.notes ?? [])].map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              </Card>
            )}
            <p className="font-serif text-[14px] italic text-fg-muted">
              AI drafts can still get things wrong. Read every line, and only keep what is true.
            </p>
            <Button variant="ghost" icon={RotateCcw} onClick={reset}>
              Start a new interview
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
