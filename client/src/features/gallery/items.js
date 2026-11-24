import { analyze, PRESETS, SAMPLES } from '@proofcv/shared';

/**
 * The nine "prints" hung in the gallery: four sample resumes, four job postings and one blank sheet
 * for the visitor's own resume. Coverage numbers are computed by the real engine, not hard-coded.
 */
const TINTS = ['#FBE46D', '#F7D2D1', '#CFE0F2', '#DCEBCB', '#FCEB93', '#F4C9B5', '#E4DAF2', '#F7D2D1', '#FFF2C2'];

const presetById = (id) => PRESETS.find((p) => p.id === id);

function sampleItem(sample, i) {
  const preset = presetById(sample.presetId);
  const r = analyze(sample.resume, preset.jd);
  return {
    key: sample.id,
    kind: 'resume',
    tint: TINTS[i],
    title: sample.name,
    subtitle: `${sample.persona} · ${preset.role}`,
    meta: `${r.coverage.now}% → ${r.coverage.potential}%`,
    description: `${sample.focus}. A fictional student resume checked against a ${preset.role.toLowerCase()} posting. ${r.coverage.reworded} of its skills are already there under other wording, and ${r.bulletStats.total - r.bulletStats.strong} bullets could be sharper.`,
    text: sample.resume,
    sampleId: sample.id,
    presetId: preset.id,
  };
}

function postingItem(preset, i) {
  const firstLine = preset.jd.split('\n')[0];
  const skills = analyze('', preset.jd).skills;
  const required = skills.filter((s) => s.level === 'required').length;
  return {
    key: `jd-${preset.id}`,
    kind: 'posting',
    tint: TINTS[4 + i],
    title: preset.role,
    subtitle: 'Sample job posting',
    meta: `${skills.length} skills · ${required} required`,
    description: `${firstLine}. A realistic internship posting with ${skills.length} skills ProofCV can find, ${required} of them marked required. Compare any resume against it.`,
    text: preset.jd,
    presetId: preset.id,
  };
}

const BLANK = {
  key: 'yours',
  kind: 'blank',
  tint: TINTS[8],
  title: 'Your Resume',
  subtitle: 'Paste yours here',
  meta: 'Stays in your browser',
  description:
    'The empty frame is for you. Paste your resume and a posting, and ProofCV shows what you already cover, what you may have under other words, and what is a real gap.',
  text: 'YOUR NAME\nYear · Branch · email\n\nEDUCATION\n\nSKILLS\n\nPROJECTS\n- Built …\n- Developed …\n\nACHIEVEMENTS\n- …',
};

export const ITEMS = [...SAMPLES.map(sampleItem), ...PRESETS.map(postingItem), BLANK];
