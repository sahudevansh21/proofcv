// Pluggable text extractors for "Import file". Each runs entirely in the browser.
// To add OCR later, register an extractor for image/* that lazy-loads Tesseract.js
// inside `extract` (e.g. `const { recognize } = await import('tesseract.js')`), so the
// library only downloads when someone actually imports an image.

export class UnsupportedFileError extends Error {}

const MAX_BYTES = 1_000_000;

const extractors = [
  {
    id: 'text',
    accepts: (file) => file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name),
    extract: (file) => file.text(),
  },
];

export function registerExtractor(extractor) {
  extractors.unshift(extractor);
}

export const ACCEPT_ATTR = '.txt,.md,text/plain,text/markdown';

export async function extractText(file) {
  if (file.size > MAX_BYTES) throw new UnsupportedFileError('That file is over 1 MB. Paste the text instead.');
  const extractor = extractors.find((x) => x.accepts(file));
  if (!extractor) {
    if (file.type.startsWith('image/')) throw new UnsupportedFileError('Reading text from images isn\'t available yet. Copy the text from your resume and paste it.');
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) throw new UnsupportedFileError('PDF import isn\'t available yet. Open your PDF, select all the text, and paste it.');
    throw new UnsupportedFileError('Only .txt or .md files can be imported. Or paste your text.');
  }
  const text = await extractor.extract(file);
  return text.replace(/\r\n/g, '\n').trim();
}
