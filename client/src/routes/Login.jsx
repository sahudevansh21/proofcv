import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useToast } from '../components/ui/index.js';
import { Logo } from '../components/layout/Brand.jsx';
import {
  PROVIDERS,
  continueAsGuest,
  continueWithProvider,
  logInWithEmail,
  resetPassword,
  signUpWithEmail,
  validateCredentials,
} from '../lib/auth.js';
import { FIREBASE_ENABLED } from '../lib/config.js';
import { useStore } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';

/** Only allow in-app return paths (prevents open redirects via ?next=). */
export function safeNext(raw) {
  if (!raw) return '/app';
  try {
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/app';
  } catch {
    return '/app';
  }
}

const ICONS = {
  google: (
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
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3"
      />
    </svg>
  ),
};

const field =
  'h-[52px] w-full rounded-[6px] border bg-surface px-4 font-serif text-[17px] text-fg placeholder:text-fg-subtle outline-none transition-colors focus:border-fg focus:ring-2 focus:ring-[#fceb93]';
const linkCls = 'font-medium text-fg underline decoration-fg/40 underline-offset-4 hover:decoration-fg';

function Spinner() {
  return <LoaderCircle aria-hidden className="h-[18px] w-[18px] animate-spin" />;
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-left font-mono text-[11px] uppercase tracking-[0.06em] text-danger-fg">
      {children}
    </p>
  );
}

function ForgotPassword({ initialEmail, onBack }) {
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState({ busy: false, error: '', sent: false });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', sent: false });
    try {
      await resetPassword(email);
      setState({ busy: false, error: '', sent: true });
    } catch (err) {
      setState({ busy: false, error: err.message, sent: false });
    }
  };

  return (
    <>
      <h1 className="font-display text-[44px] font-semibold uppercase leading-none">Reset password</h1>
      <p className="mt-3 font-serif text-[17px] text-fg-muted">Enter the email you signed up with and we’ll send a reset link.</p>
      {state.sent ? (
        <p
          role="status"
          className="mt-7 flex gap-2 rounded-[6px] bg-success-soft px-4 py-3 text-left font-serif text-[16px] text-success-fg"
        >
          <CircleCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          If an account exists for {email.trim()}, a reset link is on its way. Check your inbox and spam folder.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-7 space-y-4 text-left">
          <div>
            <label htmlFor="reset-email" className="sr-only">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${field} border-line-strong`}
              autoFocus
            />
          </div>
          {state.error && (
            <p role="alert" className="flex gap-2 rounded-[6px] bg-danger-soft px-4 py-3 font-serif text-[15px] text-danger-fg">
              <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={state.busy}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[6px] bg-primary font-display text-[18px] font-medium uppercase tracking-[0.12em] text-primary-fg hover:bg-primary-hover disabled:opacity-70"
          >
            {state.busy ? <Spinner /> : 'Send reset link'}
          </button>
        </form>
      )}
      <button type="button" onClick={onBack} className={`mt-6 inline-flex items-center gap-1.5 text-[15px] ${linkCls}`}>
        <ArrowLeft aria-hidden className="h-4 w-4" /> Back to log in
      </button>
    </>
  );
}

export default function Login({ mode }) {
  const isSignup = mode === 'signup';
  const [forgot, setForgot] = useState(false);
  useDocumentTitle(forgot ? 'Reset password' : isSignup ? 'Sign up' : 'Log in');
  const session = useStore((s) => s.session);
  const profiles = useStore((s) => s.profiles);
  const [params] = useSearchParams();
  const rawNext = params.get('next');
  const next = safeNext(rawNext);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(null);
  const [showPw, setShowPw] = useState(false);

  // Signed-in people who haven't told us about themselves get the details step first.
  const destination = (s) => (s.provider !== 'guest' && !profiles[s.id] ? `/welcome?next=${encodeURIComponent(next)}` : next);
  if (session && !busy) return <Navigate to={destination(session)} replace />;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const finish = (s, message) => {
    toast(message, { tone: 'success' });
    navigate(destination(s), { replace: true });
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
      finish(s, isSignup ? `Welcome, ${s.name}!` : `Welcome back, ${s.name}.`);
    } catch (err) {
      setFormError(err.message);
      setBusy(null);
    }
  };

  const social = async (id) => {
    setFormError('');
    setBusy(id);
    try {
      const { session: s, demo } = await continueWithProvider(id);
      finish(
        s,
        demo
          ? `${PROVIDERS[id].label} sign-in isn't set up on this build, so you're using a demo profile on this device.`
          : `Signed in with ${PROVIDERS[id].label} as ${s.name}.`,
      );
    } catch (err) {
      setFormError(err.message);
      setBusy(null);
    }
  };

  const guest = () => {
    setBusy('guest');
    const s = continueAsGuest();
    finish(s, "You're in as a guest. Every feature works.");
  };

  const switchHref = `/${isSignup ? 'login' : 'signup'}${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ''}`;

  return (
    <div className="light-scope relative flex min-h-dvh flex-col overflow-hidden bg-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full bg-[#fceb93]/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-[380px] w-[380px] rounded-full bg-[#f7d2d1]/50 blur-3xl"
      />

      <header className="relative flex h-[72px] items-center px-5 sm:px-8">
        <Logo className="text-[24px]" />
      </header>

      <main id="main" className="relative flex flex-1 items-center justify-center px-4 pb-14 pt-4">
        <div className="w-full max-w-[540px] rounded-[10px] border border-line bg-surface px-6 py-10 text-center shadow-[0_24px_60px_-30px_rgba(58,53,80,.35)] sm:px-11 sm:py-12">
          {forgot ? (
            <ForgotPassword initialEmail={form.email} onBack={() => setForgot(false)} />
          ) : (
            <>
              <h1 className="font-display text-[44px] font-semibold uppercase leading-none">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-3 font-serif text-[17px] text-fg-muted">
                {isSignup ? 'Already have an account? ' : 'Don’t have an account? '}
                <Link to={switchHref} className={linkCls}>
                  {isSignup ? 'Log in' : 'Sign up'}
                </Link>
              </p>

              <div className="mt-8 space-y-3">
                {Object.entries(PROVIDERS).map(([id, p]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => social(id)}
                    disabled={Boolean(busy)}
                    className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[6px] border border-line-strong bg-surface font-serif text-[17px] font-medium transition-colors hover:border-fg hover:bg-band disabled:opacity-60"
                  >
                    {busy === id ? <Spinner /> : ICONS[id]}
                    Continue with {p.label}
                  </button>
                ))}
              </div>

              <div className="my-7 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
                <span className="h-px flex-1 bg-line" />
                or continue with email
                <span className="h-px flex-1 bg-line" />
              </div>

              <form onSubmit={submit} noValidate className="space-y-3 text-left">
                {isSignup && (
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Your name
                    </label>
                    <input
                      id="name"
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={set('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={`${field} ${errors.name ? 'border-danger' : 'border-line-strong'}`}
                    />
                    <FieldError id="name-error">{errors.name}</FieldError>
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Your email address"
                    value={form.email}
                    onChange={set('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`${field} ${errors.email ? 'border-danger' : 'border-line-strong'}`}
                  />
                  <FieldError id="email-error">{errors.email}</FieldError>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete={isSignup ? 'new-password' : 'current-password'}
                      placeholder={isSignup ? 'Create a password (8+ characters, a number)' : 'Enter your password'}
                      value={form.password}
                      onChange={set('password')}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      className={`${field} pr-12 ${errors.password ? 'border-danger' : 'border-line-strong'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:text-fg"
                    >
                      {showPw ? <EyeOff aria-hidden className="h-[18px] w-[18px]" /> : <Eye aria-hidden className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  <FieldError id="password-error">{errors.password}</FieldError>
                </div>

                {!isSignup && (
                  <p className="text-right">
                    <button type="button" onClick={() => setForgot(true)} className={`text-[15px] ${linkCls}`}>
                      Forgot password?
                    </button>
                  </p>
                )}

                {formError && (
                  <p role="alert" className="flex gap-2 rounded-[6px] bg-danger-soft px-4 py-3 font-serif text-[15px] text-danger-fg">
                    <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={Boolean(busy)}
                  className="mt-2 flex h-[56px] w-full items-center justify-center gap-2 rounded-[6px] bg-primary font-display text-[19px] font-medium uppercase tracking-[0.12em] text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-70"
                >
                  {busy === 'email' ? <Spinner /> : isSignup ? 'Create account' : 'Log in'}
                </button>
              </form>

              <button
                type="button"
                onClick={guest}
                disabled={Boolean(busy)}
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.12em] underline-offset-4 hover:underline disabled:opacity-60"
              >
                Just looking? Continue as guest <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </button>

              {!FIREBASE_ENABLED && (
                <p className="mt-5 rounded-[6px] bg-band px-4 py-3 font-serif text-[14px] italic text-fg-muted">
                  Cloud sign-in isn’t configured on this build, so email accounts are stored only in this browser and social buttons open a
                  demo profile.
                </p>
              )}
              <p className="mt-5 font-serif text-[14px] text-fg-subtle">
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
