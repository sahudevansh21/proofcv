import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLES, TEMPLATES, escapeTex, parseResume, resumeToLatex, splitDate, texText } from '../src/index.js';

/** Braces must balance once escaped braces (\{ \}) are ignored. */
function balanced(tex) {
  let depth = 0;
  const body = tex.replace(/\\[{}]/g, '').replace(/^%.*$/gm, '');
  for (const ch of body) {
    if (ch === '{') depth++;
    if (ch === '}' && --depth < 0) return false;
  }
  return depth === 0;
}

test('escapeTex handles every LaTeX special character', () => {
  assert.equal(escapeTex('a & b % c $ d # e _ f { g } h ~ i ^ j \\ k'),
    'a \\& b \\% c \\$ d \\# e \\_ f \\{ g \\} h \\textasciitilde{} i \\textasciicircum{} j \\textbackslash{} k');
  assert.equal(escapeTex('A → B – C 🚀'), 'A $\\rightarrow$ B -- C ');
});

test('placeholders are kept and marked, never filled', () => {
  assert.equal(texText('Reached [N] users'), 'Reached \\ph{N} users');
  const tex = resumeToLatex('Asha\n\nPROJECTS\nApp\n- [N] users signed up', 'classic');
  assert.match(tex, /\\item\{\} \\ph\{N\} users signed up/);
});

test('parser finds name, contact, sections and dates', () => {
  const m = parseResume(SAMPLES[0].resume);
  assert.equal(m.name, 'Shah Rukh Khan');
  assert.deepEqual(m.contact, ['shahrukh.khan@example.com', 'github.com/example-srk']);
  assert.deepEqual(m.sections.map((s) => s.kind), ['entries', 'skills', 'entries', 'list']);
  assert.equal(m.sections[0].entries[0].date, '2025 – 2029');
  assert.deepEqual(splitDate('Intern, Collector Office (Summer 2024)'), { text: 'Intern, Collector Office', date: 'Summer 2024' });
  const skills = parseResume('X\n\nSKILLS\nTools: Git, AWS (EC2, S3), Docker').sections[0].items[0];
  assert.deepEqual(skills, { group: 'Tools', values: ['Git', 'AWS (EC2, S3)', 'Docker'] });
});

test('every template renders every sample with balanced braces and every bullet intact', () => {
  for (const t of TEMPLATES) {
    for (const s of SAMPLES) {
      const tex = resumeToLatex(s.resume, t.id);
      assert.ok(tex.includes('\\begin{document}') && tex.trim().endsWith('\\end{document}'), `${t.id}/${s.id} document`);
      assert.ok(balanced(tex), `${t.id}/${s.id} braces`);
      for (const section of parseResume(s.resume).sections) {
        for (const e of section.entries ?? []) for (const b of e.bullets) assert.ok(tex.includes(texText(b)), `${t.id}/${s.id} lost: ${b}`);
      }
    }
  }
});
