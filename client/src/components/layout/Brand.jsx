import { Link } from 'react-router';

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
