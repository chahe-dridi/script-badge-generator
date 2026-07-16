// ── Text transform ───────────────────────────────────────────────────────────

function applyTextTransform(text, transform) {
  switch (transform) {
    case 'uppercase': return text.toUpperCase();
    case 'lowercase': return text.toLowerCase();
    case 'titlecase':
      return text.replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
    default: return text;
  }
}

// ── Text wrapping ─────────────────────────────────────────────────────────────

function wrapLines(ctx, text, maxWidth) {
  if (!maxWidth || maxWidth <= 0) return [text];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

// ── Main renderer ─────────────────────────────────────────────────────────────

export function renderBadgeToCanvas(canvas, templateImg, name, cfg) {
  if (!canvas || !templateImg) return;
  const ctx = canvas.getContext('2d');
  const W = templateImg.naturalWidth || templateImg.width;
  const H = templateImg.naturalHeight || templateImg.height;
  canvas.width = W;
  canvas.height = H;

  ctx.drawImage(templateImg, 0, 0, W, H);

  const fontStr = `${cfg.font_style === 'italic' ? 'italic ' : ''}${
    cfg.font_weight === 'bold' ? 'bold ' : ''
  }${cfg.font_size}px "${cfg.font_family}", Arial, sans-serif`;
  ctx.font = fontStr;
  ctx.textBaseline = 'top';

  // Letter spacing (supported Chrome 94+, Safari 17.2+, Firefox 116+)
  const ls = cfg.letter_spacing || 0;
  if (ls > 0) ctx.letterSpacing = `${ls}px`;

  // Apply text transform then wrap into lines
  const raw = name || 'Sample Name';
  const transformed = applyTextTransform(raw, cfg.text_transform || 'none');
  const wrapMax = cfg.text_wrap ? (cfg.text_wrap_width || W) : 0;
  const lines = wrapLines(ctx, transformed, wrapMax);
  const lineH = cfg.font_size * 1.25;

  // Measure each line's width so we can align and size the background correctly
  const lineTWs = lines.map(l => ctx.measureText(l).width);
  const totalW = Math.max(...lineTWs);
  const totalH = lineH * lines.length;

  // X anchor for background (left edge of the text block)
  const bgX =
    cfg.text_align === 'center' ? cfg.text_x - totalW / 2
    : cfg.text_align === 'right' ? cfg.text_x - totalW
    : cfg.text_x;
  const bgY = cfg.text_y;

  // Per-line x given its own width
  function lineX(lw) {
    if (cfg.text_align === 'center') return cfg.text_x - lw / 2;
    if (cfg.text_align === 'right') return cfg.text_x - lw;
    return cfg.text_x;
  }

  // ── Rotation transform ──
  if (cfg.text_rotation !== 0) {
    ctx.save();
    const cx = cfg.text_x;
    const cy = bgY + totalH / 2;
    ctx.translate(cx, cy);
    ctx.rotate((cfg.text_rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // ── Text background box ──
  if (cfg.text_bg) {
    const pad = cfg.text_bg_padding ?? 8;
    ctx.save();
    ctx.globalAlpha = cfg.text_bg_opacity ?? 0.5;
    ctx.fillStyle = cfg.text_bg_color ?? '#000000';
    ctx.fillRect(bgX - pad, bgY - pad, totalW + pad * 2, totalH + pad * 2);
    ctx.restore();
  }

  // ── Draw each line ──
  lines.forEach((line, i) => {
    const lw = lineTWs[i];
    const x = lineX(lw);
    const y = bgY + i * lineH;

    if (cfg.text_shadow) {
      ctx.save();
      ctx.shadowColor = cfg.shadow_color;
      ctx.shadowOffsetX = cfg.shadow_offset_x;
      ctx.shadowOffsetY = cfg.shadow_offset_y;
      ctx.shadowBlur = cfg.shadow_blur * 2;
      ctx.fillStyle = cfg.font_color;
      ctx.fillText(line, x, y);
      ctx.restore();
    }

    if (cfg.text_outline) {
      ctx.strokeStyle = cfg.outline_color;
      ctx.lineWidth = cfg.outline_width * 2;
      ctx.lineJoin = 'round';
      ctx.strokeText(line, x, y);
    }

    ctx.fillStyle = cfg.font_color;
    ctx.fillText(line, x, y);

    const lh = cfg.font_size * 1.2;
    if (cfg.text_underline) {
      ctx.fillStyle = cfg.font_color;
      ctx.fillRect(x, y + lh + 2, lw, Math.max(1, cfg.font_size / 20));
    }
    if (cfg.text_strikethrough) {
      ctx.fillStyle = cfg.font_color;
      ctx.fillRect(x, y + lh / 2, lw, Math.max(1, cfg.font_size / 20));
    }
  });

  if (cfg.text_rotation !== 0) ctx.restore();

  // Reset letter spacing
  if (ls > 0) ctx.letterSpacing = '0px';
}

export function canvasToDataURL(canvas) {
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// ── Name file parser ──────────────────────────────────────────────────────────

// Known header strings to skip (multi-language)
const HEADER_KEYWORDS = ['name', 'full_name', 'fullname', 'attendee', 'participant', 'nom', 'nombre', 'اسم'];

function isHeader(value) {
  const v = value.trim().toLowerCase();
  return HEADER_KEYWORDS.some(k => v === k || v.includes(k));
}

// RFC 4180-compliant CSV line parser — handles quoted fields with commas inside
function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

export async function parseNamesFile(file) {
  // utf-8-sig decoding: strip BOM if present
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  // Strip UTF-8 BOM (EF BB BF)
  const hasBOM = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
  const txt = new TextDecoder('utf-8').decode(hasBOM ? bytes.slice(3) : bytes);

  const normalize = s => s.replace(/\t/g, ' ').replace(/\s{2,}/g, ' ').trim();

  if (file.name.toLowerCase().endsWith('.txt')) {
    return txt
      .split('\n')
      .map(n => normalize(n))
      .filter(Boolean);
  }

  if (file.name.toLowerCase().endsWith('.csv')) {
    const rawLines = txt.split('\n').filter(l => l.trim());
    const parsed = rawLines.map(l => {
      const fields = parseCSVLine(l);
      return normalize(fields[0] || '');
    }).filter(Boolean);
    // Skip header if first row looks like a column label
    if (parsed.length > 0 && isHeader(parsed[0])) return parsed.slice(1);
    return parsed;
  }

  // Excel: return empty — server handles this format
  return [];
}
