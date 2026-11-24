import { useCountUp } from '../../lib/hooks.js';

/**
 * Two-layer ring: the inner arc is the main value, the faint outer arc a secondary value
 * (e.g. coverage now vs. coverage after rewording true skills).
 */
export function ProgressRing({
  value,
  secondary,
  size = 160,
  stroke = 14,
  label,
  sublabel,
  tone = 'var(--success)',
  secondaryTone = 'var(--warning)',
}) {
  const shown = useCountUp(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = (v) => c * (1 - Math.max(0, Math.min(100, v)) / 100);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        {secondary !== undefined && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={secondaryTone}
            strokeOpacity="0.55"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset(secondary)}
            style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.2,0.8,0.2,1)' }}
          />
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset(value)}
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.2,0.8,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <span className="block text-[40px] font-bold leading-none tabular-nums text-fg">{shown}%</span>
          {label && <span className="mt-1 block text-xs font-medium text-fg-muted">{label}</span>}
          {sublabel && <span className="block text-[11px] text-fg-subtle">{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}
