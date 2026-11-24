import { useMemo } from 'react';
import { analyze } from '@proofcv/shared';
import { useDebounced } from '../../lib/hooks.js';
import { useUserData } from '../../lib/store.js';

/** Analyses the current draft. Re-scores live, debounced so typing stays smooth. */
export function useAudit() {
  const { draft } = useUserData();
  const resume = useDebounced(draft.resume, 200);
  const jd = useDebounced(draft.jd, 200);
  const result = useMemo(() => analyze(resume, jd), [resume, jd]);
  const pending = resume !== draft.resume || jd !== draft.jd;
  return { draft, result, pending, analysedResume: resume, analysedJd: jd };
}

/** Compact, serialisable snapshot stored in History. */
export function toAuditSnapshot({ draft, result, role, resumeId }) {
  return {
    resumeId,
    title: draft.title?.trim() || 'Untitled resume',
    role: role ?? 'Custom job description',
    coverageNow: result.coverage?.now ?? null,
    coveragePotential: result.coverage?.potential ?? null,
    counts: result.coverage ? { matched: result.coverage.matched, reworded: result.coverage.reworded, missing: result.coverage.missing } : null,
    bulletStats: result.bulletStats,
    skills: result.skills.map(({ name, status, level }) => ({ name, status, level })),
    fixes: result.fixes,
    resume: draft.resume,
    jd: draft.jd,
  };
}
