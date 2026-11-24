function Bar({ value, className }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-all duration-500 ${className}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function CoverageCard({ coverage, bulletStats }) {
  if (!coverage) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        Paste a job description to see how much of it your resume covers.
      </div>
    );
  }
  const gain = coverage.potential - coverage.now;
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">JD keyword coverage</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-5xl font-bold tabular-nums text-slate-900">{coverage.now}%</span>
          {gain > 0 && (
            <span className="mb-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              up to {coverage.potential}% by rewording what you already have
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Your resume covers <b>{coverage.now}%</b> of the weighted skills listed in this posting.
        </p>
        <div className="mt-3 space-y-1.5">
          <Bar value={coverage.now} className="bg-emerald-500" />
          <Bar value={coverage.potential} className="bg-amber-400" />
        </div>
        <p className="mt-3 text-[11px] leading-snug text-slate-400">
          A rule of thumb for this one posting, using ProofCV's own dictionary and weights. It does not predict any ATS
          or hiring decision.
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center md:grid-cols-2">
        <Stat label="Already in your resume" value={coverage.matched} tone="text-emerald-600" />
        <Stat label="Check your wording" value={coverage.reworded} tone="text-amber-600" />
        <Stat label="Not found" value={coverage.missing} tone="text-rose-600" />
        <Stat label="Bullets with a result" value={`${bulletStats.withMetric}/${bulletStats.total}`} tone="text-slate-800" />
        <Stat label="Strong openers" value={`${bulletStats.strongVerb}/${bulletStats.total}`} tone="text-slate-800" />
        <Stat label="Strong bullets" value={`${bulletStats.strong}/${bulletStats.total}`} tone="text-slate-800" />
      </dl>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <dd className={`text-xl font-bold tabular-nums ${tone}`}>{value}</dd>
      <dt className="text-[11px] leading-tight text-slate-500">{label}</dt>
    </div>
  );
}
