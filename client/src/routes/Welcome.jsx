import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { PRESETS } from '@proofcv/shared';
import { Logo } from '../components/layout/Brand.jsx';
import { useStore } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { safeNext } from './Login.jsx';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Graduate'];
const field =
  'h-[52px] w-full rounded-[6px] border border-line-strong bg-surface px-4 font-serif text-[17px] text-fg placeholder:text-fg-subtle outline-none focus:border-fg focus:ring-2 focus:ring-[#fceb93]';
const label = 'mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted';
const chip = (on) =>
  `h-10 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${on ? 'border-fg bg-chip-on text-[#3a3550]' : 'border-line-strong hover:border-fg'}`;

/** One-time details step after sign-up: used to greet the student and preselect a matching job posting. */
export default function Welcome() {
  useDocumentTitle('About you');
  const session = useStore((s) => s.session);
  const existing = useStore((s) => (s.session ? s.profiles[s.session.id] : null));
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: existing?.name ?? session?.name ?? '',
    year: existing?.year ?? '',
    branch: existing?.branch ?? '',
    targetRole: existing?.targetRole ?? '',
  });
  const [error, setError] = useState('');

  if (!session) return <Navigate to={`/login?next=${encodeURIComponent('/welcome')}`} replace />;
  if (session.provider === 'guest') return <Navigate to={next} replace />;

  const { setProfile, setSession, updateDraft } = useStore.getState();

  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Tell us what to call you.');
    const name = form.name.trim();
    setProfile(session.id, { ...form, name, branch: form.branch.trim(), skipped: false });
    if (name !== session.name) setSession({ ...session, name });
    const preset = PRESETS.find((p) => p.id === form.targetRole);
    const draft = useStore.getState().data[session.id]?.draft;
    if (preset && !draft?.jd?.trim()) updateDraft({ jd: preset.jd, presetId: preset.id });
    navigate(next, { replace: true });
  };

  const skip = () => {
    setProfile(session.id, { skipped: true });
    navigate(next, { replace: true });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="light-scope relative flex min-h-dvh flex-col overflow-hidden bg-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#fceb93]/45 blur-3xl"
      />
      <header className="relative flex h-[72px] items-center px-5 sm:px-8">
        <Logo className="text-[24px]" />
      </header>
      <main id="main" className="relative flex flex-1 items-center justify-center px-4 pb-14 pt-4">
        <form
          onSubmit={save}
          noValidate
          className="w-full max-w-[560px] rounded-[10px] border border-line bg-surface px-6 py-10 shadow-[0_24px_60px_-30px_rgba(58,53,80,.35)] sm:px-11 sm:py-12"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">Step 2 of 2 · Optional</p>
          <h1 className="mt-2 font-display text-[44px] font-semibold uppercase leading-none">A bit about you</h1>
          <p className="mt-3 font-serif text-[17px] text-fg-muted">
            We use this to pick a matching job posting for your first audit. It stays in this browser.
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="w-name" className={label}>
                What should we call you?
              </label>
              <input
                id="w-name"
                autoComplete="name"
                value={form.name}
                onChange={set('name')}
                className={field}
                aria-invalid={Boolean(error)}
              />
              {error && (
                <p role="alert" className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-danger-fg">
                  {error}
                </p>
              )}
            </div>

            <fieldset>
              <legend className={label}>Year of study</legend>
              <div className="flex flex-wrap gap-2">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    aria-pressed={form.year === y}
                    className={chip(form.year === y)}
                    onClick={() => setForm((f) => ({ ...f, year: y }))}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="w-branch" className={label}>
                Branch or degree
              </label>
              <input id="w-branch" placeholder="e.g. B.Tech CSE" value={form.branch} onChange={set('branch')} className={field} />
            </div>

            <fieldset>
              <legend className={label}>Role you’re aiming for</legend>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={form.targetRole === p.id}
                    className={chip(form.targetRole === p.id)}
                    onClick={() => setForm((f) => ({ ...f, targetRole: f.targetRole === p.id ? '' : p.id }))}
                  >
                    {p.role.replace(/ Intern$/, '')}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="submit"
            className="mt-9 flex h-[56px] w-full items-center justify-center gap-2 rounded-[6px] bg-primary font-display text-[19px] font-medium uppercase tracking-[0.12em] text-primary-fg hover:bg-primary-hover"
          >
            Continue <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={skip}
            className="mx-auto mt-4 block font-mono text-[12px] uppercase tracking-[0.12em] text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Skip for now
          </button>
        </form>
      </main>
    </div>
  );
}
