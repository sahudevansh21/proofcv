import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentError, guardDraft, keepMentionedSkills, readInput, runAgent, stripInventedNumbers } from '../src/agent.js';

const input = {
  profile: { name: 'Asha', email: '', phone: '', links: '', college: 'AITR', degree: 'B.Tech CSE', year: '2nd year' },
  answers: [{ question: 'Tell me about a project', answer: 'Built a library app in React and Node.js, 40 students use it. Used Git.' }],
};

test('numbers the student never gave become [N]; given ones stay', () => {
  const { out, replaced } = stripInventedNumbers('Served 40 students and cut load time by 35%', '40 students use it');
  assert.equal(out, 'Served 40 students and cut load time by [N]%');
  assert.equal(replaced, 1);
});

test('skills not mentioned are removed; aliases count as mentioned', () => {
  const { kept, removed } = keepMentionedSkills(
    [{ group: 'Tools', items: ['React', 'Node.js', 'Docker', 'Version Control'] }],
    input.answers[0].answer,
  );
  assert.deepEqual(kept[0].items, ['React', 'Node.js', 'Version Control']);
  assert.deepEqual(removed, ['Docker']);
});

test('guardDraft cleans every section and explains what changed', () => {
  const draft = {
    name: 'Asha',
    contact: [],
    summary: 'Student with 3 projects',
    education: [{ school: 'AITR', degree: 'B.Tech CSE', dates: '2024 - 2028', details: 'CGPA 9.1' }],
    skills: [{ group: 'Tools', items: ['React', 'Kubernetes'] }],
    projects: [{ name: 'Library app', tech: 'React', bullets: ['Built an app used by 40 students, cutting wait time by 50%'] }],
    experience: [],
    achievements: ['Won 1st prize'],
    notes: [],
  };
  const out = guardDraft(draft, input);
  assert.match(out.projects[0].bullets[0], /40 students.*\[N\]%/);
  assert.equal(out.education[0].details, 'CGPA [N]');
  assert.deepEqual(out.skills[0].items, ['React']);
  assert.ok(out.checks.some((c) => c.includes('Kubernetes')));
});

test('readInput validates action, role and size', () => {
  assert.throws(() => readInput({ action: 'x' }), AgentError);
  assert.throws(() => readInput({ action: 'next', answers: [] }), /role/);
  assert.equal(readInput({ action: 'next', presetId: 'sde', answers: [] }).role, 'Software Engineering Intern');
  assert.throws(() => readInput({ action: 'draft', presetId: 'sde', answers: [{ question: 'q', answer: '' }] }), /at least one/);
});

test('runAgent sends a structured-output request with fallbacks and guards the draft', async () => {
  let sent;
  const fake = {
    beta: {
      messages: {
        create: async (params) => {
          sent = params;
          const draft = {
            name: 'Asha',
            contact: [],
            summary: '',
            education: [],
            skills: [{ group: 'Tools', items: ['AWS'] }],
            projects: [],
            experience: [],
            achievements: [],
            notes: [],
          };
          return { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(draft) }] };
        },
      },
    },
  };
  const out = await runAgent({ action: 'draft', presetId: 'sde', ...input }, fake);
  assert.equal(sent.model, 'claude-opus-5-5');
  assert.equal(sent.fallbacks, 'default');
  assert.equal(sent.output_config.format.type, 'json_schema');
  assert.deepEqual(out.resume.skills, []);
});

test('a refusal becomes a friendly error', async () => {
  const fake = { beta: { messages: { create: async () => ({ stop_reason: 'refusal', content: [] }) } } };
  await assert.rejects(runAgent({ action: 'next', presetId: 'sde', answers: [] }, fake), (e) => e.code === 'refused');
});
