// Env-based config. Only VITE_* variables are exposed to the client by Vite.
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** Cloud sign-in is on only when every Firebase key is present. Otherwise accounts are local to this device. */
export const FIREBASE_ENABLED = Object.values(firebaseConfig).every((v) => typeof v === 'string' && v.length > 0);

export const APP_NAME = 'ProofCV';
export const TAGLINE = 'Sharper resume. Zero fiction.';
