import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [state, setState] = useState('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('done');
    } catch {
      setState('error');
    }
    setTimeout(() => setState('idle'), 1500);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 no-print ${className}`}
    >
      {state === 'done' ? 'Copied ✓' : state === 'error' ? 'Copy failed' : label}
    </button>
  );
}
