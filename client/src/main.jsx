import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './index.css';
import { ToastProvider } from './components/ui/index.js';
import PublicLayout from './components/layout/PublicLayout.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Home from './routes/Home.jsx';
import ErrorPage from './routes/ErrorPage.jsx';
import Root from './routes/Root.jsx';
import { PageSkeleton } from './components/layout/PageSkeleton.jsx';
import { watchForNewBuild } from './lib/freshBuild.js';
import { lazyRoute, routeModule } from './lib/lazyRoute.js';
import { initSmoothScroll } from './lib/smoothScroll.js';

// Route-level code splitting: only the landing page ships in the first bundle.
const Login = lazyRoute(() => import('./routes/Login.jsx'));
const InfoPage = lazyRoute(() => import('./routes/InfoPage.jsx'));
const NotFound = lazyRoute(() => import('./routes/NotFound.jsx'));

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <ErrorPage />,
    // Shown on a first visit straight to a lazily loaded page, while its code downloads.
    hydrateFallbackElement: (
      <div className="mx-auto max-w-6xl p-6">
        <PageSkeleton />
      </div>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/gallery', lazy: routeModule(() => import('./routes/Gallery.jsx')) },
      { path: '/welcome', lazy: routeModule(() => import('./routes/Welcome.jsx')) },
      {
        element: <PublicLayout />,
        children: [
          { path: '/about', element: <InfoPage page="about" /> },
          { path: '/privacy', element: <InfoPage page="privacy" /> },
          { path: '/terms', element: <InfoPage page="terms" /> },
          { path: '/guidelines', element: <InfoPage page="guidelines" /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      { path: '/login', element: <Login mode="login" /> },
      { path: '/signup', element: <Login mode="signup" /> },
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, lazy: routeModule(() => import('./routes/Dashboard.jsx')) },
          { path: 'audit', lazy: routeModule(() => import('./routes/Audit.jsx')) },
          { path: 'agent', lazy: routeModule(() => import('./routes/Agent.jsx')) },
          { path: 'templates', lazy: routeModule(() => import('./routes/Templates.jsx')) },
          { path: 'history', lazy: routeModule(() => import('./routes/History.jsx')) },
          { path: 'settings', lazy: routeModule(() => import('./routes/Settings.jsx')) },
        ],
      },
    ],
  },
]);

watchForNewBuild();
initSmoothScroll();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);
