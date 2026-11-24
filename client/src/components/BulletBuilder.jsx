import { useMemo, useState } from 'react';
import CopyButton from './CopyButton.jsx';

const VERBS = {
  'Built something': ['Built', 'Developed', 'Engineered', 'Implemented', 'Created', 'Designed'],
  'Made it better': ['Optimized', 'Reduced', 'Improved', 'Accelerated', 'Refactored', 'Streamlined'],
  'Automated / integrated': ['Automated', 'Integrated', 'Deployed', 'Migrated', 'Configured'],
  'Analysed / researched': ['Analyzed', 'Evaluated', 'Trained', 'Visualized', 'Researched'],
  'People / events': ['Led', 'Coordinated', 'Organized', 'Mentored', 'Presented'],
};

const EXAMPLE = {
  before: 'Worked on a website for college fest',
  after: 'Developed a React event portal for the college tech fest, handling [N] registrations',
};

export default function BulletBuilder({ tools }) {
  const [verb, setVerb] = useState('Developed');
  const [what, setWhat] = useState('');
  const [tool, setTool] = useState('');
  const [result, setResult] = useState('');

  const output = useMemo(() => {
    const parts = [
      verb,
      what.trim() || '[what you built or did]',
      tool.trim() ? `using ${tool.trim()}` : 'using [tool you actually used]',
    ];
    const base = parts.join(' ');
    return `${base}, ${result.trim() || '[result you can verify]'}`;
  }, [verb, what, tool, result]);

  const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[10rem_1fr_1fr_1fr]">
        <label className="text-xs font-semibold text-slate-600">
          Strong verb
          <select value={verb} onChange={(e) => setVerb(e.target.value)} className={`${field} mt-1`}>
            {Object.entries(VERBS).map(([group, verbs]) => (
              <optgroup key={group} label={group}>
                {verbs.map((v) => <option key={v}>{v}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          What
          <input value={what} onChange={(e) => setWhat(e.target.value)} placeholder="a budgeting web app for students" className={`${field} mt-1`} />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Tool you actually used
          <input value={tool} onChange={(e) => setTool(e.target.value)} list="resume-tools" placeholder="React and Firebase" className={`${field} mt-1`} />
          <datalist id="resume-tools">{tools.map((t) => <option key={t} value={t} />)}</datalist>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Result you can verify
          <input value={result} onChange={(e) => setResult(e.target.value)} placeholder="users, minutes saved, accuracy, rows handled" className={`${field} mt-1`} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3">
        <p className="min-w-0 flex-1 text-sm font-medium text-indigo-950">{output}</p>
        <CopyButton text={output} />
      </div>
      <p className="mt-3 text-xs text-slate-500">
        <span className="font-semibold">Example.</span> Before: “{EXAMPLE.before}” → After: “{EXAMPLE.after}”. The [N] stays
        empty until you put in your real number.
      </p>
    </div>
  );
}
