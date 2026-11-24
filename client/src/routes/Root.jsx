import { Suspense } from 'react';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { PageSkeleton } from '../components/layout/PageSkeleton.jsx';

/** Thin bar across the top while the next page's code downloads. */
function NavProgress() {
  const loading = useNavigation().state === 'loading';
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      aria-hidden={!loading}
      className={`nav-progress pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] ${loading ? 'is-loading' : ''}`}
    />
  );
}

export default function Root() {
  return (
    <>
      <NavProgress />
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl p-6">
            <PageSkeleton />
          </div>
        }
      >
        <Outlet />
      </Suspense>
      <ScrollRestoration />
    </>
  );
}
