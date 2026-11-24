// Draws each gallery item as a "print": a tinted gouache-style sheet with the document on top.
// Canvases double as WebGL textures and as <img> sources in the DOM, so there is no image download.

export const PRINT_W = 567;
export const PRINT_H = 763;

const INK = '#3A3550';
const SERIF = '"Newsreader Variable", Newsreader, Georgia, serif';
const MONO = '"DM Mono", ui-monospace, monospace';
const DISPLAY = '"Oswald Variable", Oswald, "Arial Narrow", sans-serif';

function stripes(ctx, w, h, color) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = color;
  for (let x = -h; x < w; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + 18, h);
    ctx.lineTo(x + h + 18, 0);
    ctx.lineTo(x + h, 0);
    ctx.fill();
  }
  ctx.restore();
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Renders one item at 2x for crisp text; returns a canvas of PRINT_W*2 x PRINT_H*2. */
export function drawPrint(item) {
  const s = 2;
  const canvas = document.createElement('canvas');
  canvas.width = PRINT_W * s;
  canvas.height = PRINT_H * s;
  const ctx = canvas.getContext('2d');
  ctx.scale(s, s);

  // Background: flat tint with soft diagonal stripes, like the gouache prints.
  ctx.fillStyle = item.tint;
  ctx.fillRect(0, 0, PRINT_W, PRINT_H);
  stripes(ctx, PRINT_W, PRINT_H, '#FFFFFF');

  // Paper sheet, slightly rotated, with a soft shadow.
  const px = 62;
  const py = 70;
  const pw = PRINT_W - px * 2;
  const ph = PRINT_H - py * 2 + 10;
  ctx.save();
  ctx.translate(PRINT_W / 2, PRINT_H / 2);
  ctx.rotate(item.kind === 'posting' ? 0.018 : -0.014);
  ctx.translate(-PRINT_W / 2, -PRINT_H / 2);
  ctx.shadowColor = 'rgba(58,53,80,0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(px, py, pw, ph);
  ctx.shadowColor = 'transparent';

  const left = px + 30;
  const width = pw - 60;
  let y = py + 56;
  const lines = item.text.split('\n');

  if (item.kind === 'posting') {
    ctx.fillStyle = INK;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('JOB POSTING', left, y - 16);
    ctx.font = `600 34px ${DISPLAY}`;
    for (const l of wrap(ctx, item.title.toUpperCase(), width).slice(0, 2)) {
      ctx.fillText(l, left, y + 22);
      y += 36;
    }
    y += 22;
  } else {
    ctx.fillStyle = INK;
    ctx.font = `600 34px ${DISPLAY}`;
    ctx.fillText((lines[0] || '').toUpperCase(), left, y);
    ctx.font = `italic 400 15px ${SERIF}`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(wrap(ctx, lines[1] || '', width)[0] || '', left, y + 26);
    ctx.globalAlpha = 1;
    y += 58;
  }

  ctx.strokeStyle = 'rgba(58,53,80,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, y - 10);
  ctx.lineTo(left + width, y - 10);
  ctx.stroke();

  const body = item.kind === 'posting' ? lines.slice(1) : lines.slice(2);
  for (const raw of body) {
    if (y > py + ph - 40) break;
    const line = raw.trim();
    if (!line) {
      y += 10;
      continue;
    }
    const heading = /^[A-Z][A-Z &]{3,}$/.test(line) || /:$/.test(line);
    if (heading) {
      y += 8;
      ctx.fillStyle = INK;
      ctx.font = `500 12px ${MONO}`;
      ctx.fillText(line.replace(/:$/, '').toUpperCase(), left, y);
      y += 20;
      continue;
    }
    ctx.fillStyle = 'rgba(58,53,80,0.82)';
    ctx.font = `400 13.5px ${SERIF}`;
    const bullet = /^[-•]/.test(line);
    const textLines = wrap(ctx, line.replace(/^[-•]\s*/, ''), width - (bullet ? 14 : 0));
    for (const [i, t] of textLines.entries()) {
      if (y > py + ph - 40) break;
      if (bullet && i === 0) ctx.fillText('•', left, y);
      ctx.fillText(t, left + (bullet ? 14 : 0), y);
      y += 19;
    }
  }

  if (item.kind === 'blank') {
    ctx.strokeStyle = 'rgba(58,53,80,0.4)';
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(px + 18, py + 18, pw - 36, ph - 36);
  }
  ctx.restore();
  return canvas;
}

/** Wall label: name (serif 500), subtitle (serif italic), meta (mono). Transparent 640 x 260. */
export function drawLabel(item) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = INK;
  ctx.font = `500 58px ${SERIF}`;
  ctx.fillText(item.title, 30, 82, 590);
  ctx.font = `italic 400 46px ${SERIF}`;
  ctx.fillText(item.subtitle, 30, 150, 590);
  ctx.globalAlpha = 0.7;
  ctx.font = `400 30px ${MONO}`;
  ctx.fillText(item.meta.toUpperCase(), 30, 215, 590);
  return canvas;
}

const cache = new Map();
/** Cached data URL of an item's print, for <img> use in the DOM. */
export function printUrl(item) {
  if (!cache.has(item.key)) cache.set(item.key, drawPrint(item).toDataURL('image/webp', 0.86));
  return cache.get(item.key);
}
