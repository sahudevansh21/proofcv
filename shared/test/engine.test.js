import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyze, analyzeBullet, findTerm, gerundToPast, rewriteBullet, extractBullets, PRESETS, SAMPLE_RESUME, SAMPLES, SKILLS,
} from '../src/index.js';

test('whole-word matching respects tech-name boundaries', () => {
  assert.equal(findTerm('I know JavaScript', 'java').length, 0);
  assert.equal(findTerm('Java and C++', 'java').length, 1);
  assert.equal(findTerm('Built with Node.js', 'js').length, 0);
  assert.equal(findTerm('C++ and C#', 'c++').length, 1);
  assert.equal(findTerm('machine-learning models', 'machine learning').length, 1);
  assert.equal(findTerm('Deployed on Vercel', 'deploy*').length, 1);
});

test('gerundToPast handles regular, doubled, -y and irregular stems', () => {
  assert.equal(gerundToPast('managing'), 'Managed');
  assert.equal(gerundToPast('developing'), 'Developed');
  assert.equal(gerundToPast('debugging'), 'Debugged');
  assert.equal(gerundToPast('studying'), 'Studied');
  assert.equal(gerundToPast('deploying'), 'Deployed');
  assert.equal(gerundToPast('building'), 'Built');
});

test('rewrites never invent numbers and leave placeholders instead', () => {
  const out = rewriteBullet('Worked on a website for the college fest using React');
  assert.match(out, /^Developed a website/);
  assert.match(out, /\[N\]/);
  assert.doesNotMatch(out.replace(/\[[^\]]+\]/g, ''), /\d/);

  const kept = rewriteBullet('Reduced API latency by 40% using Redis caching');
  assert.equal(kept, 'Reduced API latency by 40% using Redis caching');
});

test('weak openers are rewritten into truthful strong verbs', () => {
  assert.match(rewriteBullet('Responsible for building an expense tracker with Node.js'), /^Built an expense tracker/);
  assert.match(rewriteBullet('Involved in training a model in Python'), /^Trained a model/);
  assert.match(rewriteBullet('Helped the team connect the frontend to the API'), /^Collaborated with the team to connect/);
  assert.match(rewriteBullet('Did testing of various features etc.'), /^Tested \[specific\] features/);
});

test('bullets are extracted with offsets that point back into the resume', () => {
  const text = 'PROJECTS\n- Built a CLI in Go\n• Wrote docs';
  const bullets = extractBullets(text);
  assert.equal(bullets.length, 2);
  for (const b of bullets) assert.equal(text.slice(b.start, b.end), b.text);
  assert.equal(bullets[0].section, 'projects');
});

test('sample data produces all three skill buckets', () => {
  const r = analyze(SAMPLE_RESUME, PRESETS.find((p) => p.id === 'sde').jd);
  const status = (name) => r.skills.find((s) => s.name === name)?.status;
  assert.equal(status('Node.js'), 'matched');
  assert.equal(status('REST APIs'), 'reworded');
  assert.equal(status('Responsive Design'), 'reworded');
  assert.equal(status('SQL'), 'missing');
  assert.equal(status('Docker'), 'missing');
  assert.ok(r.coverage.potential > r.coverage.now);
  assert.ok(r.fixes.length > 0 && r.fixes.length <= 5);
});

test('JD section headings set importance', () => {
  const jd = 'Requirements:\n- Familiarity with SQL\n\nNice to have:\n- Docker';
  const r = analyze('', jd);
  assert.equal(r.skills.find((s) => s.name === 'SQL').level, 'required');
  assert.equal(r.skills.find((s) => s.name === 'Docker').level, 'preferred');
});

test('highlights reference valid, non-overlapping ranges', () => {
  const r = analyze(SAMPLE_RESUME, PRESETS[0].jd);
  let last = -1;
  for (const h of r.highlights) {
    assert.ok(h.start >= last && h.end > h.start && h.end <= SAMPLE_RESUME.length);
    last = h.end;
  }
  assert.ok(r.jdHighlights.length > 0);
});

test('empty and invalid input are handled', () => {
  const r = analyze('', '');
  assert.equal(r.coverage, null);
  assert.ok(r.warnings.length > 0);
  assert.throws(() => analyze(null, ''), TypeError);
});

test('dictionary has 150+ well-formed, unique skills', () => {
  assert.ok(SKILLS.length >= 150, `only ${SKILLS.length} skills`);
  assert.equal(new Set(SKILLS.map((s) => s.id)).size, SKILLS.length);
  for (const s of SKILLS) {
    assert.ok(s.aliases.length > 0, `${s.name} has no aliases`);
    for (const a of s.aliases) assert.ok(!s.evidence.includes(a), `${s.name}: "${a}" is both alias and evidence`);
  }
  const categories = new Set(SKILLS.map((s) => s.category));
  for (const c of ['Language', 'Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Data', 'CS Fundamentals', 'Soft Skill']) {
    assert.ok(categories.has(c), `missing category ${c}`);
  }
});

test('light stemming: plurals and starred suffixes', () => {
  assert.equal(findTerm('Built three REST APIs', 'rest api').length, 1);
  assert.equal(findTerm('Used classes and inheritance', 'class').length, 1);
  assert.equal(findTerm('Handled deployment on Render', 'deploy*').length, 1);
  assert.equal(findTerm('Automated testing', 'test*').length, 1);
  assert.equal(findTerm('expressed interest', 'express').length, 0);
});

test('special tech names keep their symbols', () => {
  assert.equal(findTerm('Knows C# and .NET', 'c#').length, 1);
  assert.equal(findTerm('Knows C# and .NET', '.net').length, 1);
  assert.equal(findTerm('React.js app', 'react.js').length, 1);
  assert.equal(findTerm('Built with Node.js', 'node.js').length, 1);
});

test('weighting: minimum/must -> required, bonus/preferred -> preferred', () => {
  const jd = 'Minimum qualifications:\n- Python\n\nBonus:\n- Docker\n\nAbout you\n- Must know Git\n- Kubernetes is preferred';
  const level = (name) => analyze('', jd).skills.find((s) => s.name === name).level;
  assert.equal(level('Python'), 'required');
  assert.equal(level('Docker'), 'preferred');
  assert.equal(level('Git'), 'required');
  assert.equal(level('Kubernetes'), 'preferred');
});

test('coverage now counts exact matches only; potential adds worded-differently', () => {
  const r = analyze('- Built a site with React and GitHub', 'Requirements:\n- React\n- Version control');
  assert.equal(r.coverage.now, 50);
  assert.equal(r.coverage.potential, 100);
  assert.equal(r.skills.find((s) => s.name === 'Version Control').status, 'reworded');
});

test('missing skills are never suggested as claims', () => {
  const r = analyze('- Built a CLI in Python', 'Requirements:\n- Docker\n- Kubernetes');
  for (const s of r.skills.filter((x) => x.status === 'missing')) {
    assert.match(s.advice, /Don't claim this unless it's true/);
  }
  for (const f of r.fixes) assert.doesNotMatch(f, /add (docker|kubernetes)/i);
});

const digits = (t) => (t.replace(/\[[^\]]+\]/g, '').match(/\d+(?:[.,]\d+)?/g) ?? []).sort();

test('no invented numbers: rewrites only contain numbers from the original bullet', () => {
  const extra = [
    'Worked on a chatbot',
    'Helped the team build a dashboard for the canteen',
    'Responsible for optimizing queries',
    'Involved in training a CNN on 4,000 images with 91% accuracy',
    'Made a game in Unity',
    'Participated in Smart India Hackathon 2025',
  ];
  const bullets = [
    ...SAMPLES.flatMap((s) => analyze(s.resume, '').bullets.map((b) => b.text)),
    ...extra,
  ];
  for (const text of bullets) {
    const { rewrite } = analyzeBullet({ text, start: 0, end: text.length });
    if (!rewrite) continue;
    assert.deepEqual(digits(rewrite), digits(text), `invented number in: "${rewrite}"`);
  }
});

test('placeholders in the resume are highlighted and counted', () => {
  const r = analyze('PROJECTS\n- Developed a portal used by [N] users', '');
  assert.equal(r.placeholders, 1);
  assert.ok(r.highlights.some((h) => h.kind === 'placeholder'));
});
