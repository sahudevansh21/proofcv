import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, CircleAlert, Eye, EyeOff, Lock, UserRound } from 'lucide-react';
import { Button, Input, useToast } from '../components/ui/index.js';
import { Logo, ThemeToggle } from '../components/layout/Brand.jsx';
import { continueAsGuest, continueWithGoogle, logInWithEmail, signUpWithEmail, validateCredentials } from '../lib/auth.js';
import { FIREBASE_ENABLED } from '../lib/config.js';
import { useStore } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';

/** Only allow in-app return paths (prevents open redirects via ?next=). */
function safeNext(raw) {
  if (!raw) return '/app';
  try {
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/app';
  } catch {
    return '/app';
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export default function Login({ mode }) {
  const isSignup = mode === 'signup';
  useDocumentTitle(isSignup ? 'Sign up' : 'Log in');
  const session = useStore((s) => s.session);
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(null);
  const [showPw, setShowPw] = useState(false);

  if (session && !busy) return <Navigate to={next} replace />;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const finish = (message) => {
    toast(message, { tone: 'success' });
    navigate(next, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validateCredentials(form, mode);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy('email');
    try {
      const s = isSignup ? await signUpWithEmail(form) : await logInWithEmail(form);
      finish(isSignup ? `Welcome, ${s.name}!` : `Welcome back, ${s.name}.`);
    } catch (err) {
      setFormError(err.message);
      setBusy(null);
    }
  };

  const google = async () => {
    setFormError('');
    setBusy('google');
    try {
      const { session: s, demo } = await continueWithGoogle();
      finish(
        demo ? "Google sign-in isn't set up on this build, so you're using a demo profile on this device." : `Signed in as ${s.name}.`,
      );
    } catch (err) {
      setFormError(err.message);
      setBusy(null);
    }
  };

  const guest = () => {
    setBusy('guest');
    continueAsGuest();
    finish("You're in as a guest. Every feature works.");
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#1a73e8] p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#fbbc04]/30 blur-2xl" />
        <div aria-hidden className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#34a853]/30 blur-2xl" />
        <div className="relative rounded-xl bg-white/95 px-3 py-2 self-start">
          <Logo />
        </div>
        <div className="relative mt-auto">
          <p className="text-[40px] font-bold leading-tight">
            Sharper resume.
            <br />
            Zero fiction.
          </p>
          <ul className="mt-6 space-y-3 text-white/90">
            <li className="flex gap-2">
              <Lock aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
              Your resume is analysed in your browser and never uploaded.
            </li>
            <li className="flex gap-2">
              <UserRound aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
              An account only keeps your saved resumes and history organised.
            </li>
          </ul>
        </div>
      </aside>

      {/* Form */}
      <main id="main" className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <ThemeToggle />
        </div>
        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="text-[28px] font-bold tracking-tight text-fg">{isSignup ? 'Create your account' : 'Log in to ProofCV'}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            {isSignup ? 'Keep your resumes and audit history in one place.' : 'Pick up where you left off.'}
          </p>

          <Button variant="primary" size="lg" className="mt-7 w-full" iconRight={ArrowRight} onClick={guest} loading={busy === 'guest'}>
            Continue as guest
          </Button>
          <p className="mt-2 text-center text-xs text-fg-muted">Guest mode has every feature. No email needed.</p>

          <div className="my-6 flex items-center gap-3 text-xs text-fg-subtle">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button variant="secondary" className="w-full" onClick={google} loading={busy === 'google'}>
            {busy !== 'google' && <GoogleIcon />} Continue with Google
          </Button>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            {isSignup && <Input label="Name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />}
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                hint={isSignup ? 'At least 8 characters, with a number.' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-[30px] grid h-9 w-9 place-items-center rounded-lg text-fg-subtle hover:text-fg"
              >
                {showPw ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
              </button>
            </div>
            {formError && (
              <p role="alert" className="flex gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger-fg">
                <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </p>
            )}
            <Button type="submit" variant="soft" className="w-full" loading={busy === 'email'}>
              {isSignup ? 'Create account' : 'Log in'}
            </Button>
          </form>

          {!FIREBASE_ENABLED && (
            <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2.5 text-xs text-fg-muted">
              Cloud sign-in isn&apos;t configured on this build, so accounts are stored only in this browser on this device.
            </p>
          )}

          <p className="mt-6 text-center text-sm text-fg-muted">
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <Link
              to={`/${isSignup ? 'login' : 'signup'}${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`}
              className="font-medium text-primary hover:underline"
            >
              {isSignup ? 'Log in' : 'Create an account'}
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-fg-subtle">
            By continuing you agree to the{' '}
            <Link to="/terms" className="underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline">
              Privacy
            </Link>{' '}
            notes.
          </p>
        </div>
      </main>
    </div>
  );
}
