// Compiles every LaTeX template against every sample resume with Tectonic (XeLaTeX).
// Usage: node scripts/compile-templates.mjs [outDir]   (needs `tectonic` on PATH)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SAMPLES, TEMPLATES, resumeToLatex } from '../shared/src/index.js';

const out = process.argv[2] ?? mkdtempSync(join(tmpdir(), 'proofcv-tex-'));
mkdirSync(out, { recursive: true });
let failed = 0;
for (const t of TEMPLATES) {
  for (const s of SAMPLES) {
    const file = join(out, `${t.id}-${s.id}.tex`);
    writeFileSync(file, resumeToLatex(s.resume, t.id));
    try {
      execFileSync('tectonic', ['-X', 'compile', '--outdir', out, file], { stdio: 'pipe' });
    } catch (err) {
      failed++;
      console.error(`FAIL ${t.id}/${s.id}\n${String(err.stderr).split('\n').filter((l) => /error|!/.test(l)).slice(0, 4).join('\n')}`);
    }
  }
}
console.log(`${TEMPLATES.length * SAMPLES.length - failed}/${TEMPLATES.length * SAMPLES.length} compiled → ${out}`);
process.exit(failed ? 1 : 0);
