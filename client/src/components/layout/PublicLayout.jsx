import { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Logo } from './Brand.jsx';
import { ZNav } from './ZNav.jsx';
import { PageSkeleton } from './PageSkeleton.jsx';

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
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg">Product</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>
              <Link to="/app/audit" className="hover:text-fg">
                Audit my resume
              </Link>
            </li>
            <li>
              <a href="/?view=list" className="hover:text-fg">
                Samples
              </a>
            </li>
            <li>
              <Link to="/about" className="hover:text-fg">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg">Policies</h2>
          <ul className="mt-3 space-y-2 text-sm text-fg-muted">
            <li>
              <Link to="/privacy" className="hover:text-fg">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-fg">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/guidelines" className="hover:text-fg">
                Community Guidelines
              </Link>
            </li>
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
      <ZNav />
      <main id="main" className="flex-1" key={pathname}>
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-10">
              <PageSkeleton />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
