import { PRESETS, SAMPLES } from '@proofcv/shared';
import { continueAsGuest } from '../../lib/auth.js';
import { useStore } from '../../lib/store.js';

export { PRESETS, SAMPLES };

// Optional preview images, resolved at build time: put <sample-id>.png in src/assets/samples/.
// Samples without an image fall back to a rendered text preview, with no 404 requests.
const IMAGES = import.meta.glob('../../assets/samples/*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

export const sampleImage = (id) => {
  const key = Object.keys(IMAGES).find((k) => k.split('/').pop().replace(/\.[^.]+$/, '') === id);
  return key ? IMAGES[key] : null;
};

export const presetById = (id) => PRESETS.find((p) => p.id === id) ?? null;

/** Starts a guest session if needed, so "try it" paths never hit the login wall. */
export function ensureSession() {
  return useStore.getState().session ?? continueAsGuest();
}

/** Loads a sample resume and its matching JD into the workspace draft. */
export function loadSample(sampleId = SAMPLES[0].id) {
  ensureSession();
  const sample = SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[0];
  const preset = presetById(sample.presetId);
  useStore.getState().updateDraft({
    resume: sample.resume,
    jd: preset?.jd ?? '',
    presetId: preset?.id ?? '',
    resumeId: null,
    title: `${sample.name} (sample)`,
  });
  return sample;
}
