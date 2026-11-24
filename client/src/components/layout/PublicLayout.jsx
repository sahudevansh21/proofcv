import { Suspense, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Menu } from 'lucide-react';
import { Button, Drawer, IconButton } from '../ui/index.js';
import { Logo, ThemeToggle } from './Brand.jsx';
import { useStore } from '../../lib/store.js';
import { PageSkeleton } from './PageSkeleton.jsx';

const NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/#samples', label: 'Samples' },
  { href: '/#faq', label: 'FAQ' },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const session = useStore((s) => s.session);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md no-print">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">Skip to content</a>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}><a href={n.href} className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg">{n.label}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {session ? (
            <Button to="/app" size="sm" className="hidden sm:inline-flex">Open app</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
              <Button to="/app/audit" size="sm" className="hidden sm:inline-flex">Try free</Button>
            </>
          )}
          <IconButton icon={Menu} label="Open menu" className="md:hidden" onClick={() => setOpen(true)} />
        </div>
      </nav>
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu">
        <ul className="space-y-1">
          {NAV.map((n) => (
            <li key={n.href}><a href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium text-fg hover:bg-surface-2">{n.label}</a></li>
          ))}
        </ul>
        <div className="mt-6 grid gap-2">
          {session ? <Button to="/app" onClick={() => setOpen(false)}>Open app</Button> : (
            <>
              <Button to="/app/audit" onClick={() => setOpen(false)}>Try free</Button>
              <Button to="/login" variant="secondary" onClick={() => setOpen(false)}>Log in</Button>
            </>
          )}
        </div>
      </Drawer>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface no-print">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-fg-muted">
            A free resume self-audit for first- and second-year students. Rule-based, runs in your browser, never invents experience.
          </p>
          <p className="mt-3 text-xs text-fg-subtle">
            Built at <span className="font-medium text-fg-muted">MLH HackDay: The Battle Royale</span>, GDG on Campus AITR, Indore.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">Product</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li><Link to="/app/audit" className="hover:text-fg">Audit my resume</Link></li>
            <li><a href="/#samples" className="hover:text-fg">Samples</a></li>
            <li><Link to="/about" className="hover:text-fg">About</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">Policies</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li><Link to="/privacy" className="hover:text-fg">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-fg">Terms</Link></li>
            <li><Link to="/guidelines" className="hover:text-fg">Community Guidelines</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-fg-subtle">© 2026 ProofCV · A self-audit, not a guarantee.</p>
    </footer>
  );
}

export default function PublicLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main id="main" className="flex-1" key={pathname}>
        <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10"><PageSkeleton /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
