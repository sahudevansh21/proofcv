import { Fragment } from 'react';

/**
 * HTML approximation of each LaTeX template, drawn at A4 width (794px) so thumbnails and the
 * large preview match the PDF the .tex file compiles to. Text is shown exactly as parsed.
 */
export const PAGE_W = 794;
export const PAGE_H = 1123;

function Ph({ text }) {
  return String(text ?? '')
    .split(/(\[[^\]\n]{1,40}\])/)
    .map((part, i) =>
      /^\[[^\]]+\]$/.test(part) ? (
        <b key={i} style={{ color: '#d00' }}>
          {part}
        </b>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

const sideKinds = new Set(['skills', 'list']);

function Bullets({ items, marker = '•', color, gap = 2 }) {
  if (!items?.length) return null;
  return (
    <ul style={{ margin: '3px 0 0', padding: 0, listStyle: 'none' }}>
      {items.map((b, i) => (
        <li key={i} style={{ display: 'flex', gap: 7, marginTop: i ? gap : 0 }}>
          <span style={{ color, flex: 'none' }}>{marker}</span>
          <span>
            <Ph text={b} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function SkillsText({ s, groupStyle }) {
  return s.items.map((g, i) => (
    <div key={i}>
      {g.group && <b style={groupStyle}>{g.group}: </b>}
      <Ph text={g.values.join(', ')} />
    </div>
  ));
}

function Body({ s, renderEntry, listMarker, listColor }) {
  if (s.kind === 'skills') return <SkillsText s={s} />;
  if (s.kind === 'text') return <p style={{ margin: 0 }}><Ph text={s.text} /></p>;
  if (s.kind === 'list') return <Bullets items={s.items} marker={listMarker} color={listColor} />;
  return s.entries.map((e, i) => <div key={i} style={{ marginTop: i ? 7 : 0 }}>{renderEntry(e)}</div>);
}

const spaced = (em) => ({ letterSpacing: `${em}em`, textTransform: 'uppercase' });

function Classic({ m }) {
  const entry = (e) => (
    <>
      {(e.title || e.date) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <b><Ph text={e.title} /></b>
          <span>{e.date}</span>
        </div>
      )}
      {e.subtitle && <i><Ph text={e.subtitle} /></i>}
      <Bullets items={e.bullets} />
    </>
  );
  return (
    <div style={{ padding: '68px 68px', fontFamily: '"Charter","Bitstream Charter",Georgia,serif', fontSize: 14.6, lineHeight: 1.35, color: '#111' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 34, fontVariant: 'small-caps' }}>{m.name}</div>
        {m.headline && <div style={{ fontSize: 17 }}>{m.headline}</div>}
        <div style={{ marginTop: 3 }}>{m.contact.join('  |  ')}</div>
      </div>
      {m.sections.map((s, i) => (
        <section key={i} style={{ marginTop: 13 }}>
          <div style={{ fontSize: 17, fontVariant: 'small-caps', borderBottom: '1px solid #111', marginBottom: 6 }}>{s.title}</div>
          <Body s={s} renderEntry={entry} />
        </section>
      ))}
    </div>
  );
}

function Compact({ m }) {
  const entry = (e) => (
    <>
      {(e.title || e.date) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <b><Ph text={e.title} /></b>
          <span style={{ fontSize: 12 }}>{e.date}</span>
        </div>
      )}
      {e.subtitle && <i style={{ fontSize: 12 }}><Ph text={e.subtitle} /></i>}
      <Bullets items={e.bullets} gap={0} />
    </>
  );
  return (
    <div style={{ padding: '49px 49px', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 13.3, lineHeight: 1.32, color: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{m.name}</div>
          {m.headline && <div style={{ color: '#1F4E9A', fontVariant: 'small-caps' }}>{m.headline}</div>}
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <div>{m.contact.slice(0, 2).join(' | ')}</div>
          <div>{m.contact.slice(2).join(' | ')}</div>
        </div>
      </div>
      {m.sections.map((s, i) => (
        <section key={i} style={{ marginTop: 10 }}>
          <div style={{ color: '#1F4E9A', fontVariant: 'small-caps', fontSize: 16, borderBottom: '1px solid #888', marginBottom: 4 }}>{s.title}</div>
          {s.kind === 'skills' ? (
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {s.items.map((g, j) => (
                  <tr key={j}>
                    <td style={{ fontWeight: 700, paddingRight: 8, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{g.group || s.title}</td>
                    <td style={{ verticalAlign: 'top' }}>: <Ph text={g.values.join(', ')} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Body s={s} renderEntry={entry} />
          )}
        </section>
      ))}
    </div>
  );
}

function Sidebar({ m }) {
  const side = m.sections.filter((s) => sideKinds.has(s.kind));
  const main = m.sections.filter((s) => !sideKinds.has(s.kind));
  const sideHead = (t) => (
    <div style={{ fontSize: 17, marginTop: 14, borderBottom: '1px solid rgba(255,255,255,.45)', marginBottom: 4 }}>{t}</div>
  );
  const entry = (e) => (
    <>
      {e.title && <b><Ph text={e.title} /></b>}
      {(e.subtitle || e.date) && <div style={{ color: '#5B6475', fontSize: 12 }}>{[e.subtitle, e.date].filter(Boolean).join(' | ')}</div>}
      <Bullets items={e.bullets} />
    </>
  );
  return (
    <div style={{ display: 'flex', minHeight: PAGE_H, fontFamily: '"Source Sans 3","Source Sans Pro","Segoe UI",sans-serif', fontSize: 13.3, lineHeight: 1.35 }}>
      <aside style={{ width: 258, flex: 'none', background: '#0B1B3A', color: '#fff', padding: '42px 28px 42px 42px' }}>
        {sideHead('Personal info')}
        {m.contact.map((c, i) => (
          <div key={i} style={{ wordBreak: 'break-word' }}>{c}</div>
        ))}
        {side.map((s, i) => (
          <Fragment key={i}>
            {sideHead(s.title)}
            {s.kind === 'skills'
              ? s.items.map((g, j) => (
                  <div key={j} style={{ marginTop: j ? 4 : 0 }}>
                    {g.group && <b>{g.group}</b>}
                    {g.values.map((v, k) => (
                      <div key={k}>◦&nbsp; <Ph text={v} /></div>
                    ))}
                  </div>
                ))
              : s.items.map((v, k) => (
                  <div key={k} style={{ marginTop: 2 }}>◦&nbsp; <Ph text={v} /></div>
                ))}
          </Fragment>
        ))}
      </aside>
      <main style={{ flex: 1, padding: '42px 53px 42px 28px', color: '#111' }}>
        <div style={{ fontSize: 35, lineHeight: 1.1 }}>{m.name}</div>
        {m.headline && <div style={{ fontSize: 17, color: '#5B6475' }}>{m.headline}</div>}
        {main.map((s, i) => (
          <section key={i}>
            <div style={{ fontSize: 17, marginTop: 14, borderBottom: '1px solid #0B1B3A', marginBottom: 5 }}>{s.title}</div>
            <Body s={s} renderEntry={entry} />
          </section>
        ))}
      </main>
    </div>
  );
}

function Accent({ m }) {
  const side = m.sections.filter((s) => sideKinds.has(s.kind));
  const main = m.sections.filter((s) => !sideKinds.has(s.kind));
  const head = (t) => (
    <div style={{ fontSize: 19, fontWeight: 700, textTransform: 'uppercase', color: '#1F1B2E', borderBottom: '2px solid #C98A93', margin: '12px 0 5px' }}>
      {t}
    </div>
  );
  const entry = (e) => (
    <>
      {e.title && <div style={{ fontSize: 16 }}><Ph text={e.title} /></div>}
      {e.subtitle && <div style={{ color: '#8F1D2C', fontWeight: 700 }}><Ph text={e.subtitle} /></div>}
      {e.date && <div style={{ color: '#6B6B76', fontSize: 12 }}>{e.date}</div>}
      <Bullets items={e.bullets} color="#8F1D2C" />
    </>
  );
  return (
    <div style={{ padding: '53px', fontFamily: 'Lato, "Helvetica Neue", Arial, sans-serif', fontSize: 13.3, lineHeight: 1.35, color: '#111' }}>
      <div style={{ fontSize: 37, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.05 }}>{m.name}</div>
      {m.headline && <div style={{ color: '#8F1D2C', fontSize: 17 }}>{m.headline}</div>}
      <div style={{ fontSize: 12, display: 'flex', gap: 14, flexWrap: 'wrap' }}>{m.contact.map((c, i) => <span key={i}>{c}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '62fr 38fr', gap: 34 }}>
        <div>
          {main.map((s, i) => (
            <section key={i}>
              {head(s.title)}
              <Body s={s} renderEntry={entry} />
            </section>
          ))}
        </div>
        <div>
          {side.map((s, i) => (
            <section key={i}>
              {head(s.title)}
              {s.kind === 'skills' ? (
                s.items.map((g, j) => (
                  <div key={j} style={{ marginTop: j ? 5 : 0 }}>
                    {g.group && <div style={{ fontWeight: 700 }}>{g.group}</div>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {g.values.map((v, k) => (
                        <span key={k} style={{ border: '1px solid #bbb', padding: '1px 5px', fontSize: 12.5 }}><Ph text={v} /></span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <Bullets items={s.items} color="#8F1D2C" />
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Margin({ m }) {
  const label = (t) => (
    <div style={{ width: 136, flex: 'none', textAlign: 'right', fontWeight: 700, fontSize: 12, ...spaced(0.12), paddingTop: 2 }}>{t}</div>
  );
  const entry = (e) => (
    <>
      {(e.title || e.date) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <b style={{ textTransform: 'uppercase' }}><Ph text={e.title} /></b>
          <span style={{ color: '#6E7FA3' }}>{e.date}</span>
        </div>
      )}
      {e.subtitle && <i style={{ color: '#6E7FA3' }}><Ph text={e.subtitle} /></i>}
      <Bullets items={e.bullets} color="#7A7A84" />
    </>
  );
  const row = (title, children, key) => (
    <div key={key} style={{ display: 'flex', gap: 23, marginTop: 14 }}>
      {label(title)}
      <div style={{ flex: 1, borderTop: '1px solid #555', paddingTop: 6 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ padding: '76px 68px 68px 38px', fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 300, fontSize: 13.3, lineHeight: 1.38, color: '#111' }}>
      <div style={{ marginLeft: 159 }}>
        <div style={{ borderLeft: '1px solid #111', height: 22 }} />
        <div style={{ fontSize: 24, ...spaced(0.22) }}>{m.name}</div>
        {m.headline && <div style={{ ...spaced(0.08) }}>{m.headline}</div>}
        <div style={{ borderLeft: '1px solid #111', height: 22 }} />
      </div>
      {m.contact.length > 0 &&
        row(
          'Contact info',
          m.contact.map((c, i) => (
            <div key={i} style={{ display: 'flex' }}>
              <b style={{ width: 84, fontWeight: 600 }}>
                {/@/.test(c) ? 'E-mail' : /^\+?[\d\s()-]{8,}$/.test(c) ? 'Phone' : /linkedin/i.test(c) ? 'LinkedIn' : /github/i.test(c) ? 'GitHub' : 'Web'}
              </b>
              <span style={{ color: '#7A7A84' }}>{c}</span>
            </div>
          )),
          'contact',
        )}
      {m.sections.map((s, i) => row(s.title, <Body s={s} renderEntry={entry} listColor="#7A7A84" />, i))}
    </div>
  );
}

function Timeline({ m }) {
  const row = (date, children, key) => (
    <div key={key} style={{ display: 'flex', marginTop: 5 }}>
      <div style={{ width: 110, flex: 'none', color: '#5F5F66', fontSize: 11.5, paddingTop: 2 }}>{date}</div>
      <span style={{ width: 6, height: 6, background: '#8A1538', margin: '6px 12px 0 8px', flex: 'none' }} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ padding: '64px', fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', fontSize: 13.3, lineHeight: 1.35, color: '#111' }}>
      <div style={{ fontSize: 32 }}>{m.name}</div>
      {m.headline && <i style={{ fontSize: 17 }}>{m.headline}</i>}
      <div style={{ fontSize: 12, color: '#5F5F66' }}>{m.contact.join('  •  ')}</div>
      {m.sections.map((s, i) => (
        <section key={i}>
          <div style={{ color: '#8A1538', fontSize: 19, borderBottom: '1px solid #D9AFBD', margin: '12px 0 4px' }}>{s.title}</div>
          {s.kind === 'skills'
            ? s.items.map((g, j) => row(g.group, <Ph text={g.values.join(', ')} />, j))
            : s.kind === 'text'
              ? row('', <Ph text={s.text} />, 't')
              : s.kind === 'list'
                ? s.items.map((t, j) => row('', <Ph text={t} />, j))
                : s.entries.map((e, j) =>
                    row(
                      e.date,
                      <>
                        {e.title && <b><Ph text={e.title} /></b>}
                        {e.subtitle && <div><i><Ph text={e.subtitle} /></i></div>}
                        <Bullets items={e.bullets} gap={0} />
                      </>,
                      j,
                    ),
                  )}
        </section>
      ))}
    </div>
  );
}

const LAYOUTS = { classic: Classic, compact: Compact, sidebar: Sidebar, accent: Accent, margin: Margin, timeline: Timeline };

/** An A4 page in the chosen template. `scale` shrinks it for thumbnails. */
export function TemplatePreview({ templateId, model, scale = 1, className = '' }) {
  const Layout = LAYOUTS[templateId] ?? Classic;
  return (
    <div
      className={`overflow-hidden bg-white ${className}`}
      style={scale < 1 ? { width: PAGE_W * scale, height: PAGE_H * scale } : { width: PAGE_W, minHeight: PAGE_H }}
    >
      <div
        style={{ width: PAGE_W, minHeight: PAGE_H, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' }}
        aria-hidden={scale < 1 || undefined}
      >
        <Layout m={model} />
      </div>
    </div>
  );
}
