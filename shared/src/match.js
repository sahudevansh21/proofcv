// Term -> RegExp compilation shared by the analyzer and the highlighter.

const cache = new Map();

const escape = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds a case-insensitive global regex for a dictionary term.
 * - Words may be separated by spaces, hyphens, underscores or slashes ("machine-learning").
 * - A word ending in "*" matches any letter suffix ("deploy*" -> "deployed", "deployment").
 * - The last word also matches a plural ("api" -> "apis").
 * - Boundaries treat + and # as word characters so "C" never matches inside "C++";
 * a leading "." blocks matches like "js" inside "Node.js".
 */
export function termRegex(term) {
  if (cache.has(term)) return cache.get(term);
  const body = term
    .trim()
    .split(/[\s\-_]+/)
    .map((word, i, words) => {
      if (word.endsWith('*')) return `${escape(word.slice(0, -1))}[a-z]*`;
      // Light plural stemming on the last word: "rest api" also matches "rest apis", "class" -> "classes".
      if (i === words.length - 1 && /[a-z]{2}$/i.test(word)) return `${escape(word)}(?:e?s)?`;
      return escape(word);
    })
    .join('[\\s\\-_/]+');
  const re = new RegExp(`(?<![a-z0-9+#.])${body}(?![a-z0-9+#])`, 'gi');
  cache.set(term, re);
  return re;
}

/** All non-overlapping occurrences of a term: [{ start, end, text }]. */
export function findTerm(text, term) {
  const re = termRegex(term);
  re.lastIndex = 0;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    if (m[0].length === 0) re.lastIndex += 1;
  }
  return out;
}

/** First term (of a list) that occurs in text, with every occurrence of every matching term. */
export function findAnyTerm(text, terms) {
  const hits = [];
  for (const term of terms) {
    for (const hit of findTerm(text, term)) hits.push({ ...hit, term });
  }
  return hits;
}
