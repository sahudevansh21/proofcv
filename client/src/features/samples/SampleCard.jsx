import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { sampleImage, presetById } from './samples.js';

/** A miniature "paper" rendering of the resume text, used when no PNG is provided. */
function PaperPreview({ text }) {
  const lines = text.split('\n').slice(0, 22);
  return (
    <div aria-hidden className="h-full overflow-hidden bg-white px-4 py-3 font-mono text-[6.5px] leading-[9px] text-[#3c4043]">
      {lines.map((l, i) => {
        const heading = /^[A-Z][A-Z &]{3,}$/.test(l.trim());
        return (
          <p
            key={i}
            className={`truncate ${i === 0 ? 'text-[9px] font-bold leading-3 text-[#202124]' : ''} ${heading ? 'mt-1 border-b border-[#dadce0] font-bold text-[#1a73e8]' : ''}`}
          >
            {l || ' '}
          </p>
        );
      })}
    </div>
  );
}

export function SampleCard({ sample, onSelect }) {
  const src = sampleImage(sample.id);
  const [imageOk, setImageOk] = useState(Boolean(src));
  const preset = presetById(sample.presetId);
  return (
    <button
      type="button"
      onClick={() => onSelect(sample)}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface text-left shadow-[var(--shadow-card)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-surface-2 p-3">
        <div className="h-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-[1.02]">
          {imageOk ? (
            <img
              src={src}
              alt={`Preview of ${sample.name}'s sample resume`}
              loading="lazy"
              decoding="async"
              width="400"
              height="300"
              onError={() => setImageOk(false)}
              className="h-full w-full bg-white object-cover object-top"
            />
          ) : (
            <PaperPreview text={sample.resume} />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold text-fg">{sample.name}</p>
        <p className="text-xs text-fg-muted">
          {sample.persona} · {preset?.role}
        </p>
        <p className="mt-2 text-sm text-fg-muted">{sample.focus}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary">
          Audit this sample <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
