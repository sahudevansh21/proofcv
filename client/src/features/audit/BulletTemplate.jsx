import { useMemo, useState } from 'react';
import { Card, Input, Select } from '../../components/ui/index.js';
import { CopyButton } from './CopyButton.jsx';
import { VERB_GROUPS } from './BulletInspector.jsx';

/** Build a new bullet from scratch: verb + what + tool + verifiable result. Never pre-fills a result. */
export function BulletTemplate({ tools }) {
  const [verb, setVerb] = useState('Developed');
  const [what, setWhat] = useState('');
  const [tool, setTool] = useState('');
  const [result, setResult] = useState('');

  const output = useMemo(() => {
    const t = tool.trim() ? `using ${tool.trim()}` : 'using [tool you actually used]';
    return `${verb} ${what.trim() || '[what you built or did]'} ${t}, ${result.trim() || '[result you can verify]'}`;
  }, [verb, what, tool, result]);

  return (
    <Card className="print-break no-print">
      <h2 className="text-sm font-semibold text-fg">Write a new bullet</h2>
      <p className="mt-1 text-xs text-fg-muted">Strong verb + what + tool you actually used + a result you can verify.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[10rem_1fr_1fr_1fr]">
        <Select label="Verb" value={verb} onChange={(e) => setVerb(e.target.value)}>
          {Object.entries(VERB_GROUPS).map(([group, verbs]) => (
            <optgroup key={group} label={group}>
              {verbs.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </optgroup>
          ))}
        </Select>
        <Input label="What" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="a budget tracker for hostel students" />
        <Input
          label="Tool you used"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          list="resume-tools"
          placeholder="React and Firebase"
        />
        <Input
          label="Result you can verify"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="users, minutes saved, accuracy, rows handled"
        />
        <datalist id="resume-tools">
          {tools.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-primary-soft/60 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm font-medium text-fg">
          {output.split(/(\[[^\]]+\])/g).map((p, i) =>
            /^\[/.test(p) ? (
              <mark key={i} className="hl hl-placeholder">
                {p}
              </mark>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
        </p>
        <CopyButton text={output} />
      </div>
      <p className="mt-3 text-xs text-fg-muted">
        Example. Before: “Worked on a website for college fest” → After: “Developed a React event portal for the college tech fest, handling{' '}
        <mark className="hl hl-placeholder">[N]</mark> registrations”. The [N] stays empty until you add your real number.
      </p>
    </Card>
  );
}
