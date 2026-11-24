import { useId, useRef } from 'react';

export function Card({ as: Tag = 'div', className = '', padded = true, children, ...rest }) {
  return (
    <Tag className={`rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] ${padded ? 'p-5' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

const TONES = {
  neutral: 'bg-surface-2 text-fg-muted ring-line',
  primary: 'bg-primary-soft text-primary-soft-fg ring-primary/20',
  success: 'bg-success-soft text-success-fg ring-success/30',
  warning: 'bg-warning-soft text-warning-fg ring-warning/40',
  danger: 'bg-danger-soft text-danger-fg ring-danger/30',
};

/** Small label. Pass an icon so meaning never relies on colour alone. */
export function Badge({ tone = 'neutral', icon: Icon, className = '', children, ...rest }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`} {...rest}>
      {Icon && <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  );
}

/** Accessible tabs (WAI-ARIA pattern): arrow keys, Home/End move between tabs. */
export function Tabs({ tabs, value, onChange, label, className = '', size = 'md' }) {
  const refs = useRef([]);
  const baseId = useId();
  const onKeyDown = (e, i) => {
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (keys[e.key] + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';
  return (
    <div role="tablist" aria-label={label} className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1 ${className}`}>
      {tabs.map((t, i) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => { refs.current[i] = el; }}
            id={`${baseId}-${t.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={t.panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 ${pad} ${
              selected ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {t.icon && <t.icon aria-hidden className="h-4 w-4" />}
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${selected ? 'bg-surface-2' : 'bg-surface'}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** CSS tooltip, shown on hover and keyboard focus. */
export function Tooltip({ content, children, side = 'top' }) {
  const id = useId();
  const pos = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  return (
    <span className="group relative inline-flex">
      <span aria-describedby={id} className="inline-flex">{children}</span>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-64 -translate-x-1/2 rounded-lg bg-[#202124] px-2.5 py-1.5 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${pos}`}
      >
        {content}
      </span>
    </span>
  );
}

export function Skeleton({ className = '' }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export function EmptyState({ icon: Icon, title, children, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-10 text-center ${className}`}>
      {Icon && <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary-soft-fg"><Icon aria-hidden className="h-6 w-6" /></span>}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {children && <div className="mt-1 max-w-md text-sm text-fg-muted">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Horizontal steps for "how it works" style explanations. */
export function Stepper({ steps, current = -1 }) {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-3">
          <span
            aria-hidden
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${i <= current ? 'bg-primary text-primary-fg' : 'bg-primary-soft text-primary-soft-fg'}`}
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-fg">{s.title}</p>
            <p className="mt-0.5 text-sm text-fg-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
