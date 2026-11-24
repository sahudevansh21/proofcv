import { isRouteErrorResponse, useRouteError } from 'react-router';
import { RefreshCw } from 'lucide-react';
import { LogoMark } from '../components/layout/Brand.jsx';

/** Router error boundary. Uses plain links so it works even if the app state is broken. */
export default function ErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (error && !notFound) console.error(error);
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-[28px] font-bold text-fg">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
        <p className="mt-2 text-fg-muted">
          {notFound
            ? "That link doesn't go anywhere."
            : 'ProofCV hit an unexpected error. Your saved resumes are stored in this browser and are safe.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {!notFound && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-fg"
            >
              <RefreshCw aria-hidden className="h-4 w-4" /> Reload
            </button>
          )}
          <a href="/" className="inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-sm font-medium text-fg">
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}
