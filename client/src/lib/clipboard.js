import { countPlaceholders } from '@proofcv/shared';

/** Copies text; resolves to the number of unfilled [placeholders] so callers can warn. */
export async function copyText(text) {
  await navigator.clipboard.writeText(text);
  return countPlaceholders(text);
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
