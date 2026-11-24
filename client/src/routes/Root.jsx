import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { PageSkeleton } from '../components/layout/PageSkeleton.jsx';

export default function Root() {
  return (
    <>
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
