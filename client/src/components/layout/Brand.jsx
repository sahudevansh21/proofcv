import { Link } from 'react-router';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useStore } from '../../lib/store.js';

export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--surface)" stroke="var(--line)" />
      <path d="M8 9h10" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 15h6" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 21h4" stroke="#FBBC04" strokeWidth="3" strokeLinecap="round" />
      <path d="M15.5 20.5l3.5 3.5 6.5-8" fill="none" stroke="#34A853" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-lg" aria-label="ProofCV home">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-fg">Proof<span className="text-primary">CV</span></span>
    </Link>
  );
}

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/** Cycles light → dark → system. */
export function ThemeToggle({ className = '' }) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const i = THEMES.findIndex((t) => t.value === theme);
  const current = THEMES[i === -1 ? 2 : i];
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      aria-label={`Theme: ${current.label}. Switch to ${next.label}`}
      title={`Theme: ${current.label}`}
      className={`inline-grid h-10 w-10 place-items-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg ${className}`}
    >
      <current.icon aria-hidden className="h-[18px] w-[18px]" />
    </button>
  );
}

export { THEMES };
