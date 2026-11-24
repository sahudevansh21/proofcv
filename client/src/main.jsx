import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './index.css';
import { ToastProvider } from './components/ui/index.js';
import PublicLayout from './components/layout/PublicLayout.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Home from './routes/Home.jsx';
import ErrorPage from './routes/ErrorPage.jsx';
import Root from './routes/Root.jsx';

// Route-level code splitting: only the landing page ships in the first bundle.
const Login = lazy(() => import('./routes/Login.jsx'));
const Welcome = lazy(() => import('./routes/Welcome.jsx'));
const Gallery = lazy(() => import('./routes/Gallery.jsx'));
const Dashboard = lazy(() => import('./routes/Dashboard.jsx'));
const Audit = lazy(() => import('./routes/Audit.jsx'));
const HistoryPage = lazy(() => import('./routes/History.jsx'));
const SettingsPage = lazy(() => import('./routes/Settings.jsx'));
const InfoPage = lazy(() => import('./routes/InfoPage.jsx'));
const NotFound = lazy(() => import('./routes/NotFound.jsx'));

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
          { path: 'history', element: <HistoryPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);
