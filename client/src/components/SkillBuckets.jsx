const BUCKETS = [
  {
    status: 'matched',
    title: 'Already in your resume',
    blurb: 'Same wording as the posting.',
    tone: 'border-emerald-200 bg-emerald-50/60',
    chip: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    icon: '✓',
  },
  {
    status: 'reworded',
    title: 'Check your wording',
    blurb: 'Related wording is already in your resume. Use the posting\'s term only if it is accurate.',
    tone: 'border-amber-200 bg-amber-50/60',
    chip: 'bg-amber-100 text-amber-900 ring-amber-200',
    icon: '≈',
  },
  {
    status: 'missing',
    title: 'Not found: don\'t claim unless true',
    blurb: 'Real gaps. Learn it, build with it, or leave it out.',
    tone: 'border-rose-200 bg-rose-50/60',
    chip: 'bg-rose-100 text-rose-800 ring-rose-200',
    icon: '✕',
  },
];

const LEVEL_LABEL = { required: 'Required', standard: 'Listed', preferred: 'Nice to have' };

export default function SkillBuckets({ skills }) {
  if (skills.length === 0) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {BUCKETS.map((b) => {
        const items = skills.filter((s) => s.status === b.status);
        return (
          <section key={b.status} className={`rounded-xl border p-4 ${b.tone}`}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs shadow-sm">{b.icon}</span>
              {b.title}
              <span className="ml-auto text-xs font-medium text-slate-500">{items.length}</span>
            </h3>
            <p className="mt-1 text-xs text-slate-600">{b.blurb}</p>
            {items.length === 0 ? (
              <p className="mt-3 text-xs italic text-slate-400">None</p>
            ) : b.status === 'matched' ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <li key={s.id} title={s.advice} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${b.chip}`}>
                    {s.name}{s.level === 'required' && <span className="ml-1 opacity-60">★</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-3 space-y-2">
                {items.map((s) => (
                  <li key={s.id} className="rounded-lg bg-white/80 p-2.5 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${b.chip}`}>{s.name}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${s.level === 'required' ? 'text-slate-700' : 'text-slate-400'}`}>
                        {LEVEL_LABEL[s.level]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug text-slate-600">{s.advice}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
