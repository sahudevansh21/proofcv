import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { useThemeSync } from '../lib/hooks.js';
import { PageSkeleton } from '../components/layout/PageSkeleton.jsx';

export default function Root() {
  useThemeSync();
  return (
    <>
      <Suspense fallback={<div className="mx-auto max-w-6xl p-6"><PageSkeleton /></div>}>
        <Outlet />
      </Suspense>
      <ScrollRestoration />
    </>
  );
}
