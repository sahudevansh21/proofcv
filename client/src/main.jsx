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
import { watchForNewBuild } from './lib/freshBuild.js';
import { lazyRoute } from './lib/lazyRoute.js';
import { initSmoothScroll } from './lib/smoothScroll.js';

// Route-level code splitting: only the landing page ships in the first bundle.
const Login = lazyRoute(() => import('./routes/Login.jsx'));
const Welcome = lazyRoute(() => import('./routes/Welcome.jsx'));
const Gallery = lazyRoute(() => import('./routes/Gallery.jsx'));
const Dashboard = lazyRoute(() => import('./routes/Dashboard.jsx'));
const Audit = lazyRoute(() => import('./routes/Audit.jsx'));
const Agent = lazyRoute(() => import('./routes/Agent.jsx'));
const Templates = lazyRoute(() => import('./routes/Templates.jsx'));
const HistoryPage = lazyRoute(() => import('./routes/History.jsx'));
const SettingsPage = lazyRoute(() => import('./routes/Settings.jsx'));
const InfoPage = lazyRoute(() => import('./routes/InfoPage.jsx'));
const NotFound = lazyRoute(() => import('./routes/NotFound.jsx'));

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/gallery', element: <Gallery /> },
      { path: '/welcome', element: <Welcome /> },
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
          { index: true, element: <Dashboard /> },
          { path: 'audit', element: <Audit /> },
          { path: 'agent', element: <Agent /> },
          { path: 'templates', element: <Templates /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'settings', element: <SettingsPage /> },
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
