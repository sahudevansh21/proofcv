const CHECK_EVERY_MS = 5 * 60 * 1000;
const entryOf = (html) => html.match(/\/assets\/index-[\w-]+\.js/)?.[0] ?? null;

/**
 * Keeps long-lived tabs on the latest deploy. A single-page app never refetches its HTML,
 * so an open tab can run an old build for days. We compare our entry script with the one
 * the server now serves and reload on the next navigation (state is persisted, nothing is lost).
 * Chunk load failures after a deploy also reload once.
 */
export function watchForNewBuild() {
  if (import.meta.env.DEV) return () => {};
  const current = entryOf(
    [...document.querySelectorAll('script[type="module"][src]')].map((s) => new URL(s.src).pathname).join(' '),
  );
  let stale = false;
  let busy = false;

  const check = async () => {
    if (stale || busy || !current || document.visibilityState !== 'visible') return;
    busy = true;
    try {
      const res = await fetch('/', { cache: 'no-store', headers: { accept: 'text/html' } });
      if (res.ok) {
        const latest = entryOf(await res.text());
        if (latest && latest !== current) stale = true;
      }
    } catch {
      // Offline or blocked: keep running the build we have.
    } finally {
      busy = false;
    }
  };

  const reloadIfStale = () => {
    if (stale) window.location.reload();
  };

  const onPreloadError = (e) => {
    if (sessionStorage.getItem('proofcv-reloaded')) return;
    sessionStorage.setItem('proofcv-reloaded', '1');
    e.preventDefault();
    window.location.reload();
  };

  // Navigations go through history.pushState; reload there once a newer build exists.
  const push = history.pushState;
  history.pushState = function pushState(...args) {
    if (stale) {
      const url = args[2];
      if (url != null) window.location.assign(new URL(url, window.location.href).href);
      else window.location.reload();
      return undefined;
    }
    return push.apply(this, args);
  };

  const onVisible = () => {
    if (document.visibilityState === 'visible') check().then(reloadIfStale);
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('vite:preloadError', onPreloadError);
  const timer = setInterval(check, CHECK_EVERY_MS);
  check();
  // Allow another recovery reload later, but never a loop right after one.
  const clearFlag = setTimeout(() => sessionStorage.removeItem('proofcv-reloaded'), 30_000);

  return () => {
    history.pushState = push;
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('vite:preloadError', onPreloadError);
    clearInterval(timer);
    clearTimeout(clearFlag);
  };
}
