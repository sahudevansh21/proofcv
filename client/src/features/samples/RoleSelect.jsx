import { ChevronDown } from 'lucide-react';
import { PRESETS } from '@proofcv/shared';

export const ROLE_GROUPS = [
  { label: 'Tech roles', presets: PRESETS.filter((p) => p.track === 'tech') },
  { label: 'Non-tech roles', presets: PRESETS.filter((p) => p.track !== 'tech') },
];

/** One dropdown for the 30 role postings, grouped tech / non-tech. `emptyLabel` adds a "none" option. */
export function RoleSelect({ value, onChange, id, emptyLabel, className = '', label = 'Job posting' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        aria-label={id ? undefined : label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] w-full appearance-none rounded-[6px] border border-line-strong bg-surface pl-4 pr-11 font-serif text-[17px] text-fg outline-none focus:border-fg focus:ring-2 focus:ring-[#fceb93]"
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {ROLE_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.role}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
    </div>
  );
}
