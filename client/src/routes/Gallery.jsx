import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { analyze, PARODY_NOTICE, PRESETS, SAMPLES } from '@proofcv/shared';
import { RoleSelect } from '../features/samples/RoleSelect.jsx';
import { ZNav } from '../components/layout/ZNav.jsx';
import { useToast } from '../components/ui/index.js';
import { ITEMS } from '../features/gallery/items.js';
import { printUrl } from '../features/gallery/artwork.js';
import { ArcList } from '../features/gallery/ArcList.jsx';
import { ensureSession, loadSample } from '../features/samples/samples.js';
import { toAuditSnapshot } from '../features/audit/useAudit.js';
import { useStore } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function fontsReady() {
  if (!document.fonts) return;
  const wanted = [
    '500 58px "Newsreader Variable"',
    'italic 400 46px "Newsreader Variable"',
    '400 30px "DM Mono"',
    '600 34px "Oswald Variable"',
  ];
  await Promise.race([Promise.all(wanted.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2500))]);
}

const mono = 'font-mono text-[11px] uppercase tracking-[0.14em]';
const chip = (on) =>
  `h-9 rounded-full border px-4 ${mono} transition-colors ${on ? 'border-[#3a3550] bg-[#fceb93]' : 'border-[#3a3550]/35 hover:border-[#3a3550]'}`;

/** Renders text with [placeholders] highlighted. */
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

function Rise({ children, i = 0, className = '' }) {
  return (
    <span className={`rise block overflow-hidden ${className}`}>
      <span className="block" style={{ animationDelay: `${250 + i * 60}ms` }}>
        {children}
      </span>
    </span>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group border-t border-[#3a3550]/20 py-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-[19px] font-medium uppercase tracking-[0.08em]">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="pt-3 font-serif text-[17px] leading-relaxed">{children}</div>
    </details>
  );
}

function SkillChips({ skills, status, empty }) {
  const list = skills.filter((s) => s.status === status);
  if (!list.length) return <p className="font-serif text-[16px] italic opacity-70">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {list.map((s) => (
        <li
          key={s.id}
          title={s.advice}
          className="rounded-full border border-[#3a3550]/25 bg-[#fff9ef] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em]"
        >
          {s.name}
          {s.level === 'required' && <span className="ml-1 opacity-60">· req</span>}
        </li>
      ))}
    </ul>
  );
}

function ResumeDetails({ item, presetId, setPresetId, onSaved }) {
  const navigate = useNavigate();
  const toast = useToast();
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const result = useMemo(() => analyze(item.text, preset.jd), [item.text, preset.jd]);
  const weak = result.bullets.filter((b) => b.strength !== 'strong');

  const save = () => {
    ensureSession();
    const draft = { title: `${item.title} (sample)`, resume: item.text, jd: preset.jd };
    useStore.getState().saveAudit(toAuditSnapshot({ draft, result, role: preset.role, resumeId: null }));
    toast('Saved to your audits, in this browser only.');
    onSaved();
  };
  const audit = () => {
    loadSample(item.sampleId);
    if (preset.id !== item.presetId) useStore.getState().updateDraft({ jd: preset.jd, presetId: preset.id });
    navigate('/app/audit');
  };

  return (
    <>
      <p className={`${mono} mt-8`}>Job posting</p>
      <RoleSelect value={preset.id} onChange={setPresetId} className="mt-3" />

      <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] bg-[#3a3550]/20">
        <div className="bg-[#fbf3e4] p-5">
          <p className={mono}>Coverage now</p>
          <p className="mt-1 font-display text-[54px] font-medium leading-none">{result.coverage?.now ?? 0}%</p>
          <p className="mt-1 font-serif text-[14px] italic opacity-75">exact matches only</p>
        </div>
        <div className="bg-[#fbf3e4] p-5">
          <p className={mono}>After rewording true skills</p>
          <p className="mt-1 font-display text-[54px] font-medium leading-none">{result.coverage?.potential ?? 0}%</p>
          <p className="mt-1 font-serif text-[14px] italic opacity-75">if the related wording is true</p>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.1em] opacity-65">
        JD keyword coverage · a rule of thumb for this tool, not an ATS score
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <p className={`${mono} mb-2`}>Matched · {result.coverage?.matched ?? 0}</p>
          <SkillChips skills={result.skills} status="matched" empty="No exact matches yet." />
        </div>
        <div>
          <p className={`${mono} mb-2`}>Worded differently · {result.coverage?.reworded ?? 0}</p>
          <SkillChips skills={result.skills} status="reworded" empty="Nothing hiding under other words." />
        </div>
        <div>
          <p className={`${mono} mb-2`}>Not found · {result.coverage?.missing ?? 0}</p>
          <SkillChips skills={result.skills} status="missing" empty="No gaps for this posting." />
          {result.coverage?.missing > 0 && (
            <p className="mt-2 font-serif text-[15px] italic opacity-80">
              Don’t claim these unless they’re true. Have you used them? Where?
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={save}
          className="h-[54px] border border-[#3a3550] font-display text-[17px] font-medium uppercase tracking-[0.12em] hover:bg-[#3a3550]/5"
        >
          Save to my audits
        </button>
        <button
          type="button"
          onClick={audit}
          className="flex h-[54px] items-center justify-center gap-2 bg-[#3a3550] font-display text-[17px] font-medium uppercase tracking-[0.12em] text-[#fff9ec] hover:bg-[#2a2640]"
        >
          Audit this resume <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-10">
        <Accordion title={`Bullets to sharpen · ${weak.length}`} defaultOpen>
          {weak.length === 0 ? (
            <p className="italic">Every bullet passes the checklist.</p>
          ) : (
            <ul className="space-y-4">
              {weak.slice(0, 4).map((b) => (
                <li key={b.start}>
                  <p className="opacity-70 line-through decoration-[#3a3550]/30">{b.text}</p>
                  {b.rewrite && (
                    <p className="mt-1">
                      → <WithPlaceholders text={b.rewrite} />
                    </p>
                  )}
                  {b.questions[0] && (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] opacity-70">Ask yourself: {b.questions[0]}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[15px] italic opacity-75">
            Yellow [N] marks are placeholders for your real numbers. ProofCV never fills them in for you.
          </p>
        </Accordion>
      </div>
    </>
  );
}

function BlankDetails() {
  const navigate = useNavigate();
  const start = () => {
    ensureSession();
    useStore.getState().updateDraft({ resume: '', jd: '', presetId: '', resumeId: null, title: '' });
    navigate('/app/audit');
  };
  return (
    <button
      type="button"
      onClick={start}
      className="mt-8 flex h-[54px] w-full items-center justify-center gap-2 bg-[#3a3550] font-display text-[17px] font-medium uppercase tracking-[0.12em] text-[#fff9ec] hover:bg-[#2a2640]"
    >
      Start a blank audit <ArrowRight className="h-4 w-4" />
    </button>
  );
}

/** Full-page view of one print: sticky preview on a mat, details on the right. */
function PrintPage({ index, fromRect, onClose, onOpen, onSaved }) {
  const item = ITEMS[index];
  const preview = useRef(null);
  const flyer = useRef(null);
  const scroller = useRef(null);
  const [landed, setLanded] = useState(!fromRect || reducedMotion());
  const [presetId, setPresetId] = useState(item.presetId ?? PRESETS[0].id);

  useLayoutEffect(() => {
    scroller.current?.scrollTo(0, 0);
    if (!fromRect || reducedMotion() || !preview.current || !flyer.current) return undefined;
    const to = preview.current.getBoundingClientRect();
    const el = flyer.current;
    Object.assign(el.style, {
      left: `${to.left}px`,
      top: `${to.top}px`,
      width: `${to.width}px`,
      height: `${to.height}px`,
      display: 'block',
    });
    const dx = fromRect.left - to.left;
    const dy = fromRect.top - to.top;
    const anim = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${fromRect.width / to.width}, ${fromRect.height / to.height})` },
        { transform: 'none' },
      ],
      { duration: 300, easing: 'cubic-bezier(.1,.85,.2,1)', fill: 'forwards' },
    );
    anim.onfinish = () => {
      setLanded(true);
      el.style.display = 'none';
    };
    return () => anim.cancel();
  }, [fromRect]);

  const others = [1, 2, 3, 4].map((k) => (index + k) % ITEMS.length);
  const kicker = item.kind === 'blank' ? 'Your turn' : 'Parody sample resume';

  return (
    <div
      ref={scroller}
      className="light-scope fixed inset-0 z-50 overflow-y-auto bg-[#fff9ef] text-[#3a3550]"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <img
        ref={flyer}
        src={printUrl(item)}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed z-[70] hidden origin-top-left object-cover"
      />
      <div className="sticky top-0 z-10 flex h-[64px] items-center justify-between bg-[#fff9ef]/92 px-5 backdrop-blur sm:px-8">
        <button type="button" onClick={onClose} className={`flex items-center gap-2 ${mono} hover:underline`}>
          <ArrowLeft className="h-4 w-4" /> Back to the gallery
        </button>
        <p className={`${mono} hidden opacity-70 sm:block`}>
          {String(index + 1).padStart(2, '0')} / {String(ITEMS.length).padStart(2, '0')}
        </p>
      </div>

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-[64px] lg:self-start">
          <div className="grid place-items-center bg-[#f6ead8] p-[clamp(20px,5vw,72px)] lg:min-h-[calc(100dvh-96px)]">
            <img
              ref={preview}
              src={printUrl(item)}
              alt={`${item.title}: ${item.subtitle}`}
              className={`aspect-[567/763] w-full max-w-[520px] shadow-[0_18px_40px_-18px_rgba(58,53,80,.45)] ${landed ? '' : 'opacity-0'}`}
            />
          </div>
        </div>

        <div
          className={`transition-opacity duration-500 motion-reduce:transition-none lg:pt-10 ${landed ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: fromRect && !reducedMotion() ? '700ms' : '0ms' }}
        >
          <p className={mono}>{kicker}</p>
          <h1 className="mt-3 font-display text-[clamp(48px,6vw,84px)] font-semibold uppercase leading-[0.9]">{item.title}</h1>
          <p className="mt-3 font-serif text-[22px] italic">{item.subtitle}</p>
          <p className={`${mono} mt-3 opacity-70`}>{item.meta}</p>
          <p className="mt-6 max-w-[56ch] font-serif text-[19px] leading-relaxed">{item.description}</p>
          {item.kind === 'resume' && <p className={`${mono} mt-4 max-w-[60ch] leading-relaxed opacity-65`}>{PARODY_NOTICE}</p>}

          {item.kind === 'resume' && <ResumeDetails item={item} presetId={presetId} setPresetId={setPresetId} onSaved={onSaved} />}
          {item.kind === 'blank' && <BlankDetails />}

          <div className="mt-6">
            <Accordion title="Honest limits">
              ProofCV reads pasted text only. Real ATS systems differ from company to company, so coverage here is a rule of thumb for this
              tool. It is a self-audit, not a guarantee of interviews.
            </Accordion>
            <Accordion title="Privacy">
              Audits never leave your browser: analysis runs on this device and no endpoint accepts audit text. Saved audits stay in this browser’s
              storage until you delete them in Settings. Only the optional AI resume builder sends text to a server, and it asks first.
            </Accordion>
          </div>
        </div>
      </div>

      <section className="bg-[#fbf3e4] px-5 py-14 sm:px-8" aria-label="More in the gallery">
        <h2 className="font-display text-[34px] font-semibold uppercase">More in the gallery</h2>
        <ul className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {others.map((i) => (
            <li key={ITEMS[i].key}>
              <button type="button" onClick={() => onOpen(i)} className="group block w-full text-left">
                <span className="block bg-[#f6ead8] p-5">
                  <img
                    src={printUrl(ITEMS[i])}
                    alt=""
                    className="aspect-[567/763] w-full transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                  />
                </span>
                <span className="mt-3 block font-serif text-[19px] font-medium">{ITEMS[i].title}</span>
                <span className="block font-serif text-[15px] italic opacity-80">{ITEMS[i].subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ListView({ onOpen }) {
  return (
    <section className="light-scope min-h-dvh bg-[#fff9ec] px-5 pb-20 pt-[112px] text-[#3a3550] sm:px-8" aria-label="All samples">
      <h1 className="font-display text-[clamp(40px,6vw,72px)] font-semibold uppercase leading-none">ProofCV — all samples</h1>
      <p className="mt-3 max-w-[60ch] font-serif text-[19px] italic">
        Pick a resume. {SAMPLES.length} parody samples, one for each of India’s top early-career roles, and a frame for yours.
      </p>
      <p className={`${mono} mt-4 max-w-[70ch] leading-relaxed opacity-70`}>{PARODY_NOTICE}</p>
      <div className="mt-10">
        <ArcList items={ITEMS} getImage={printUrl} onOpen={onOpen} label="Sample resumes" />
      </div>
      <p className={`${mono} mt-8 opacity-60`}>Scroll, swipe or use the arrow keys to turn the list. Enter opens.</p>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'list' ? 'list' : 'gallery';
  const canvas = useRef(null);
  const gallery = useRef(null);
  const [glFailed, setGlFailed] = useState(false);
  const [veil, setVeil] = useState(true);
  const [hover, setHover] = useState(null);
  const [focus, setFocus] = useState(null);
  const [open, setOpen] = useState(null); // { index, rect }
  const [drawer, setDrawer] = useState(false);
  useDocumentTitle(open ? ITEMS[open.index].title : null);

  const setView = (v) => setParams(v === 'list' ? { view: 'list' } : {}, { replace: true });
  const openItem = useCallback((index, rect = null) => setOpen({ index, rect }), []);

  useEffect(() => {
    if (view !== 'gallery') return undefined;
    let disposed = false;
    (async () => {
      try {
        const [{ createGallery }] = await Promise.all([import('../features/gallery/scene.js'), fontsReady()]);
        if (disposed || !canvas.current) return;
        gallery.current = createGallery({
          canvas: canvas.current,
          items: ITEMS,
          reducedMotion: reducedMotion(),
          onHover: setHover,
          onFocus: setFocus,
          onOpen: (index, rect) => setOpen({ index, rect }),
        });
        requestAnimationFrame(() => setVeil(false));
      } catch (err) {
        console.error('Gallery unavailable, showing list', err);
        if (!disposed) {
          setGlFailed(true);
          setVeil(false);
        }
      }
    })();
    return () => {
      disposed = true;
      gallery.current?.dispose();
      gallery.current = null;
      setFocus(null);
    };
  }, [view]);

  useEffect(() => gallery.current?.setPaused(open !== null), [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (open || drawer || view !== 'gallery') return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') gallery.current?.next();
      else if (e.key === 'ArrowLeft') gallery.current?.prev();
      else if (e.key === 'Escape') gallery.current?.stepBack();
      else if (e.key === 'Enter' && focus !== null) {
        const rect = gallery.current?.rectOfFocused();
        openItem(focus, rect);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, drawer, view, focus, openItem]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && !drawer && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, drawer]);

  const showList = view === 'list' || glFailed;
  const label = hover ?? focus;
  const focusedItem = focus !== null ? ITEMS[focus] : null;

  return (
    <div className="light-scope relative min-h-dvh bg-[#fff9ec] text-[#3a3550]">
      <ZNav overlay drawerOpen={drawer} onDrawerChange={setDrawer} />

      {!glFailed && (
        <div className="absolute right-5 top-[80px] z-30 flex gap-1.5 sm:right-8" role="group" aria-label="View">
          <button type="button" className={chip(view === 'gallery')} aria-pressed={view === 'gallery'} onClick={() => setView('gallery')}>
            Gallery
          </button>
          <button type="button" className={chip(view === 'list')} aria-pressed={view === 'list'} onClick={() => setView('list')}>
            List
          </button>
        </div>
      )}

      <main id="main">
        {showList ? (
          <ListView onOpen={(i) => openItem(i)} />
        ) : (
          <section className="relative h-dvh overflow-hidden" aria-label="Resume gallery">
            <canvas ref={canvas} className="absolute inset-0 h-full w-full cursor-grab touch-none select-none" aria-hidden="true" />
            <div
              className={`pointer-events-none absolute inset-0 bg-[#fff9ec] transition-opacity duration-[900ms] motion-reduce:transition-none ${veil ? 'opacity-100' : 'opacity-0'}`}
            />

            <h2 className="sr-only">
              A gallery of parody sample resumes. Use the arrow buttons or keys to move, or switch to the list view.
            </h2>

            <div className="pointer-events-none absolute bottom-[96px] left-5 md:bottom-[calc(56*var(--u))] z-20 sm:left-8">
              <p className={`${mono} text-[calc(13*var(--u))]`}>
                <Rise i={0}>Sharper resume.</Rise>
              </p>
              <h1
                className="mt-1 origin-left font-display font-semibold uppercase leading-[0.84] [transform:scaleX(.855)]"
                style={{ fontSize: 'min(calc(170 * var(--u)), 25vw)' }}
              >
                <Rise i={1}>Zero</Rise>
                <Rise i={2}>fiction</Rise>
              </h1>
              <button
                type="button"
                onClick={() => {
                  loadSample();
                  navigate('/app/audit');
                }}
                className={`pointer-events-auto mt-4 inline-flex items-center gap-2 ${mono} text-[12px] underline-offset-4 hover:underline`}
              >
                <Rise i={3}>Try a sample audit →</Rise>
              </button>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-[calc(40*var(--u))] z-20 hidden justify-center md:flex">
              {focusedItem ? (
                <button
                  type="button"
                  className="pointer-events-auto h-11 rounded-full bg-[#3a3550] px-6 font-mono text-[12px] uppercase tracking-[0.14em] text-[#fff9ec] shadow-lg hover:bg-[#2a2640]"
                  onClick={() => openItem(focus, gallery.current?.rectOfFocused())}
                >
                  Open the resume
                </button>
              ) : (
                <p className={`${mono} text-center opacity-70`}>
                  Scroll or drag to walk round
                  <br />
                  Click a resume to look closer
                </p>
              )}
            </div>

            {focusedItem && (
              <button
                type="button"
                className="absolute bottom-24 left-1/2 z-20 h-11 -translate-x-1/2 rounded-full bg-[#3a3550] px-6 font-mono text-[12px] uppercase tracking-[0.14em] text-[#fff9ec] md:hidden"
                onClick={() => openItem(focus, gallery.current?.rectOfFocused())}
              >
                Open the resume
              </button>
            )}

            <div className="absolute bottom-[calc(48*var(--u))] right-5 z-20 flex items-center gap-2 sm:right-8">
              {focusedItem && (
                <button type="button" onClick={() => gallery.current?.stepBack()} className={`${chip(false)} mr-2 bg-[#fff9ec]/80`}>
                  Step back
                </button>
              )}
              <button
                type="button"
                aria-label="Previous"
                onClick={() => gallery.current?.prev()}
                className="grid h-12 w-12 place-items-center rounded-full border border-[#3a3550]/40 bg-[#fff9ec]/80 hover:border-[#3a3550]"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => gallery.current?.next()}
                className="grid h-12 w-12 place-items-center rounded-full border border-[#3a3550]/40 bg-[#fff9ec]/80 hover:border-[#3a3550]"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <p className="sr-only" aria-live="polite">
              {label !== null ? `${ITEMS[label].title}, ${ITEMS[label].subtitle}` : ''}
            </p>
          </section>
        )}
      </main>

      {open && (
        <PrintPage
          key={open.index}
          index={open.index}
          fromRect={open.rect}
          onClose={() => setOpen(null)}
          onOpen={(i) => setOpen({ index: i, rect: null })}
          onSaved={() => setDrawer(true)}
        />
      )}
    </div>
  );
}
