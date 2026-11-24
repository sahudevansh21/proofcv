import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, findTerm, gerundToPast, rewriteBullet, extractBullets, PRESETS, SAMPLE_RESUME } from '../src/index.js';

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
