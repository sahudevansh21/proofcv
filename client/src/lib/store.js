import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Everything here is persisted to this device's localStorage under the key "proofcv".
// Nothing in this store is ever sent to a server.

export const EMPTY_DRAFT = Object.freeze({ resume: '', jd: '', presetId: '', resumeId: null, title: '' });
const EMPTY_DATA = Object.freeze({ resumes: [], audits: [], draft: EMPTY_DRAFT });
const MAX_AUDITS = 100;

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function patchData(state, userId, fn) {
  const current = state.data[userId] ?? EMPTY_DATA;
  return { data: { ...state.data, [userId]: { ...current, ...fn(current) } } };
}

export const useStore = create(
  persist(
    (set, get) => ({
      session: null, // { id, name, email, provider: 'guest' | 'local' | 'demo' | 'firebase' }
      localAccounts: {}, // email -> { id, name, email, salt, passwordHash, createdAt }
      data: {}, // userId -> { resumes, audits, draft }
      profiles: {}, // userId -> { name, year, branch, targetRole, skipped, updatedAt }

      setProfile: (userId, profile) =>
        set((s) => ({ profiles: { ...s.profiles, [userId]: { ...s.profiles[userId], ...profile, updatedAt: new Date().toISOString() } } })),
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      addLocalAccount: (account) => set((s) => ({ localAccounts: { ...s.localAccounts, [account.email]: account } })),

      updateDraft: (patch) => {
        const userId = get().session?.id;
        if (!userId) return;
        set((s) => patchData(s, userId, (d) => ({ draft: { ...d.draft, ...patch } })));
      },

      /** Creates or updates a saved resume; returns its id. */
      saveResume: ({ id, title, text }) => {
        const userId = get().session?.id;
        if (!userId) return null;
        const now = new Date().toISOString();
        const resumeId = id ?? uid('res');
        set((s) =>
          patchData(s, userId, (d) => {
            const exists = d.resumes.some((r) => r.id === resumeId);
            const entry = { id: resumeId, title: title?.trim() || 'Untitled resume', text, updatedAt: now };
            return {
              resumes: exists
                ? d.resumes.map((r) => (r.id === resumeId ? { ...r, ...entry } : r))
                : [{ ...entry, createdAt: now }, ...d.resumes],
            };
          }),
        );
        return resumeId;
      },

      deleteResume: (id) => {
        const userId = get().session?.id;
        if (!userId) return;
        set((s) =>
          patchData(s, userId, (d) => ({
            resumes: d.resumes.filter((r) => r.id !== id),
            draft: d.draft.resumeId === id ? { ...d.draft, resumeId: null } : d.draft,
          })),
        );
      },

      saveAudit: (audit) => {
        const userId = get().session?.id;
        if (!userId) return null;
        const entry = { ...audit, id: uid('aud'), createdAt: new Date().toISOString() };
        set((s) => patchData(s, userId, (d) => ({ audits: [entry, ...d.audits].slice(0, MAX_AUDITS) })));
        return entry.id;
      },

      deleteAudit: (id) => {
        const userId = get().session?.id;
        if (!userId) return;
        set((s) => patchData(s, userId, (d) => ({ audits: d.audits.filter((a) => a.id !== id) })));
      },

      /** Removes every resume, audit and draft for the signed-in profile, and its local account. Signs out. */
      deleteAllMyData: () =>
        set((s) => {
          const session = s.session;
          if (!session) return {};
          const data = { ...s.data };
          delete data[session.id];
          const localAccounts = { ...s.localAccounts };
          if (session.provider === 'local' && session.email) delete localAccounts[session.email];
          const profiles = { ...s.profiles };
          delete profiles[session.id];
          return { data, localAccounts, profiles, session: null };
        }),

      exportMyData: () => {
        const { session, data, profiles } = get();
        if (!session) return null;
        return {
          exportedAt: new Date().toISOString(),
          app: 'ProofCV',
          profile: { name: session.name, email: session.email ?? null, provider: session.provider, ...(profiles[session.id] ?? {}) },
          ...(data[session.id] ?? EMPTY_DATA),
        };
      },
    }),
    { name: 'proofcv', version: 1 },
  ),
);

/** The signed-in profile's resumes, audits and draft (stable empty object when signed out). */
export const useUserData = () => useStore((s) => (s.session ? (s.data[s.session.id] ?? EMPTY_DATA) : EMPTY_DATA));
