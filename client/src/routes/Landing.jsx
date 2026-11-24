import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  CircleHelp,
  CircleX,
  ClipboardList,
  Eye,
  FileSearch,
  GitCompare,
  ListChecks,
  Lock,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { Badge, Button, Card, ProgressRing, Stepper } from '../components/ui/index.js';
import { SampleCard } from '../features/samples/SampleCard.jsx';
import { SAMPLES, ensureSession, loadSample } from '../features/samples/samples.js';
import { useDocumentTitle } from '../lib/hooks.js';

function HeroDemo() {
  const [after, setAfter] = useState(false);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setAfter((a) => !a), 3200);
    return () => clearInterval(t);
  }, [auto]);
  const toggle = () => {
    setAuto(false);
    setAfter((a) => !a);
  };

  return (
    <Card className="relative overflow-hidden p-0" aria-label="Example of ProofCV improving one bullet">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-g-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-g-yellow" />
        <span className="h-2.5 w-2.5 rounded-full bg-g-green" />
        <span className="ml-2 text-xs text-fg-subtle">proofcv · audit</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex justify-center">
          <ProgressRing
            value={after ? 66 : 28}
            size={148}
            stroke={13}
            label={after ? 'after rewording' : 'coverage now'}
            tone={after ? 'var(--warning)' : 'var(--success)'}
          />
        </div>
        <div className="min-w-0 space-y-3" aria-live="polite">
          <Badge tone={after ? 'success' : 'danger'} icon={after ? CircleCheck : TriangleAlert}>
            {after ? 'After' : 'Before'}
          </Badge>
          <p key={String(after)} className="animate-fade-up rounded-xl bg-surface-2 p-3 font-mono text-[13px] leading-6 text-fg">
            {after ? (
              <>
                Developed a <mark className="hl hl-matched">React</mark> fest website with <mark className="hl hl-matched">REST APIs</mark>{' '}
                (<mark className="hl hl-reworded">Express</mark>), used by <mark className="hl hl-placeholder">[N]</mark> students
              </>
            ) : (
              <>
                <mark className="hl hl-weak">Worked on</mark> a website for the college fest and <mark className="hl hl-weak">helped</mark>{' '}
                connect the backend <mark className="hl hl-weak">etc.</mark>
              </>
            )}
          </p>
          <ul className="flex flex-wrap gap-1.5 text-xs">
            <Badge tone={after ? 'success' : 'neutral'} icon={after ? CircleCheck : CircleX}>
              Strong verb
            </Badge>
            <Badge tone={after ? 'success' : 'neutral'} icon={after ? CircleCheck : CircleX}>
              Names a tool
            </Badge>
            <Badge tone="warning" icon={CircleHelp}>
              {after ? 'Fill in your real [N]' : 'No result'}
            </Badge>
          </ul>
          <button type="button" onClick={toggle} className="text-xs font-medium text-primary hover:underline">
            {after ? 'Show before' : 'Show after'}
            {auto ? '' : ' (paused)'}
          </button>
        </div>
      </div>
    </Card>
  );
}

const BUCKETS = [
  {
    icon: CircleCheck,
    tone: 'success',
    title: 'Already in your resume',
    body: 'Your resume uses the same words as the posting.',
    example: 'JD: "React" → you wrote "React"',
  },
  {
    icon: Search,
    tone: 'warning',
    title: 'Worded differently',
    body: "Related wording is already there. Use the posting's term only if it's accurate.",
    example: 'JD: "version control" → you wrote "GitHub"',
  },
  {
    icon: CircleX,
    tone: 'danger',
    title: 'Not found',
    body: "A real gap. Don't claim it unless it's true. Learn it, build with it, or leave it out.",
    example: 'JD: "Docker" → nowhere in your resume',
  },
];
const BUCKET_STYLE = {
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-danger-soft text-danger-fg',
};

const FEATURES = [
  {
    icon: FileSearch,
    title: 'Side-by-side audit',
    body: 'Resume on the left, job posting on the right, with highlights in both as you type.',
  },
  {
    icon: ShieldCheck,
    title: 'Honest-add check',
    body: 'Splits gaps into "worded differently" and "not found", and never tells you to claim a skill.',
  },
  {
    icon: PenLine,
    title: 'Bullet rewriter',
    body: 'Stronger verbs, the tools you named, and a [N] placeholder where your real result should go.',
  },
  { icon: ListChecks, title: 'Per-bullet checklist', body: 'Strong verb, names a tool, real result, 12–25 words. Four ticks per bullet.' },
  { icon: ClipboardList, title: 'Top 5 fixes', body: 'The most useful changes first, copyable as a to-do list or printable as a report.' },
  { icon: Target, title: 'Role presets', body: 'SDE, Frontend, Data Analyst and ML intern postings, ready to compare against.' },
];

const FAQ = [
  {
    q: 'Is my resume uploaded anywhere?',
    a: "No. The analysis runs in your browser. Saved resumes and audit history are stored in this browser's local storage on your device. ProofCV's server never receives your resume text.",
  },
  {
    q: 'Is this an "ATS score"?',
    a: "No. It shows JD keyword coverage: how many of the skills listed in one posting appear in your resume, using ProofCV's own dictionary and weights. Real ATS systems differ by employer. Treat the number as a rule of thumb, not a pass/fail prediction.",
  },
  {
    q: 'Will it write achievements for me?',
    a: 'No, on purpose. It upgrades verbs and structure, but missing numbers become [N] placeholders with questions like "How many users?" Only you know the true answer.',
  },
  {
    q: 'Why does it say "worded differently"?',
    a: 'Your resume might say "GitHub" while the posting says "version control". If that describes what you really did, using the posting\'s wording can help. A word in your resume isn\'t proof of a skill. You decide what\'s true.',
  },
  {
    q: 'Can it read my PDF?',
    a: "Paste the text for now. ProofCV reads pasted text only, so it can't check layout, columns or fonts. See the format checklist inside the audit.",
  },
  {
    q: 'Do I need an account?',
    a: 'No. Guest mode has every feature. An account only keeps your saved resumes and history organised under your profile on this device.',
  },
];

const PROBLEMS = [
  { icon: TriangleAlert, title: 'Vague bullets', body: '"Worked on a website" says nothing about what you built or what it achieved.' },
  {
    icon: Target,
    title: 'Missing keywords',
    body: 'Postings list specific skills. If your resume uses other words, a recruiter skimming for them can miss you.',
  },
  { icon: Wallet, title: 'Paid coaches', body: "Resume reviews cost money most first-years don't have. ProofCV is free." },
];

export default function Landing() {
  useDocumentTitle('');
  const navigate = useNavigate();
  const startAudit = () => {
    ensureSession();
    navigate('/app/audit');
  };
  const openSample = (sample) => {
    loadSample(sample?.id);
    navigate('/app/audit');
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 max-w-4xl rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--g-blue)_18%,transparent),transparent)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Badge tone="primary" icon={Sparkles}>
              Free · No sign-up · Runs in your browser
            </Badge>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-tight text-fg sm:text-[56px]">
              Sharper resume.
              <br />
              <span className="bg-gradient-to-r from-g-blue via-g-red to-g-yellow bg-clip-text text-transparent">Zero fiction.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-fg-muted">
              Paste your resume and an internship posting. ProofCV shows which keywords you already cover, which you may have under other
              wording, and how to make each bullet stronger without inventing a single number.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" iconRight={ArrowRight} onClick={startAudit}>
                Audit my resume
              </Button>
              <Button size="lg" variant="secondary" icon={Eye} onClick={() => openSample()}>
                See a sample
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-fg-muted">
              <Lock aria-hidden className="h-4 w-4" /> Your resume never leaves your browser.
            </p>
          </div>
          <HeroDemo />
        </div>
      </section>

      {/* Problem strip */}
      <section aria-labelledby="problem" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 id="problem" className="text-center text-sm font-semibold uppercase tracking-wider text-fg-subtle">
            Why first-years get filtered out
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger-fg">
                  <p.icon aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-fg">{p.title}</p>
                  <p className="mt-0.5 text-sm text-fg-muted">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buckets */}
      <section aria-labelledby="buckets" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 id="buckets" className="text-[28px] font-bold tracking-tight text-fg sm:text-[40px]">
            Three buckets, no wishful thinking
          </h2>
          <p className="mt-3 text-fg-muted">
            Every skill in the posting lands in one of three buckets. Only the first two can raise your coverage honestly.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {BUCKETS.map((b) => (
            <Card key={b.title}>
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${BUCKET_STYLE[b.tone]}`}>
                <b.icon aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg">{b.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">{b.body}</p>
              <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-fg-muted">{b.example}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" aria-labelledby="features-h" className="scroll-mt-20 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="features-h" className="text-[28px] font-bold tracking-tight text-fg sm:text-[40px]">
            Everything a self-audit needs
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-[var(--radius-card)] border border-line p-5">
                <f.icon aria-hidden className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold text-fg">{f.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-h" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 id="how-h" className="text-[28px] font-bold tracking-tight text-fg sm:text-[40px]">
          How it works
        </h2>
        <div className="mt-10">
          <Stepper
            steps={[
              { title: 'Paste', body: 'Your resume text and the internship posting, or pick a sample role.' },
              { title: 'Review', body: 'See coverage, the three buckets, and highlights on weak phrases.' },
              { title: 'Rewrite honestly', body: 'Fix bullets with real numbers, apply them, and watch coverage update.' },
            ]}
          />
        </div>
      </section>

      {/* Samples */}
      <section id="samples" aria-labelledby="samples-h" className="scroll-mt-20 border-y border-line bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="samples-h" className="text-[28px] font-bold tracking-tight text-fg sm:text-[40px]">
                Try a sample
              </h2>
              <p className="mt-2 text-fg-muted">Fictional student resumes, each paired with a matching internship posting.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLES.map((s) => (
              <SampleCard key={s.id} sample={s} onSelect={openSample} />
            ))}
          </div>
        </div>
      </section>

      {/* Privacy + limits */}
      <section aria-label="Privacy and limits" className="mx-auto grid max-w-6xl gap-4 px-4 py-20 sm:px-6 md:grid-cols-2">
        <Card className="p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-success-soft text-success-fg">
            <Lock aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold text-fg">Runs in your browser</h2>
          <p className="mt-2 text-sm text-fg-muted">
            The whole analysis is rule-based code running on your device. No resume upload, no AI service, no tracking. Saved resumes live
            in this browser&apos;s storage, and you can delete them anytime from Settings.
          </p>
        </Card>
        <Card className="p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-warning-soft text-warning-fg">
            <BadgeCheck aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold text-fg">Honest about its limits</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-fg-muted">
            <li>• Reads pasted text only. It can&apos;t check your PDF&apos;s layout or parsing.</li>
            <li>• Real ATS systems differ by employer. Coverage is a rule of thumb for this tool.</li>
            <li>• It&apos;s a self-audit, not a guarantee of interviews.</li>
          </ul>
        </Card>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-h" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <h2 id="faq-h" className="text-center text-[28px] font-bold tracking-tight text-fg sm:text-[40px]">
          Questions
        </h2>
        <div className="mt-8 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg">
                {f.q}
                <span aria-hidden className="text-xl leading-none text-fg-subtle transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-fg-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#1a73e8] px-6 py-12 text-center text-white sm:px-12">
          <GitCompare aria-hidden className="mx-auto h-8 w-8 opacity-80" />
          <h2 className="mt-4 text-[28px] font-bold sm:text-[40px]">Your next internship application, sharper.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">One minute, no account, nothing uploaded.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={startAudit}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-medium text-[#174ea6] hover:bg-white/90"
            >
              Audit my resume <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openSample()}
              className="inline-flex h-12 items-center rounded-xl px-6 font-medium text-white ring-1 ring-white/50 hover:bg-white/10"
            >
              See a sample
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
