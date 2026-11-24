// Turns plain-text resume into a light structure that templates can lay out.
// Nothing is added or reworded: every word in the output comes from the input text.

const BULLET_RE = /^\s*(?:[-*•▪◦●‣–—]|\d{1,2}[.)])\s+/;
const KNOWN_HEADING_RE =
  /^(summary|objective|profile|about( me)?|education|academics?|(technical\s+)?skills?( & tools)?|tech(nical)? stack|tools|projects?|(academic|personal|key) projects|(work |professional )?experience|internships?|employment|clinical experience|teaching experience|achievements?|awards?|accomplishments?|honou?rs?|certifications?|courses?|activities|extra[-\s]?curricular( activities)?|positions? of responsibility|volunteering|leadership|publications?|languages|interests|hobbies)$/i;

const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const POINT = `(?:(?:${MONTH}|summer|winter|spring|autumn|fall)\\s+)?(?:19|20)\\d{2}`;
const DATE_RE = new RegExp(
  `\\(?\\s*(${POINT}(?:\\s*(?:-|–|—|to)\\s*(?:${POINT}|present|ongoing|now|today))?|(?:${MONTH}\\s*(?:-|–|—)\\s*${MONTH}\\s+(?:19|20)\\d{2}))\\s*\\)?`,
  'i',
);

/** An email, a link or a phone number, written without spaces (so "B.Com" inside a sentence is not one). */
const isContact = (p) =>
  (!/\s/.test(p) && (/^[^@]+@[^@]+\.[a-z]{2,}$/i.test(p) || /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(p))) ||
  /^\+?[\d\s()-]{8,}$/.test(p);

/** Splits "Git, AWS (EC2, S3); Docker" on , ; | but not inside brackets. */
function splitOutsideParens(text) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth = Math.max(0, depth - 1);
    if (!depth && /[,;|]/.test(ch)) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const SKILL_TITLE_RE = /skill|tool|stack|technolog|languages/i;
const SUMMARY_TITLE_RE = /^(summary|objective|profile|about( me)?)$/i;

export function isHeading(line) {
  const clean = line.trim().replace(/:\s*$/, '');
  if (!clean || BULLET_RE.test(line) || clean.length > 42) return false;
  if (KNOWN_HEADING_RE.test(clean)) return true;
  const letters = clean.replace(/[^A-Za-z]/g, '');
  return letters.length >= 3 && clean === clean.toUpperCase() && /^[A-Z][A-Z &/,-]+$/.test(clean);
}

const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s/&-])([a-z])/g, (m, sep, c) => sep + c.toUpperCase())
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bOf\b/g, 'of');

/** Pulls the first date range out of a line: { text, date }. */
export function splitDate(line) {
  const m = line.match(DATE_RE);
  if (!m) return { text: line.trim(), date: '' };
  const text = (line.slice(0, m.index) + line.slice(m.index + m[0].length))
    .replace(/\s*[,|·-]\s*$/, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,|])/g, '$1')
    .trim();
  return { text, date: m[1].replace(/\s*(-|–|—|to)\s*/i, ' – ').trim() };
}

/**
 * Parses resume text.
 * Returns { name, headline, contact: string[], sections: [{ title, kind, entries, items, text }] }
 *  - kind 'skills': items = [{ group, values: string[] }]
 *  - kind 'text': text = paragraph string
 *  - kind 'entries': entries = [{ title, subtitle, date, bullets: string[] }]
 *  - kind 'list': items = string[] (bullets with no titles)
 */
export function parseResume(text) {
  const lines = String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''));
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const name = (lines[i] ?? '').trim();
  i++;

  const contact = [];
  const headlineParts = [];
  for (; i < lines.length && !isHeading(lines[i]); i++) {
    const l = lines[i].trim();
    if (!l) continue;
    for (const p of l.split(/\s*[|•·]\s*/).filter(Boolean)) (isContact(p) ? contact : headlineParts).push(p);
  }

  const sections = [];
  let current = null;
  for (; i < lines.length; i++) {
    const raw = lines[i];
    const l = raw.trim();
    if (!l) continue;
    if (isHeading(raw)) {
      const title = l.replace(/:\s*$/, '');
      current = { title: title === title.toUpperCase() ? titleCase(title) : title, lines: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { title: 'Details', lines: [] };
      sections.push(current);
    }
    current.lines.push(raw);
  }

  for (const s of sections) {
    const bulletLines = s.lines.filter((l) => BULLET_RE.test(l));
    if (SKILL_TITLE_RE.test(s.title) && bulletLines.length < s.lines.length / 2) {
      s.kind = 'skills';
      s.items = s.lines.map((l) => {
        const clean = l.replace(BULLET_RE, '').trim();
        const m = clean.match(/^([^:]{2,30}):\s*(.+)$/);
        const values = splitOutsideParens(m ? m[2] : clean);
        return { group: m ? m[1].trim() : '', values };
      });
    } else if (SUMMARY_TITLE_RE.test(s.title) && !bulletLines.length) {
      s.kind = 'text';
      s.text = s.lines.map((l) => l.trim()).join(' ');
    } else if (bulletLines.length === s.lines.length) {
      s.kind = 'list';
      s.items = s.lines.map((l) => l.replace(BULLET_RE, '').trim());
    } else {
      s.kind = 'entries';
      s.entries = [];
      let entry = null;
      for (const l of s.lines) {
        if (BULLET_RE.test(l)) {
          if (!entry) {
            entry = { title: '', subtitle: '', date: '', bullets: [] };
            s.entries.push(entry);
          }
          entry.bullets.push(l.replace(BULLET_RE, '').trim());
        } else {
          const { text: t, date } = splitDate(l.trim());
          if (!entry || entry.bullets.length || entry.subtitle) {
            entry = { title: t, subtitle: '', date, bullets: [] };
            s.entries.push(entry);
          } else if (!entry.title) {
            entry.title = t;
            entry.date ||= date;
          } else {
            entry.subtitle = t;
            entry.date ||= date;
          }
        }
      }
    }
    delete s.lines;
  }

  return { name, headline: headlineParts.join(' · '), contact, sections };
}
