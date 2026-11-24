import { FIREBASE_ENABLED, firebaseConfig } from './config.js';
import { useStore } from './store.js';

export class AuthError extends Error {}

const GUEST = { id: 'guest', name: 'Guest', email: null, provider: 'guest' };
const DEMO = { id: 'demo', name: 'Demo student', email: 'demo@proofcv.local', provider: 'demo' };

let firebasePromise;
/** Firebase is loaded only when configured and only when an auth action needs it (keeps the landing page light). */
function loadFirebase() {
  if (!FIREBASE_ENABLED) return null;
  firebasePromise ??= Promise.all([import('firebase/app'), import('firebase/auth')]).then(([app, auth]) => {
    const instance = app.getApps().length ? app.getApp() : app.initializeApp(firebaseConfig);
    return { auth, client: auth.getAuth(instance) };
  });
  return firebasePromise;
}

const fromFirebaseUser = (u) => ({
  id: `fb_${u.uid}`,
  name: u.displayName || u.email?.split('@')[0] || 'Student',
  email: u.email,
  provider: 'firebase',
});

const FIREBASE_MESSAGES = {
  'auth/invalid-credential': "That email and password don't match.",
  'auth/wrong-password': "That email and password don't match.",
  'auth/user-not-found': 'No account with that email. Sign up instead?',
  'auth/email-already-in-use': 'An account with that email already exists. Log in instead.',
  'auth/weak-password': 'Use at least 8 characters.',
  'auth/network-request-failed': 'No connection. You can still continue as a guest.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
};
const friendly = (err) => new AuthError(FIREBASE_MESSAGES[err?.code] ?? 'Sign-in failed. You can still continue as a guest.');

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCredentials({ name, email, password }, mode) {
  const errors = {};
  if (mode === 'signup' && !name?.trim()) errors.name = 'Tell us what to call you.';
  if (!EMAIL_RE.test(email?.trim() ?? '')) errors.email = 'Enter a valid email, like you@college.edu.';
  if (!password) errors.password = 'Enter your password.';
  else if (mode === 'signup' && password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (mode === 'signup' && !(/[a-z]/i.test(password) && /\d/.test(password))) errors.password = 'Mix letters and at least one number.';
  return errors;
}

export function continueAsGuest() {
  useStore.getState().setSession(GUEST);
  return GUEST;
}

export const PROVIDERS = {
  google: { label: 'Google', firebase: (a) => new a.GoogleAuthProvider() },
  linkedin: { label: 'LinkedIn', firebase: (a) => new a.OAuthProvider('oidc.linkedin') },
  github: { label: 'GitHub', firebase: (a) => new a.GithubAuthProvider() },
};

/**
 * Social sign-in via Firebase (Google, LinkedIn over OIDC, GitHub).
 * Without Firebase keys, opens a local demo profile for that provider so the demo never breaks.
 */
export async function continueWithProvider(id) {
  const provider = PROVIDERS[id];
  if (!provider) throw new AuthError('Unknown sign-in option.');
  const fb = await loadFirebase();
  if (!fb) {
    const session = { ...DEMO, id: `demo_${id}`, provider: 'demo', via: provider.label };
    useStore.getState().setSession(session);
    return { session, demo: true };
  }
  try {
    const cred = await fb.auth.signInWithPopup(fb.client, provider.firebase(fb.auth));
    const session = { ...fromFirebaseUser(cred.user), via: provider.label };
    useStore.getState().setSession(session);
    return { session, demo: false };
  } catch (err) {
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/invalid-provider-id') {
      throw new AuthError(`${provider.label} sign-in isn't enabled for this project yet. Use email or continue as a guest.`);
    }
    if (err?.code === 'auth/popup-closed-by-user') throw new AuthError(`${provider.label} sign-in was closed before it finished.`);
    throw friendly(err);
  }
}

/** Sends a reset link with Firebase. Local accounts live only in this browser, so they cannot be reset by email. */
export async function resetPassword(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) throw new AuthError('Enter a valid email, like you@college.edu.');
  const fb = await loadFirebase();
  if (!fb) {
    throw new AuthError(
      "Accounts on this build are stored only in this browser, so there's no email to reset from. Create a new account or continue as a guest.",
    );
  }
  try {
    await fb.auth.sendPasswordResetEmail(fb.client, cleanEmail);
  } catch (err) {
    // Don't reveal whether an account exists for this email.
    if (err?.code !== 'auth/user-not-found') throw friendly(err);
  }
}

export async function signUpWithEmail({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const fb = await loadFirebase();
  if (fb) {
    try {
      const cred = await fb.auth.createUserWithEmailAndPassword(fb.client, cleanEmail, password);
      await fb.auth.updateProfile(cred.user, { displayName: name.trim() });
      const session = { ...fromFirebaseUser(cred.user), name: name.trim() };
      useStore.getState().setSession(session);
      return session;
    } catch (err) {
      throw friendly(err);
    }
  }
  const { localAccounts, addLocalAccount, setSession } = useStore.getState();
  if (localAccounts[cleanEmail]) throw new AuthError('An account with that email already exists on this device. Log in instead.');
  const salt = crypto.getRandomValues(new Uint32Array(4)).join('-');
  const account = {
    id: `loc_${crypto.randomUUID()}`,
    name: name.trim(),
    email: cleanEmail,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  addLocalAccount(account);
  const session = { id: account.id, name: account.name, email: account.email, provider: 'local' };
  setSession(session);
  return session;
}

export async function logInWithEmail({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const fb = await loadFirebase();
  if (fb) {
    try {
      const cred = await fb.auth.signInWithEmailAndPassword(fb.client, cleanEmail, password);
      const session = fromFirebaseUser(cred.user);
      useStore.getState().setSession(session);
      return session;
    } catch (err) {
      throw friendly(err);
    }
  }
  const account = useStore.getState().localAccounts[cleanEmail];
  if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
    throw new AuthError("That email and password don't match an account on this device.");
  }
  const session = { id: account.id, name: account.name, email: account.email, provider: 'local' };
  useStore.getState().setSession(session);
  return session;
}

export async function logOut() {
  const { session, clearSession } = useStore.getState();
  if (session?.provider === 'firebase') {
    const fb = await loadFirebase();
    if (fb) await fb.auth.signOut(fb.client).catch(() => {});
  }
  clearSession();
}
