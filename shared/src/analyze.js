import { SKILLS } from './skills.js';
import { findAnyTerm } from './match.js';
import { analyzeBullet, detectSections, extractBullets } from './bullets.js';

export const MAX_INPUT_CHARS = 50_000;

const WEIGHTS = { required: 2, standard: 1, preferred: 0.5 };
const REQUIRED_RE = /\b(?:must|required|requirements?|mandatory|essential|strong|proficien\w*|minimum|qualifications?|you have|we expect)\b/i;
const PREFERRED_RE = /\b(?:nice[\s-]to[\s-]have|preferred|bonus|plus|good[\s-]to[\s-]have|desired|desirable|optional)\b/i;

/** Returns importance per character offset of the JD, based on the line and the heading above it. */
function jdLineLevels(jd) {
  const levels = [];
  let context = 'standard';
  let offset = 0;
  for (const line of jd.split(/\n/)) {
    const clean = line.replace(/^\W+/, '').trim();
    const isBullet = /^\s*(?:[-*•▪◦●‣–—]|\d{1,2}[.)])\s+/.test(line);
    const isHeading = !isBullet && clean.length > 0 && (/:\s*$/.test(clean) || (clean.split(/\s+/).length <= 5 && !/[.]$/.test(clean)));
    if (isHeading) {
      if (PREFERRED_RE.test(clean)) context = 'preferred';
      else if (REQUIRED_RE.test(clean)) context = 'required';
      else if (/:\s*$/.test(clean)) context = 'standard';
    }
    let level = context;
    if (!isHeading) {
      if (PREFERRED_RE.test(clean)) level = 'preferred';
      else if (REQUIRED_RE.test(clean)) level = 'required';
    }
    levels.push({ start: offset, end: offset + line.length, level });
    offset += line.length + 1;
  }
  return levels;
}

const RANK = { preferred: 0, standard: 1, required: 2 };

function levelAt(levels, index) {
  return levels.find((l) => index >= l.start && index <= l.end)?.level ?? 'standard';
}

const unique = (arr) => {
  const seen = new Map();
  for (const item of arr) if (!seen.has(item.toLowerCase())) seen.set(item.toLowerCase(), item);
  return [...seen.values()];
};

function classifySkill(skill, resume, jdHits, levels) {
  const level = jdHits.reduce((best, h) => {
    const l = levelAt(levels, h.start);
    return RANK[l] > RANK[best] ? l : best;
  }, 'preferred');
  const jdTerms = unique(jdHits.map((h) => h.text));
  const exact = findAnyTerm(resume, skill.aliases);
  const evidence = exact.length ? [] : findAnyTerm(resume, skill.evidence);
  const status = exact.length ? 'matched' : evidence.length ? 'reworded' : 'missing';
  const resumeTerms = unique((exact.length ? exact : evidence).map((h) => h.text));
  const jdTerm = jdHits[0].text;

  let advice;
  if (status === 'matched') advice = `Found as "${resumeTerms[0]}".`;
  else if (status === 'reworded') {
    advice = `Related wording already in your resume: "${resumeTerms.join('", "')}". The posting says "${jdTerm}". If it describes what you really did, consider "${jdTerm} (${resumeTerms[0]})".`;
  } else advice = `Don't claim this unless it's true. Have you used ${jdTerm}? Where (project, course, internship)?`;

  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level,
    weight: WEIGHTS[level],
    status,
    jdTerms,
    jdCount: jdHits.length,
    resumeTerms,
    advice,
    resumeRanges: (exact.length ? exact : evidence).map(({ start, end, text }) => ({ start, end, text })),
    jdRanges: jdHits.map(({ start, end, text }) => ({ start, end, text })),
  };
}

function mergeHighlights(ranges) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const kept = [];
  for (const r of sorted) {
    const prev = kept[kept.length - 1];
    if (prev && r.start < prev.end) continue;
    kept.push(r);
  }
  return kept;
}

/** Up to five highest-impact, honest fixes, most important first. */
function buildFixes(skills, bullets) {
  const fixes = [];
  for (const s of skills.filter((x) => x.status === 'reworded' && x.level !== 'preferred')) {
    fixes.push({ priority: 3, text: `Check your wording for ${s.name}: you wrote "${s.resumeTerms[0]}", the posting says "${s.jdTerms[0]}". Use the posting's term if it is accurate.` });
  }
  for (const b of bullets.filter((x) => x.startsWeak)) {
    fixes.push({ priority: 2, text: `Rewrite "${b.text.slice(0, 50)}${b.text.length > 50 ? '…' : ''}" with a strong opening verb.` });
  }
  const noResult = bullets.filter((x) => !x.hasMetric).length;
  if (noResult) fixes.push({ priority: 2, text: `${noResult} bullet${noResult > 1 ? 's have' : ' has'} no measurable result. Add real numbers (users, time saved, accuracy) where you have them.` });
  for (const s of skills.filter((x) => x.status === 'reworded' && x.level === 'preferred')) {
    fixes.push({ priority: 1, text: `Optional: ${s.name} may already be covered by "${s.resumeTerms[0]}". Reword only if accurate.` });
  }
  const gaps = skills.filter((x) => x.status === 'missing' && x.level === 'required');
  if (gaps.length) fixes.push({ priority: 1, text: `Real gaps in required skills: ${gaps.map((g) => g.name).join(', ')}. Do not claim them; consider a small project to learn one.` });
  return fixes.sort((a, b) => b.priority - a.priority).slice(0, 5).map((f) => f.text);
}

const pct = (num, den) => (den === 0 ? 0 : Math.round((num / den) * 100));

/**
 * Full audit of a resume against a job description.
 * Everything is deterministic and rule-based so results are explainable and reproducible.
 */
export function analyze(resumeInput = '', jdInput = '') {
  if (typeof resumeInput !== 'string' || typeof jdInput !== 'string') {
    throw new TypeError('resume and jd must be strings');
  }
  const resume = resumeInput.slice(0, MAX_INPUT_CHARS).replace(/\r\n/g, '\n');
  const jd = jdInput.slice(0, MAX_INPUT_CHARS).replace(/\r\n/g, '\n');

  const levels = jdLineLevels(jd);
  const skills = [];
  if (jd.trim()) {
    for (const skill of SKILLS) {
      const jdHits = findAnyTerm(jd, skill.aliases);
      if (jdHits.length) skills.push(classifySkill(skill, resume, jdHits, levels));
    }
  }
  skills.sort((a, b) => RANK[b.level] - RANK[a.level] || b.jdCount - a.jdCount || a.name.localeCompare(b.name));

  const total = skills.reduce((sum, s) => sum + s.weight, 0);
  const matchedW = skills.filter((s) => s.status === 'matched').reduce((sum, s) => sum + s.weight, 0);
  const rewordedW = skills.filter((s) => s.status === 'reworded').reduce((sum, s) => sum + s.weight, 0);
  const count = (status) => skills.filter((s) => s.status === status).length;

  const bullets = extractBullets(resume).map(analyzeBullet);
  const sections = detectSections(resume);

  const placeholderRanges = [...resume.matchAll(/\[[^\]\n]{1,40}\]/g)].map((m) => ({
    start: m.index,
    end: m.index + m[0].length,
    kind: 'placeholder',
    label: 'Placeholder: replace with a true detail, or delete it',
  }));

  const highlights = mergeHighlights([
    ...placeholderRanges,
    ...bullets.flatMap((b) => b.weak.map((w) => ({ start: w.start, end: w.end, kind: 'weak', label: `Weak: "${w.phrase}". Try: ${w.suggest.join(', ')}` }))),
    ...skills.flatMap((s) => s.resumeRanges.map((r) => ({
      start: r.start,
      end: r.end,
      kind: s.status,
      label: s.status === 'matched' ? `Matches JD skill: ${s.name}` : `JD calls this "${s.jdTerms[0]}" (${s.name})`,
    }))),
  ]);

  const jdHighlights = mergeHighlights(skills.flatMap((s) => s.jdRanges.map((r) => ({
    start: r.start,
    end: r.end,
    kind: s.status,
    label: s.status === 'matched' ? `In your resume: ${s.name}` : s.status === 'reworded' ? `Related wording in your resume: ${s.resumeTerms.join(', ')}` : `Not found in your resume: ${s.name}`,
  }))));

  const fixes = buildFixes(skills, bullets);

  const warnings = [];
  if (!resume.trim()) warnings.push('Paste your resume text to start.');
  if (!jd.trim()) warnings.push('Paste a job description to see keyword coverage.');
  else if (skills.length === 0) warnings.push('No known technical skills found in the job description. Coverage cannot be computed.');
  if (resume.trim() && bullets.length === 0) warnings.push('No bullet points detected. Put each achievement on its own line starting with "-" or "•".');
  for (const [key, label] of [['education', 'Education'], ['skills', 'Skills'], ['projects', 'Projects']]) {
    if (resume.trim() && !sections[key]) warnings.push(`No "${label}" heading found.`);
  }

  return {
    skills: skills.map(({ resumeRanges, jdRanges, ...rest }) => rest),
    coverage: skills.length
      ? {
        now: pct(matchedW, total),
        potential: pct(matchedW + rewordedW, total),
        matched: count('matched'),
        reworded: count('reworded'),
        missing: count('missing'),
        total: skills.length,
      }
      : null,
    bullets,
    bulletStats: {
      total: bullets.length,
      strongVerb: bullets.filter((b) => b.strongVerb).length,
      withMetric: bullets.filter((b) => b.hasMetric).length,
      strong: bullets.filter((b) => b.strength === 'strong').length,
      weak: bullets.filter((b) => b.strength === 'weak').length,
    },
    sections,
    highlights,
    placeholders: placeholderRanges.length,
    jdHighlights,
    fixes,
    warnings,
  };
}
