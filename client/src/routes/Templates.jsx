import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Check, ChevronDown, Code2, Copy, Download, ExternalLink, FileSearch, Printer, TriangleAlert } from 'lucide-react';
import { PARODY_NOTICE, SAMPLES, TEMPLATES, countPlaceholders, parseResume, resumeToLatex } from '@proofcv/shared';
import { Button, useToast } from '../components/ui/index.js';
import { useUserData } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { PAGE_W, TemplatePreview } from '../features/templates/TemplatePreview.jsx';

const mono = 'font-mono text-[11px] uppercase tracking-[0.14em]';
const THUMB = 0.3;

const slug = (s) =>
  String(s || 'resume')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'resume';

/** Where the resume text comes from: the audit draft, a saved resume, or a parody sample. */
function useSources() {
  const { draft, resumes } = useUserData();
  return useMemo(() => {
    const out = [];
    if (draft.resume.trim()) out.push({ id: 'draft', label: `Current draft${draft.title ? ` · ${draft.title}` : ''}`, text: draft.resume });
    for (const r of resumes) if (r.text?.trim()) out.push({ id: `resume:${r.id}`, label: `Saved · ${r.title}`, text: r.text });
    for (const s of SAMPLES) out.push({ id: `sample:${s.id}`, label: `Parody sample · ${s.name}`, text: s.resume, sample: true });
    return out;
  }, [draft.resume, draft.title, resumes]);
}

/** Sends the .tex to Overleaf's documented "open in Overleaf" endpoint in a new tab. Only on click. */
function openInOverleaf(tex, name) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.overleaf.com/docs';
  form.target = '_blank';
  form.rel = 'noopener';
  for (const [k, v] of Object.entries({ encoded_snip: encodeURIComponent(tex), snip_name: name, engine: 'pdflatex' })) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/x-tex;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Scales the full-size preview down to whatever width its column has. */
function FitPreview({ templateId, model }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0.6);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / PAGE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="w-full">
      {/* zoom (not transform) so a resume longer than one page grows the box instead of being clipped */}
      <div className="tpl-zoom mx-auto w-fit shadow-[0_24px_60px_-30px_rgba(58,53,80,.45)]" style={{ zoom: scale }}>
        <TemplatePreview templateId={templateId} model={model} />
      </div>
    </div>
  );
}

export default function Templates() {
  useDocumentTitle('Templates');
  const toast = useToast();
  const sources = useSources();
  const [params, setParams] = useSearchParams();
  const sourceId = sources.some((s) => s.id === params.get('source')) ? params.get('source') : sources[0].id;
  const templateId = TEMPLATES.some((t) => t.id === params.get('t')) ? params.get('t') : null;
  const source = sources.find((s) => s.id === sourceId);
  const model = useMemo(() => parseResume(source.text), [source.text]);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const detail = useRef(null);

  const template = TEMPLATES.find((t) => t.id === templateId);
  const tex = useMemo(() => (template ? resumeToLatex(source.text, template.id) : ''), [source.text, template]);
  const gaps = countPlaceholders(source.text);
  const fileBase = `${slug(model.name)}-${template?.id ?? 'resume'}`;

  const set = (patch) => setParams((p) => ({ ...Object.fromEntries(p), ...patch }), { replace: true });
  const choose = (id) => {
    set({ t: id });
    setShowCode(false);
    requestAnimationFrame(() => detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast('LaTeX copied. Paste it into a new Overleaf project or any .tex file.', { tone: 'success' });
    } catch {
      toast('Copy was blocked by the browser. Use Download .tex instead.', { tone: 'warning' });
    }
  };

  return (
    <div className="space-y-10">
      <header className="no-print flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[62ch]">
          <h1 className="font-display text-[44px] font-semibold uppercase leading-none">Templates</h1>
          <p className="mt-3 font-serif text-[18px] text-fg-muted">
            Re-create your resume in any of these designs and get ready-to-compile LaTeX. The template changes the look, never the facts:
            every word comes from your resume.
          </p>
        </div>
        <div className="w-full max-w-[360px]">
          <label htmlFor="tpl-source" className={`${mono} mb-1.5 block text-fg-muted`}>
            Resume to use
          </label>
          <div className="relative">
            <select
              id="tpl-source"
              value={sourceId}
              onChange={(e) => set({ source: e.target.value })}
              className="h-[48px] w-full appearance-none rounded-[6px] border border-line-strong bg-surface pl-4 pr-11 font-serif text-[16px] text-fg outline-none focus:border-fg focus:ring-2 focus:ring-[#fceb93]"
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          </div>
          {!sources.some((s) => !s.sample) && (
            <p className="mt-2 font-serif text-[14px] text-fg-muted">
              No resume of yours yet. <Link to="/app/audit" className="underline underline-offset-4 hover:text-fg">Paste one in Audit</Link> or{' '}
              <Link to="/app/agent" className="underline underline-offset-4 hover:text-fg">build one with the AI Builder</Link>.
            </p>
          )}
          {source.sample && <p className="mt-2 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.08em] text-fg-subtle">{PARODY_NOTICE}</p>}
        </div>
      </header>

      <ul className="no-print grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3" aria-label="Resume templates">
        {TEMPLATES.map((t) => {
          const on = t.id === templateId;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => choose(t.id)}
                aria-pressed={on}
                className={`group block w-full rounded-[10px] p-4 text-left transition-colors ${on ? 'bg-chip-on/60 ring-2 ring-fg' : 'bg-band hover:bg-mat'}`}
              >
                <span className="mx-auto block w-fit shadow-[0_18px_40px_-24px_rgba(58,53,80,.55)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                  <TemplatePreview templateId={t.id} model={model} scale={THUMB} />
                </span>
              </button>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h2 className="font-display text-[28px] font-semibold uppercase leading-none">{t.name}</h2>
                {t.topPick && <span className={`${mono} shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-success-fg`}>Top pick</span>}
              </div>
              <p className="mt-2 font-serif text-[16px] text-fg-muted">{t.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {t.tags.map((tag) => (
                  <span key={tag} className={`${mono} rounded-full border border-line-strong px-2.5 py-1 text-fg-muted`}>
                    {tag}
                  </span>
                ))}
              </div>
              <Button className="mt-4 w-full" variant={on ? 'primary' : 'secondary'} onClick={() => choose(t.id)}>
                {on ? 'Selected' : 'Re-create my resume in this'}
              </Button>
            </li>
          );
        })}
      </ul>

      {template && (
        <section ref={detail} className="scroll-mt-24 border-t border-line pt-10" aria-labelledby="tpl-detail">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="print-area">
              <FitPreview templateId={template.id} model={model} />
            </div>
            <aside className="no-print lg:sticky lg:top-24 lg:self-start">
              <p className={`${mono} text-fg-muted`}>Your resume in</p>
              <h2 id="tpl-detail" className="mt-1 font-display text-[40px] font-semibold uppercase leading-none">
                {template.name}
              </h2>
              <p className="mt-3 font-serif text-[16px] text-fg-muted">{template.blurb}</p>

              {gaps > 0 && (
                <p className="mt-5 flex gap-2 rounded-[6px] bg-warning-soft px-4 py-3 font-serif text-[15px] text-warning-fg">
                  <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                  {gaps} placeholder{gaps > 1 ? 's' : ''} like [N] still {gaps > 1 ? 'need' : 'needs'} a real number. They print in red until you fill them in.
                </p>
              )}

              <div className="mt-6 grid gap-2">
                <Button icon={copied ? Check : Copy} onClick={copy}>
                  {copied ? 'Copied' : 'Copy LaTeX'}
                </Button>
                <Button variant="secondary" icon={Download} onClick={() => download(tex, `${fileBase}.tex`)}>
                  Download .tex
                </Button>
                <Button variant="secondary" icon={ExternalLink} onClick={() => openInOverleaf(tex, `${fileBase}.tex`)}>
                  Open in Overleaf
                </Button>
                <Button variant="ghost" icon={Printer} onClick={() => window.print()}>
                  Print or save as PDF
                </Button>
                <Button variant="ghost" icon={Code2} onClick={() => setShowCode((v) => !v)} aria-expanded={showCode}>
                  {showCode ? 'Hide' : 'Show'} the LaTeX
                </Button>
              </div>
              <p className="mt-4 font-serif text-[14px] leading-relaxed text-fg-muted">
                Compiles with pdfLaTeX or XeLaTeX. Everything here runs in your browser; <strong>Open in Overleaf</strong> sends this LaTeX to
                Overleaf only when you click it.
              </p>
              {sourceId === 'draft' && (
                <Link to="/app/audit" className={`${mono} mt-5 inline-flex items-center gap-2 text-fg-muted hover:text-fg`}>
                  <FileSearch aria-hidden className="h-3.5 w-3.5" /> Back to the audit
                </Link>
              )}
            </aside>
          </div>
          {showCode && (
            <pre className="no-print mt-8 max-h-[520px] overflow-auto rounded-[8px] border border-line bg-[#1F1B2E] p-5 font-mono text-[12.5px] leading-relaxed text-[#F6EAD8]">
              <code>{tex}</code>
            </pre>
          )}
        </section>
      )}
    </div>
  );
}
