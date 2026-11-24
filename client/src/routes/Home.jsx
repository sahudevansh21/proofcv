import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Ban, EyeOff, FileSearch, Gauge, Lock, PenLine, Search, ShieldCheck } from 'lucide-react';
import { analyze, PRESETS, SAMPLES } from '@proofcv/shared';
import { ZNav } from '../components/layout/ZNav.jsx';
import { SiteFooter } from '../components/layout/PublicLayout.jsx';
import { ITEMS } from '../features/gallery/items.js';
import { printUrl } from '../features/gallery/artwork.js';
import { loadSample } from '../features/samples/samples.js';
import { LiveFeed } from '../features/home/LiveFeed.jsx';
import { useStore } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';

const mono = 'font-mono text-[11px] uppercase tracking-[0.14em]';
const ctaDark =
  'inline-flex h-[56px] items-center justify-center gap-2 rounded-[6px] bg-primary px-8 font-display text-[19px] font-medium uppercase tracking-[0.12em] text-primary-fg transition-colors hover:bg-primary-hover';
const ctaLine =
  'inline-flex h-[56px] items-center justify-center gap-2 rounded-[6px] border border-fg px-8 font-display text-[19px] font-medium uppercase tracking-[0.12em] transition-colors hover:bg-fg/5';

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

/** Real engine output for the first sample, so every number on this page is reproducible in the app. */
function useDemo() {
  return useMemo(() => {
    const sample = SAMPLES[0];
    const preset = PRESETS.find((p) => p.id === sample.presetId);
    const r = analyze(sample.resume, preset.jd);
    const bullet = r.bullets.find((b) => b.rewrite && b.startsWeak) ?? r.bullets.find((b) => b.rewrite);
    const pick = (status) => r.skills.filter((s) => s.status === status);
    return { sample, preset, r, bullet, matched: pick('matched'), reworded: pick('reworded'), missing: pick('missing') };
  }, []);
}

const STEPS = [
  {
    icon: FileSearch,
    title: 'Paste two things',
    body: 'Your resume and the internship posting you want. Or start from one of four samples.',
  },
  {
    icon: Search,
    title: 'See three buckets',
    body: 'Skills you already show, skills you have under other words, and real gaps you should not claim.',
  },
  {
    icon: PenLine,
    title: 'Sharpen honestly',
    body: 'Stronger verbs and a clear structure. Missing results become [N] for you to fill with real numbers.',
  },
];

const PROMISES = [
  { icon: Lock, title: 'Stays in your browser', body: 'Analysis runs on your device. No server endpoint accepts resume text.' },
  { icon: Ban, title: 'Never invents', body: 'No made-up numbers, tools or wins. Unknown impact becomes a question and a placeholder.' },
  { icon: Gauge, title: 'Not an ATS score', body: 'JD keyword coverage is a rule of thumb for this tool. Real ATS systems differ.' },
  { icon: ShieldCheck, title: 'Free, no AI calls', body: 'Rule-based and transparent, so you can see why every suggestion was made.' },
];

const FAQ = [
  [
    'Is this an ATS score?',
    'No. It is JD keyword coverage: how many of the posting’s skills appear in your resume, weighted by how the posting marks them. It is a self-audit, not a prediction of what any real ATS will do.',
  ],
  [
    'Will it write things I didn’t do?',
    'Never. It only changes verbs and filler. If a bullet has no result, it adds a placeholder like [N] and asks you for the real number.',
  ],
  ['Do I need an account?', 'No. Guest mode has every feature. An account only keeps your saved resumes and audit history organised.'],
  [
    'Where is my resume stored?',
    'In this browser’s local storage, and only if you save it. You can export or delete everything from Settings.',
  ],
];

export default function Home() {
  useDocumentTitle(null);
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const { sample, preset, r, bullet, matched, reworded, missing } = useDemo();
  const heroPrints = [ITEMS[0], ITEMS[4], ITEMS[1]];

  const trySample = () => {
    loadSample(sample.id);
    navigate('/app/audit');
  };

  return (
    <div className="light-scope min-h-dvh bg-bg text-fg">
      <ZNav />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-20 h-[460px] w-[460px] rounded-full bg-[#fceb93]/50 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pt-20">
            <div>
              <p className={mono}>For first- and second-year students</p>
              <h1 className="mt-4 origin-left font-display text-[clamp(64px,10vw,150px)] font-semibold uppercase leading-[0.84] [transform:scaleX(.9)]">
                <span className="rise block overflow-hidden">
                  <span className="block" style={{ animationDelay: '200ms' }}>
                    Sharper
                  </span>
                </span>
                <span className="rise block overflow-hidden">
                  <span className="block" style={{ animationDelay: '260ms' }}>
                    resume.
                  </span>
                </span>
                <span className="rise block overflow-hidden">
                  <span className="block" style={{ animationDelay: '320ms' }}>
                    Zero fiction.
                  </span>
                </span>
              </h1>
              <p className="mt-6 max-w-[34ch] font-serif text-[22px] leading-snug text-fg-muted">
                Match your resume to an internship posting and sharpen every bullet, without inventing a single thing.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {session ? (
                  <Link to="/app/audit" className={ctaDark}>
                    Open my workspace <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link to="/signup?next=%2Fapp%2Faudit" className={ctaDark}>
                    Get started free <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                )}
                <button type="button" onClick={trySample} className={ctaLine}>
                  Try a sample
                </button>
              </div>
              <p className="mt-4 font-serif text-[15px] italic text-fg-subtle">
                No sign-up needed for the sample. Your resume never leaves your browser.
              </p>
            </div>

            <Link
              to="/gallery"
              className="group relative mx-auto block aspect-[5/5.2] w-full max-w-[520px]"
              aria-label="Walk the gallery of samples"
            >
              {heroPrints.map((item, i) => (
                <span
                  key={item.key}
                  className="absolute block w-[58%] bg-mat p-[3.5%] shadow-[0_24px_50px_-24px_rgba(58,53,80,.5)] transition-transform duration-500 motion-reduce:transition-none"
                  style={{
                    left: `${[2, 21, 40][i]}%`,
                    top: `${[10, 0, 14][i]}%`,
                    transform: `rotate(${[-7, 1.5, 8][i]}deg)`,
                    zIndex: i === 1 ? 3 : 2 - i,
                  }}
                >
                  <img src={printUrl(item)} alt="" className="block aspect-[567/763] w-full" />
                </span>
              ))}
              <span
                className={`absolute bottom-0 right-0 z-10 rounded-full bg-primary px-5 py-3 ${mono} text-primary-fg shadow-lg group-hover:bg-primary-hover`}
              >
                Walk the gallery →
              </span>
            </Link>
          </div>
        </section>

        {/* Before / after */}
        {bullet && (
          <section className="bg-band px-5 py-20 sm:px-8" aria-labelledby="before-after">
            <div className="mx-auto max-w-[1100px]">
              <p className={mono}>One real bullet from a sample resume</p>
              <h2 id="before-after" className="mt-3 font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
                Stronger, not made up
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
                <figure className="rounded-[8px] border border-line bg-surface p-7">
                  <figcaption className={`${mono} text-fg-subtle`}>Before</figcaption>
                  <p className="mt-3 font-serif text-[22px] leading-snug text-fg-muted">{bullet.text}</p>
                  <ul className="mt-5 space-y-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-muted">
                    {bullet.issues.slice(0, 3).map((issue) => (
                      <li key={issue.kind}>· {issue.message}</li>
                    ))}
                  </ul>
                </figure>
                <figure className="rounded-[8px] border border-fg bg-surface p-7">
                  <figcaption className={mono}>After</figcaption>
                  <p className="mt-3 font-serif text-[22px] leading-snug">
                    <WithPlaceholders text={bullet.rewrite} />
                  </p>
                  {bullet.questions[0] && (
                    <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-muted">
                      Ask yourself: {bullet.questions[0]}
                    </p>
                  )}
                </figure>
              </div>
              <p className="mt-5 font-serif text-[16px] italic text-fg-muted">
                The yellow placeholder is yours to fill with a real number. Copying warns you while any are left.
              </p>
            </div>
          </section>
        )}

        {/* Buckets */}
        <section className="px-5 py-20 sm:px-8" aria-labelledby="buckets">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className={mono}>
                  {sample.name}’s resume · {preset.role} posting
                </p>
                <h2 id="buckets" className="mt-3 font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
                  Three honest buckets
                </h2>
              </div>
              <dl className="flex gap-10">
                <div>
                  <dt className={mono}>Coverage now</dt>
                  <dd className="font-display text-[64px] font-medium leading-none">{r.coverage.now}%</dd>
                </div>
                <div>
                  <dt className={mono}>After rewording true skills</dt>
                  <dd className="font-display text-[64px] font-medium leading-none">{r.coverage.potential}%</dd>
                </div>
              </dl>
            </div>
            <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-subtle">
              JD keyword coverage · a rule of thumb for this tool, not an ATS score
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { title: 'Matched', tone: 'bg-success-soft', list: matched, note: 'Already in your resume, word for word.' },
                {
                  title: 'Worded differently',
                  tone: 'bg-warning-soft',
                  list: reworded,
                  note: 'You may have it. Use the posting’s words if it’s true.',
                },
                {
                  title: 'Not found',
                  tone: 'bg-danger-soft',
                  list: missing,
                  note: 'Don’t claim this unless it’s true. Have you used it? Where?',
                },
              ].map((b) => (
                <article key={b.title} className="rounded-[8px] border border-line bg-surface p-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-[26px] font-medium uppercase">{b.title}</h3>
                    <span className={`rounded-full px-3 py-1 font-mono text-[12px] ${b.tone}`}>{b.list.length}</span>
                  </div>
                  <p className="mt-2 font-serif text-[16px] italic text-fg-muted">{b.note}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {b.list.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em]"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-drawer px-5 py-20 text-[#3a3550] sm:px-8" aria-labelledby="how-title">
          <div className="mx-auto max-w-[1320px]">
            <h2 id="how-title" className="font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
              How it works
            </h2>
            <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="border-t border-[#3a3550]/30 pt-6">
                  <p className={mono}>{String(i + 1).padStart(2, '0')}</p>
                  <s.icon aria-hidden className="mt-4 h-7 w-7" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-[28px] font-medium uppercase">{s.title}</h3>
                  <p className="mt-2 font-serif text-[18px] leading-relaxed">
                    <WithPlaceholders text={s.body} />
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Promises */}
        <section className="px-5 py-20 sm:px-8" aria-labelledby="promises">
          <div className="mx-auto max-w-[1320px]">
            <h2 id="promises" className="font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
              Honest by design
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROMISES.map((p) => (
                <li key={p.title} className="rounded-[8px] border border-line bg-surface p-6">
                  <p.icon aria-hidden className="h-6 w-6" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-[22px] font-medium uppercase">{p.title}</h3>
                  <p className="mt-2 font-serif text-[16px] leading-relaxed text-fg-muted">{p.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 font-serif text-[16px] italic text-fg-muted">
              <EyeOff aria-hidden className="mt-1 h-4 w-4 shrink-0" />
              Honest limits: ProofCV reads pasted text only, real ATS systems differ, and this is a self-audit, not a guarantee.
            </p>
          </div>
        </section>

        {/* Gallery teaser */}
        <section className="bg-band px-5 py-20 sm:px-8" aria-labelledby="gallery-teaser">
          <div className="mx-auto max-w-[1320px]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 id="gallery-teaser" className="font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
                From the gallery
              </h2>
              <Link to="/gallery" className={`${mono} text-[12px] underline-offset-4 hover:underline`}>
                Walk the 3D gallery →
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
              {ITEMS.slice(0, 4).map((item) => (
                <li key={item.key}>
                  <Link to="/gallery?view=list" className="group block">
                    <span className="block bg-mat p-5">
                      <img
                        src={printUrl(item)}
                        alt=""
                        loading="lazy"
                        className="aspect-[567/763] w-full transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                      />
                    </span>
                    <span className="mt-3 block font-serif text-[19px] font-medium">{item.title}</span>
                    <span className="block font-serif text-[15px] italic text-fg-muted">{item.subtitle}</span>
                    <span className={`${mono} mt-1 block text-fg-subtle`}>{item.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-5 py-20 sm:px-8" aria-labelledby="faq-title">
          <div className="mx-auto max-w-[880px]">
            <h2 id="faq-title" className="font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
              Questions
            </h2>
            <div className="mt-8">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group border-t border-line py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-[21px] font-medium">
                    {q}
                    <span
                      aria-hidden
                      className="font-mono text-[18px] transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pt-3 font-serif text-[18px] leading-relaxed text-fg-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Live proof */}
        <section className="px-5 py-20 sm:px-8" aria-labelledby="proof-title">
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
            <div className="lg:sticky lg:top-28">
              <p className={mono}>Replayed from the four sample audits</p>
              <h2 id="proof-title" className="mt-3 font-display text-[clamp(40px,5vw,64px)] font-semibold uppercase leading-[0.95]">
                Proof, not promises
              </h2>
              <p className="mt-5 max-w-[46ch] font-serif text-[19px] leading-relaxed text-fg-muted">
                Every card is real output from ProofCV’s engine on our sample resumes: what it matched, what it found under other words,
                what it refused to suggest, and how it rewrote a bullet without inventing a number.
              </p>
              <p className="mt-4 font-serif text-[15px] italic text-fg-subtle">
                These are demo samples, not other people’s activity. Hover to pause.
              </p>
              <button type="button" onClick={trySample} className={`${ctaLine} mt-8`}>
                Run a sample yourself
              </button>
            </div>
            <LiveFeed />
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary px-5 py-20 text-primary-fg sm:px-8">
          <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <h2 className="font-display text-[clamp(48px,7vw,104px)] font-semibold uppercase leading-[0.88]">
              Your next bullet,
              <br />
              only truer.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={session ? '/app/audit' : '/signup?next=%2Fapp%2Faudit'}
                className="inline-flex h-[56px] items-center justify-center gap-2 rounded-[6px] bg-chip-on px-8 font-display text-[19px] font-medium uppercase tracking-[0.12em] text-[#3a3550] hover:bg-[#fbe46d]"
              >
                {session ? 'Open my workspace' : 'Create free account'} <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              {!session && (
                <Link
                  to="/login"
                  className="inline-flex h-[56px] items-center justify-center rounded-[6px] border border-primary-fg/60 px-8 font-display text-[19px] font-medium uppercase tracking-[0.12em] hover:bg-primary-fg/10"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
