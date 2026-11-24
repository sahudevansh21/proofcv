import { Link } from 'react-router';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useStore } from '../../lib/store.js';

export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="4" fill="#FCEB93" stroke="#3A3550" strokeWidth="1.5" />
      <path d="M8 11h12M8 16h8" stroke="#3A3550" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 21.5l3 3 6-7" fill="none" stroke="#3A3550" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ to = '/', className = '' }) {
  return (
    <Link
      to={to}
      aria-label="ProofCV home"
      className={`rounded font-serif font-medium tracking-[-0.01em] text-fg ${className || 'text-[21px]'}`}
    >
      ProofCV
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
