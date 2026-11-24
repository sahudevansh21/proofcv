import { SKILLS, STRONG_VERBS, WEAK_PHRASES } from './skills.js';
import { findAnyTerm, findTerm } from './match.js';

const TOOL_TERMS = [...new Set(SKILLS.flatMap((sk) => sk.aliases))];
export const BULLET_WORDS = { min: 12, max: 25 };

const BULLET_RE = /^\s*(?:[-*•▪◦●‣–—]|\d{1,2}[.)])\s+/;
const SECTION_PATTERNS = {
  education: /^(education|academics?|academic background)$/i,
  skills: /^(technical\s+)?skills?(\s*&\s*tools)?$|^tech(nical)?\s+stack$|^tools$/i,
  projects: /^(academic\s+|personal\s+|key\s+)?projects?$/i,
  experience: /^(work\s+|professional\s+)?experience$|^internships?$|^employment$/i,
  achievements: /^(achievements?|awards?|accomplishments?|honou?rs?)(\s*&\s*\w+)?$/i,
  certifications: /^certifications?(\s*&\s*\w+)?$|^courses?$/i,
  activities: /^(extra[-\s]?curricular|activities|leadership|positions? of responsibility|volunteering)$/i,
  summary: /^(summary|objective|profile|about me)$/i,
};

const METRIC_RE = /\d|%|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|fifty|hundred|thousand|lakh|dozen|half|double|triple|twice)\b/i;
const FIRST_PERSON_RE = /\b(?:i|me|my|mine|we|our)\b/i;
const PLACEHOLDER_RE = /\[[^\]]+\]/g;

const TYPE_RULES = [
  ['ml', /\b(?:model|accuracy|dataset|predict\w*|classif\w*|train\w*|neural|ml|machine learning|regression|recommend\w*)\b/i],
  ['optimization', /\b(?:optimi[sz]\w*|reduc\w*|faster|speed\w*|improv\w*|performance|latency|load time|efficien\w*)\b/i],
  ['web', /\b(?:website|web\s?app|app|application|portal|platform|dashboard|frontend|backend|api|site|page|tracker|bot|extension)\b/i],
  ['team', /\b(?:team|led|lead\w*|coordinat\w*|organi[sz]\w*|club|event|members|volunteer\w*|hackathon|mentor\w*)\b/i],
];

const QUESTIONS = {
  ml: ['What accuracy / F1 / error did the model reach?', 'How big was the dataset (rows, images, samples)?', 'What baseline did you beat, if any?'],
  optimization: ['What was the before → after number (time, size, cost)?', 'By what % did it improve?'],
  team: ['How many people were on the team or at the event?', 'What exactly was your role?', 'What was the outcome (rank, footfall, funds raised)?'],
  web: ['How many users, registrations or visits did it get?', 'How many features, pages or endpoints did you build?', 'Is it live? Add the link.'],
  general: ['What changed because of your work?', 'Can you count it (items, hours saved, people helped)?'],
};

const PLACEHOLDERS = {
  ml: ', achieving [X]% accuracy on [N] samples',
  optimization: ', reducing [metric] by [X]%',
  team: ' with a team of [N]',
  web: ', used by [N] users',
  general: ', resulting in [measurable outcome]',
};

const IRREGULAR_PAST = {
  build: 'Built', make: 'Made', writ: 'Wrote', lead: 'Led', runn: 'Ran', sett: 'Set', teach: 'Taught',
  driv: 'Drove', win: 'Won', winn: 'Won', mak: 'Made', ris: 'Rose', gett: 'Got', put: 'Put', putt: 'Put',
};

const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** "managing" -> "Managed", "building" -> "Built", "debugging" -> "Debugged", "studying" -> "Studied". */
export function gerundToPast(word) {
  const stem = word.toLowerCase().replace(/ing$/, '');
  if (IRREGULAR_PAST[stem]) return IRREGULAR_PAST[stem];
  // Dropped-e stems ("manag"), doubled consonants ("plann") and plain stems ("develop") all just take -ed.
  if (/[^aeiou]y$/.test(stem)) return capitalize(`${stem.slice(0, -1)}ied`);
  return capitalize(`${stem}ed`);
}

export function detectSections(text) {
  const found = {};
  for (const line of text.split(/\r?\n/)) {
    const clean = line.replace(/[:|•\-–—]+\s*$/, '').replace(/^\W+/, '').trim();
    if (!clean || clean.split(/\s+/).length > 5) continue;
    for (const [key, re] of Object.entries(SECTION_PATTERNS)) {
      if (re.test(clean)) found[key] = true;
    }
  }
  return found;
}

/** Splits resume text into bullet candidates with their character offsets. */
export function extractBullets(text) {
  const lines = [];
  let offset = 0;
  for (const raw of text.split(/(\r?\n)/)) {
    if (/^\r?\n$/.test(raw)) { offset += raw.length; continue; }
    lines.push({ raw, start: offset });
    offset += raw.length;
  }

  let section = null;
  const sectionOf = [];
  for (const line of lines) {
    const clean = line.raw.replace(/[:|]+\s*$/, '').replace(/^\W+/, '').trim();
    if (clean && clean.split(/\s+/).length <= 5) {
      const hit = Object.entries(SECTION_PATTERNS).find(([, re]) => re.test(clean));
      if (hit) section = hit[0];
    }
    sectionOf.push(section);
  }

  const marked = lines.filter((l) => BULLET_RE.test(l.raw));
  const candidates = marked.length > 0
    ? lines.map((l, i) => ({ ...l, section: sectionOf[i] })).filter((l) => BULLET_RE.test(l.raw))
    : lines
      .map((l, i) => ({ ...l, section: sectionOf[i] }))
      .filter((l) => l.raw.trim().split(/\s+/).length >= 6 && !['skills', 'education'].includes(l.section));

  return candidates
    .map((l) => {
      const lead = l.raw.match(BULLET_RE)?.[0] ?? l.raw.match(/^\s*/)[0];
      const textPart = l.raw.slice(lead.length).trimEnd();
      return { text: textPart, start: l.start + lead.length, end: l.start + lead.length + textPart.length, section: l.section };
    })
    .filter((b) => b.text.length > 0);
}

function classify(text) {
  for (const [type, re] of TYPE_RULES) if (re.test(text)) return type;
  return 'general';
}

function rewriteOpening(text, type) {
  const rules = [
    [/^(?:i\s+)?(?:worked|working)\s+on\s+/i, () => ({ web: 'Developed ', ml: 'Built ', optimization: 'Improved ', team: 'Coordinated ', general: 'Developed ' }[type])],
    [/^(?:i\s+)?(?:helped|assisted)\s+(?:the|my|our)\s+team\s+(?:to\s+)?(\w+)\b/i, (m, v) => (/ing$/i.test(v) ? `Collaborated with the team on ${v}` : `Collaborated with the team to ${v}`)],
    [/^(?:i\s+)?(?:helped|assisted)\s+(?:in\s+|with\s+)?(\w+)/i, (m, next) => {
      if (/ing$/i.test(next)) return `Contributed to ${next}`;
      if (/^(?:the|a|an|our|my|with|team|teams)$/i.test(next)) return `Supported ${next}`;
      return `Collaborated to ${next}`;
    }],
    [/^(?:i\s+was\s+|was\s+)?responsible\s+for\s+(\w+ing)\b/i, (m, g) => gerundToPast(g)],
    [/^(?:i\s+was\s+|was\s+)?responsible\s+for\s+/i, () => 'Owned '],
    [/^(?:i\s+was\s+|was\s+)?(?:involved|participated)\s+in\s+(\w+ing)\b/i, (m, g) => gerundToPast(g)],
    [/^(?:i\s+was\s+|was\s+)?(?:involved|participated)\s+in\s+/i, () => (type === 'team' ? 'Competed in ' : 'Contributed to ')],
    [/^(?:i\s+)?made\s+(a|an)\s+/i, (m, art) => `Built ${art} `],
    [/^(?:i\s+)?did\s+(\w+ing)\s+(?:of|for|on)\s+/i, (m, g) => `${gerundToPast(g)} `],
    [/^(?:i\s+)?did\s+/i, () => 'Completed '],
    [/^(?:i\s+)?handled\s+/i, () => 'Managed '],
    [/^(\w+ing)\b(?!\s+of\b)/i, (m, g) => (STRONG_VERBS.has(gerundToPast(g).toLowerCase()) ? gerundToPast(g) : m)],
    [/^(?:i|we)\s+(\w+)/i, (m, v) => capitalize(v)],
  ];
  for (const [re, fn] of rules) {
    if (re.test(text)) return text.replace(re, fn);
  }
  return text;
}

/**
 * Produces an improved bullet WITHOUT inventing facts:
 * verbs get stronger, filler goes, and any missing number becomes a [placeholder] + question.
 */
export function rewriteBullet(text, { type = classify(text), hasMetric = METRIC_RE.test(text) } = {}) {
  let out = text.trim().replace(/\s+/g, ' ');
  out = rewriteOpening(out, type);
  out = out
    .replace(/,?\s*\b(?:etc\.?|and so on)(?=[\s.,;]|$)/gi, '')
    .replace(/\bvarious\s+/gi, '[specific] ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/[.;,\s]+$/, '');
  out = capitalize(out);
  if (!hasMetric) out += PLACEHOLDERS[type];
  return out;
}

export function analyzeBullet(bullet) {
  const { text } = bullet;
  const type = classify(text);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const firstWord = (words[0] || '').toLowerCase().replace(/[^a-z-]/g, '');
  const weak = [];
  for (const { phrase, suggest } of WEAK_PHRASES) {
    for (const hit of findTerm(text, phrase)) weak.push({ phrase, suggest, start: bullet.start + hit.start, end: bullet.start + hit.end });
  }
  const startsWeak = WEAK_PHRASES.some(({ phrase }) => findTerm(text, phrase).some((h) => text.slice(0, h.start).trim() === '' || /^(?:i|i was|was)$/i.test(text.slice(0, h.start).trim())));
  const strongVerb = STRONG_VERBS.has(firstWord);
  const hasMetric = METRIC_RE.test(text);
  const firstPerson = FIRST_PERSON_RE.test(text);

  const issues = [];
  if (startsWeak) issues.push({ kind: 'weak-verb', message: 'Opens with a weak phrase.' });
  else if (!strongVerb) issues.push({ kind: 'no-verb', message: 'Start with a strong action verb (Built, Designed, Reduced…).' });
  if (!hasMetric) issues.push({ kind: 'no-metric', message: 'No measurable result. Add a real number if you have one.' });
  if (firstPerson) issues.push({ kind: 'first-person', message: 'Drop "I / my / we". Resumes are written without pronouns.' });
  const tools = [...new Set(findAnyTerm(text, TOOL_TERMS).map((h) => h.text))];
  if (tools.length === 0) issues.push({ kind: 'no-tool', message: 'Name the tool or tech you actually used.' });
  if (words.length < BULLET_WORDS.min) issues.push({ kind: 'too-short', message: `Only ${words.length} words. Say what you built, with what, and the result (aim for ${BULLET_WORDS.min}-${BULLET_WORDS.max}).` });
  if (words.length > BULLET_WORDS.max) issues.push({ kind: 'too-long', message: `${words.length} words. Split it or cut to ${BULLET_WORDS.max} or fewer.` });
  if (weak.some((w) => ['various', 'etc', 'stuff', 'things'].includes(w.phrase))) issues.push({ kind: 'vague', message: 'Vague filler word. Name the specific items.' });

  const goodLength = words.length >= BULLET_WORDS.min && words.length <= BULLET_WORDS.max;
  const checklist = {
    strongVerb: strongVerb && !startsWeak,
    namesTool: tools.length > 0,
    hasResult: hasMetric,
    goodLength,
  };
  const points = Object.values(checklist).filter(Boolean).length;
  const rewrite = rewriteBullet(text, { type, hasMetric });

  return {
    ...bullet,
    type,
    wordCount: words.length,
    strongVerb: strongVerb && !startsWeak,
    startsWeak,
    hasMetric,
    firstPerson,
    weak,
    issues,
    tools,
    checklist,
    strength: points === 4 ? 'strong' : points >= 2 ? 'okay' : 'weak',
    rewrite: rewrite === text.trim() ? null : rewrite,
    questions: hasMetric ? [] : QUESTIONS[type],
  };
}

export function countPlaceholders(text) {
  return (text.match(PLACEHOLDER_RE) || []).length;
}
