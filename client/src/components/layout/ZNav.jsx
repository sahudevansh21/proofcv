import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { ArrowRight, FileText, History, Menu, UserRound, X } from 'lucide-react';
import { Logo, ThemeToggle } from './Brand.jsx';
import { useStore, useUserData } from '../../lib/store.js';
import { formatDate } from '../../lib/hooks.js';

const LINKS = [
  { to: '/gallery', label: 'Gallery' },
  { to: '/app/audit', label: 'Audit' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
];

const iconBtn =
  'relative grid h-10 w-10 place-items-center rounded-full text-current transition-colors hover:bg-[color-mix(in_srgb,currentColor_8%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2';

/** Slide-in panel listing saved audits. The "bag" of this gallery. */
export function AuditsDrawer({ open, onClose }) {
  const { audits } = useUserData();
  const session = useStore((s) => s.session);
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-[#3a3550]/25 transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Your audits"
        inert={!open}
        className="z-drawer light-scope absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-drawer text-[#3a3550] outline-none"
        data-open={open}
      >
        <div className="flex items-center justify-between px-7 pb-4 pt-7">
          <h2 className="font-display text-[34px] font-semibold uppercase leading-none tracking-[0.02em]">Your audits</h2>
          <button type="button" className={iconBtn} onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-7 font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">Saved in this browser only</p>
        <ul className="mt-5 flex-1 space-y-3 overflow-y-auto px-7">
          {audits.length === 0 && (
            <li className="rounded-[6px] border border-dashed border-[#3a3550]/30 p-6 font-serif text-[17px] italic">
              Nothing saved yet. Open a resume in the gallery and choose “Save to my audits”.
            </li>
          )}
          {audits.slice(0, 12).map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 border-b border-[#3a3550]/15 pb-3">
              <div className="min-w-0">
                <p className="truncate font-serif text-[19px] font-medium">{a.title}</p>
                <p className="truncate font-serif text-[15px] italic opacity-80">{a.role}</p>
                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em] opacity-60">{formatDate(a.createdAt)}</p>
              </div>
              <p className="shrink-0 text-right font-mono text-[12px] uppercase tracking-[0.08em]">
                {a.coverageNow ?? '–'}% <span className="opacity-60">→ {a.coveragePotential ?? '–'}%</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t border-[#3a3550]/15 p-7">
          <Link
            to={session ? '/app/history' : '/app/audit'}
            onClick={onClose}
            className="flex h-[54px] items-center justify-center gap-2 bg-[#3a3550] font-display text-[17px] font-medium uppercase tracking-[0.12em] text-[#fff9ec] hover:bg-[#2a2640]"
          >
            Open workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/** Top bar in the gallery style: wordmark, mono links, account / history / audits icons. */
export function ZNav({ overlay = false, onBrandClick, drawerOpen, onDrawerChange }) {
  const session = useStore((s) => s.session);
  const { audits } = useUserData();
  const [ownDrawer, setOwnDrawer] = useState(false);
  const drawer = drawerOpen ?? ownDrawer;
  const setDrawer = onDrawerChange ?? setOwnDrawer;
  const closeDrawer = useCallback(() => setDrawer(false), [setDrawer]);
  const [menu, setMenu] = useState(false);

  return (
    <header
      className={`no-print z-40 ${overlay ? 'absolute inset-x-0 top-0 text-[#3a3550]' : 'sticky top-0 border-b border-line bg-bg/90 text-fg backdrop-blur-md'}`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <nav aria-label="Main" className="flex h-[72px] items-center justify-between gap-4 px-5 sm:px-8">
        <div onClickCapture={onBrandClick}>
          <Logo className="text-[24px]" />
        </div>
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="font-mono text-[12px] uppercase tracking-[0.14em] underline-offset-4 hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-0.5">
          {!overlay && <ThemeToggle />}
          <Link to={session ? '/app' : '/login'} className={iconBtn} aria-label={session ? 'Open your dashboard' : 'Log in'}>
            <UserRound className="h-[19px] w-[19px]" strokeWidth={1.6} />
          </Link>
          <Link to="/app/history" className={`${iconBtn} hidden sm:grid`} aria-label="Audit history">
            <History className="h-[19px] w-[19px]" strokeWidth={1.6} />
          </Link>
          <button type="button" className={iconBtn} onClick={() => setDrawer(true)} aria-label={`Your audits (${audits.length} saved)`}>
            <FileText className="h-[19px] w-[19px]" strokeWidth={1.6} />
            {audits.length > 0 && (
              <span className="absolute right-1 top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#fceb93] px-1 font-mono text-[10px] text-[#3a3550]">
                {audits.length}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`${iconBtn} md:hidden`}
            onClick={() => setMenu((m) => !m)}
            aria-label="Menu"
            aria-expanded={menu}
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {menu && (
        <ul className="light-scope mx-4 rounded-[6px] bg-[#fff9ef] p-2 text-[#3a3550] shadow-lg md:hidden">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={() => setMenu(false)}
                className="block px-4 py-3 font-mono text-[13px] uppercase tracking-[0.14em] hover:bg-[#fbf3e4]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <AuditsDrawer open={drawer} onClose={closeDrawer} />
    </header>
  );
}
