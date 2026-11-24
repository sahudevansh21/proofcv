import { analyze, PRESETS, SAMPLES } from '@proofcv/shared';

/**
 * The prints hung in the gallery: the 30 parody sample resumes (one per role) and one blank sheet
 * for the visitor's own resume. Coverage numbers are computed by the real engine, not hard-coded.
 */
const TINTS = ['#FBE46D', '#F7D2D1', '#CFE0F2', '#DCEBCB', '#FCEB93', '#F4C9B5', '#E4DAF2', '#FFF2C2'];

const presetById = (id) => PRESETS.find((p) => p.id === id);

function sampleItem(sample, i) {
  const preset = presetById(sample.presetId);
  const r = analyze(sample.resume, preset.jd);
  return {
    key: sample.id,
    kind: 'resume',
    tint: TINTS[i % TINTS.length],
    title: sample.name,
    subtitle: `${sample.persona} · ${preset.role}`,
    meta: `${r.coverage.now}% → ${r.coverage.potential}%`,
    description: `${sample.focus}. A fictional parody resume checked against a ${preset.role} posting. ${r.coverage.reworded} of its skills are already there under other wording, and ${r.bulletStats.total - r.bulletStats.strong} bullets could be sharper.`,
    text: sample.resume,
    sampleId: sample.id,
    presetId: preset.id,
  };
}

const BLANK = {
  key: 'yours',
  kind: 'blank',
  tint: '#FFF2C2',
  title: 'Your Resume',
  subtitle: 'Paste yours here',
  meta: 'Stays in your browser',
  description:
    'The empty frame is for you. Paste your resume and a posting, and ProofCV shows what you already cover, what you may have under other words, and what is a real gap.',
  text: 'YOUR NAME\nYear · Branch · email\n\nEDUCATION\n\nSKILLS\n\nPROJECTS\n- Built …\n- Developed …\n\nACHIEVEMENTS\n- …',
};

export const ITEMS = [...SAMPLES.map(sampleItem), BLANK];
