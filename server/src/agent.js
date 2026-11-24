import Anthropic from '@anthropic-ai/sdk';
import { PRESETS, SKILLS, findAnyTerm } from '@proofcv/shared';

/**
 * Resume agent: an interviewer that asks one question at a time, then a writer that drafts a resume
 * from the answers only. This is the one feature that sends text off the device (to Anthropic's API),
 * so it is opt-in, size-capped, never logged, and every draft is checked for invented numbers and skills.
 */

export const MODEL = 'claude-opus-5-5';
const BETAS = ['server-side-fallback-2026-07-01'];
const MAX_ANSWERS = 12;
const MAX_ANSWER_CHARS = 2000;
const MAX_TOTAL_CHARS = 16000;

export class AgentError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Validates and trims the request body. Throws AgentError(400) on bad input. */
export function readInput(body) {
  if (!body || typeof body !== 'object') throw new AgentError(400, 'bad_request', 'Send a JSON body.');
  const action = body.action;
  if (action !== 'next' && action !== 'draft') throw new AgentError(400, 'bad_request', 'action must be "next" or "draft".');
  const preset = PRESETS.find((p) => p.id === body.presetId) ?? null;
  const role = str(body.role, 120) || preset?.role || '';
  if (!role) throw new AgentError(400, 'bad_request', 'Pick or type the role you want.');
  const jd = str(body.jd, 6000) || preset?.jd || '';
  if (!Array.isArray(body.answers)) throw new AgentError(400, 'bad_request', 'answers must be a list.');
  const answers = body.answers.slice(0, MAX_ANSWERS).map((a) => ({
    question: str(a?.question, 400),
    answer: str(a?.answer, MAX_ANSWER_CHARS),
  }));
  const p = body.profile && typeof body.profile === 'object' ? body.profile : {};
  const profile = {
    name: str(p.name, 80),
    email: str(p.email, 120),
    phone: str(p.phone, 40),
    links: str(p.links, 300),
    college: str(p.college, 160),
    degree: str(p.degree, 120),
    year: str(p.year, 40),
  };
  const total = JSON.stringify({ answers, profile }).length;
  if (total > MAX_TOTAL_CHARS) throw new AgentError(413, 'too_long', 'That is a lot of text. Shorten a few answers and try again.');
  if (action === 'draft' && !answers.some((a) => a.answer)) throw new AgentError(400, 'bad_request', 'Answer at least one question first.');
  return { action, role, jd, answers, profile };
}

const HONESTY = `Hard rules, never break them:
- Use only facts the student wrote. Never invent employers, projects, tools, numbers, dates, grades, awards or results.
- If a result has no number, write the bullet without one and add a placeholder like [N] where the number belongs (for example "used by [N] students").
- Never add a skill or tool the student did not mention, even if the job posting asks for it.
- Rewording is allowed: stronger verbs, clearer structure, the posting's term for something the student clearly described.`;

const INTERVIEWER = `You are ProofCV's resume interviewer for first- and second-year college students applying for internships.
You ask ONE short, friendly question at a time to gather what is needed for a strong, honest one-page resume for the target role.
Cover, in a sensible order and only once each: education basics (if missing from the profile), projects (what, tools, their part, a measurable result), any internship, job, club or volunteer work, skills they genuinely use, achievements (hackathons, ranks, certifications).
Follow up when an answer is vague, especially to ask for a real number (users, accuracy, time saved, team size). Ask about tools the posting mentions only as a question ("Have you used SQL anywhere?"), never assume.
Set done to true when you have enough for a solid draft, or after about 8 questions. When done, question is a short closing line.
Keep question under 30 words. why is one short sentence on why it helps. examples has 0 to 3 short example answers in a student's voice.
${HONESTY}`;

const WRITER = `You are ProofCV's resume writer. Turn the student's own answers into a one-page internship resume for the target role.
Order sections for a student: education, skills, projects, experience (only if they have any), achievements.
Each bullet: start with a strong past-tense verb, say what was built and with what, end with the result. 12 to 25 words.
Group skills into short groups (Languages, Frameworks, Tools, ...). Prefer the job posting's spelling for a skill the student clearly has.
summary is one or two lines, or an empty string if there is not enough to say honestly.
In notes, list up to 5 short things the student should fill in or check (missing numbers, dates, links). Do not list skills to add.
${HONESTY}`;

const NEXT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['done', 'question', 'why', 'examples'],
  properties: {
    done: { type: 'boolean' },
    question: { type: 'string' },
    why: { type: 'string' },
    examples: { type: 'array', items: { type: 'string' } },
  },
};

const entry = (extra) => ({
  type: 'object',
  additionalProperties: false,
  required: Object.keys(extra),
  properties: extra,
});
const strings = { type: 'array', items: { type: 'string' } };

const DRAFT_SCHEMA = entry({
  name: { type: 'string' },
  contact: strings,
  summary: { type: 'string' },
  education: {
    type: 'array',
    items: entry({ school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, details: { type: 'string' } }),
  },
  skills: { type: 'array', items: entry({ group: { type: 'string' }, items: strings }) },
  projects: { type: 'array', items: entry({ name: { type: 'string' }, tech: { type: 'string' }, bullets: strings }) },
  experience: {
    type: 'array',
    items: entry({ title: { type: 'string' }, org: { type: 'string' }, dates: { type: 'string' }, bullets: strings }),
  },
  achievements: strings,
  notes: strings,
});

function context({ role, jd, profile, answers }) {
  const lines = [`Target role: ${role}`];
  if (jd) lines.push(`Job posting:\n${jd}`);
  const known = Object.entries(profile).filter(([, v]) => v);
  if (known.length) lines.push(`Profile:\n${known.map(([k, v]) => `${k}: ${v}`).join('\n')}`);
  lines.push(
    answers.length
      ? `Interview so far:\n${answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || '(skipped)'}`).join('\n\n')}`
      : 'Interview so far: nothing yet.',
  );
  return lines.join('\n\n');
}

/** Everything the student wrote, used to check the draft against. */
const sourceText = ({ profile, answers }) => [...Object.values(profile), ...answers.map((a) => a.answer)].join('\n');

/** Replaces any number the student never wrote with [N]. Keeps years and numbers that appear in the input. */
export function stripInventedNumbers(text, source) {
  const known = new Set(source.match(/\d+(?:\.\d+)?/g) ?? []);
  let replaced = 0;
  const out = text.replace(/\d+(?:\.\d+)?/g, (n) => {
    if (known.has(n)) return n;
    replaced += 1;
    return '[N]';
  });
  return { out, replaced };
}

/** Removes skills the student never mentioned (matched through the skill dictionary's aliases when possible). */
export function keepMentionedSkills(groups, source) {
  const removed = [];
  const lower = source.toLowerCase();
  const kept = groups
    .map((g) => ({
      group: g.group,
      items: g.items.filter((item) => {
        const skill = SKILLS.find((s) => s.name.toLowerCase() === item.toLowerCase() || findAnyTerm(item, s.aliases).length > 0);
        const mentioned = skill
          ? findAnyTerm(source, [...skill.aliases, ...skill.evidence]).length > 0
          : lower.includes(item.toLowerCase());
        if (!mentioned) removed.push(item);
        return mentioned;
      }),
    }))
    .filter((g) => g.items.length);
  return { kept, removed };
}

/** Applies both checks to a draft and records what was changed in notes. */
export function guardDraft(draft, input) {
  const source = sourceText(input);
  let numbers = 0;
  const fix = (s) => {
    const { out, replaced } = stripInventedNumbers(s, source);
    numbers += replaced;
    return out;
  };
  const { kept, removed } = keepMentionedSkills(draft.skills, source);
  const result = {
    ...draft,
    summary: fix(draft.summary),
    education: draft.education.map((e) => ({ ...e, dates: fix(e.dates), details: fix(e.details) })),
    skills: kept,
    projects: draft.projects.map((p) => ({ ...p, bullets: p.bullets.map(fix) })),
    experience: draft.experience.map((e) => ({ ...e, dates: fix(e.dates), bullets: e.bullets.map(fix) })),
    achievements: draft.achievements.map(fix),
  };
  const checks = [];
  if (numbers) checks.push(`${numbers} number${numbers === 1 ? '' : 's'} you never gave were replaced with [N].`);
  if (removed.length) checks.push(`Left out because you didn't mention them: ${removed.join(', ')}.`);
  return { ...result, checks };
}

function readJson(message) {
  if (message.stop_reason === 'refusal') throw new AgentError(422, 'refused', 'The AI declined this request. Try rewording your answers.');
  if (message.stop_reason === 'max_tokens')
    throw new AgentError(502, 'truncated', 'The draft was cut off. Try again with shorter answers.');
  const text = message.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new AgentError(502, 'empty', 'The AI returned nothing. Try again.');
  try {
    return JSON.parse(text);
  } catch {
    throw new AgentError(502, 'bad_output', 'The AI returned an unreadable answer. Try again.');
  }
}

let defaultClient;
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    throw new AgentError(
      503,
      'not_configured',
      'The AI resume agent is not set up on this server yet. The rest of ProofCV works without it.',
    );
  }
  defaultClient ??= new Anthropic({ timeout: 55_000, maxRetries: 1 });
  return defaultClient;
};

/** Runs one agent step. Returns plain JSON for the client. */
export async function runAgent(body, client = getClient()) {
  const input = readInput(body);
  const forceDone = input.action === 'next' && input.answers.length >= MAX_ANSWERS;
  if (forceDone) return { done: true, question: 'Thanks, that is plenty. Let’s build your resume.', why: '', examples: [] };

  const isNext = input.action === 'next';
  try {
    const message = await client.beta.messages.create({
      model: MODEL,
      max_tokens: isNext ? 2000 : 8000,
      betas: BETAS,
      fallbacks: 'default',
      system: isNext ? INTERVIEWER : WRITER,
      output_config: {
        effort: isNext ? 'low' : 'medium',
        format: { type: 'json_schema', schema: isNext ? NEXT_SCHEMA : DRAFT_SCHEMA },
      },
      messages: [{ role: 'user', content: context(input) }],
    });
    const data = readJson(message);
    return isNext ? data : { resume: guardDraft(data, input) };
  } catch (err) {
    if (err instanceof AgentError) throw err;
    if (err instanceof Anthropic.RateLimitError) throw new AgentError(429, 'rate_limited', 'The AI is busy. Wait a moment and try again.');
    if (err instanceof Anthropic.AuthenticationError) throw new AgentError(503, 'not_configured', 'The AI key on this server is invalid.');
    if (err instanceof Anthropic.APIConnectionError)
      throw new AgentError(504, 'unreachable', 'Could not reach the AI. Check the connection and try again.');
    if (err instanceof Anthropic.APIError) throw new AgentError(502, 'api_error', 'The AI service had a problem. Try again.');
    throw err;
  }
}

// Small per-instance limiter: enough to stop a runaway client loop, not a real abuse defence.
const hits = new Map();
export function rateLimit(key, { limit = 30, windowMs = 10 * 60_000 } = {}) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) throw new AgentError(429, 'rate_limited', 'Too many requests. Take a short break and try again.');
  recent.push(now);
  hits.set(key, recent);
}

/** Shared HTTP handler for Express (dev, `npm start`) and the Vercel function. Never logs request content. */
export async function handleAgentRequest(req, res) {
  try {
    if (req.method !== 'POST') throw new AgentError(405, 'method', 'Use POST.');
    rateLimit(
      String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'anon')
        .split(',')[0]
        .trim(),
    );
    const data = await runAgent(req.body);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (err) {
    const status = err instanceof AgentError ? err.status : 500;
    if (status === 500) console.error('agent error', err?.name);
    res.setHeader('Cache-Control', 'no-store');
    res
      .status(status)
      .json({
        error: err instanceof AgentError ? err.code : 'server_error',
        message: err instanceof AgentError ? err.message : 'Something went wrong.',
      });
  }
}
