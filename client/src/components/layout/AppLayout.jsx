import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { ChevronDown, FileSearch, History, LayoutDashboard, LogOut, Settings, ShieldCheck, User } from 'lucide-react';
import { Logo, ThemeToggle } from './Brand.jsx';
import { useStore } from '../../lib/store.js';
import { logOut } from '../../lib/auth.js';
import { useToast } from '../ui/index.js';
import { PageSkeleton } from './PageSkeleton.jsx';

const LINKS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/audit', label: 'Audit', icon: FileSearch },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

const PROVIDER_LABEL = {
  guest: 'Guest · data stays on this device',
  demo: 'Demo profile · on this device',
  local: 'Account on this device',
  firebase: 'Signed in with Google/email',
};

function ProfileMenu() {
  const session = useStore((s) => s.session);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    await logOut();
    toast("You're logged out. Your saved data is still on this device.", { tone: 'success' });
    navigate('/');
  };

  const initial = (session?.name || '?').charAt(0).toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-surface-2"
      >
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-fg sm:block">{session?.name}</span>
        <ChevronDown aria-hidden className="h-4 w-4 text-fg-subtle" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 animate-fade-up rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-fg">{session?.name}</p>
            {session?.email && <p className="truncate text-xs text-fg-muted">{session.email}</p>}
            <p className="mt-1 flex items-center gap-1 text-[11px] text-fg-subtle">
              <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
              {PROVIDER_LABEL[session?.provider]}
            </p>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/app/settings');
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface-2"
          >
            <User aria-hidden className="h-4 w-4" /> Profile & data
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface-2"
          >
            <LogOut aria-hidden className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function RequireSession({ children }) {
  const session = useStore((s) => s.session);
  const location = useLocation();
  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

export default function AppLayout() {
  return (
    <RequireSession>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md no-print">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
            <Logo to="/app" />
            <nav aria-label="App" className="ml-4 hidden items-center gap-1 md:flex">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary-soft text-primary-soft-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg'}`
                  }
                >
                  <l.icon aria-hidden className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="hidden items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success-fg lg:inline-flex">
                <ShieldCheck aria-hidden className="h-3.5 w-3.5" /> Your resume never leaves your browser
              </span>
              <ThemeToggle />
              <ProfileMenu />
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <nav
          aria-label="App"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface/95 backdrop-blur md:hidden no-print"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-primary' : 'text-fg-muted'}`
              }
            >
              <l.icon aria-hidden className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </RequireSession>
  );
}
