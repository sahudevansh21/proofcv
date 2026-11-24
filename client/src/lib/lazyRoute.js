import { lazy } from 'react';

const KEY = 'proofcv-chunk-reload';
const WINDOW_MS = 60_000;

/** True for the errors browsers raise when a code-split chunk can't be fetched (usually right after a deploy). */
export const isChunkLoadError = (err) =>
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \d+ failed|Unable to preload CSS/i.test(
    String(err?.message ?? err),
  );

/**
 * React.lazy for routes, with recovery: if the chunk fails to load, reload the page once so the browser
 * picks up the current build. A second failure within a minute is shown by the error page instead of looping.
 */
function loadWithRecovery(factory) {
  return factory().catch((err) => {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (isChunkLoadError(err) && Date.now() - last > WINDOW_MS) {
      sessionStorage.setItem(KEY, String(Date.now()));
      window.location.reload();
      return new Promise(() => {}); // keep the current screen until the reload happens
    }
    throw err;
  });
}

export function lazyRoute(factory) {
  return lazy(() => loadWithRecovery(factory));
}

/**
 * For a route's `lazy` field. Unlike React.lazy inside a transition, the router knows the page is loading
 * (useNavigation().state === 'loading'), so the app can show progress instead of the old page under a new URL.
 */
export const routeModule = (factory) => () => loadWithRecovery(factory).then((mod) => ({ Component: mod.default }));
