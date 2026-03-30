export function renderBadgeToCanvas(canvas, templateImg, name, cfg) {
  if (!canvas || !templateImg) return;
  const ctx = canvas.getContext("2d");
  const W = templateImg.naturalWidth || templateImg.width;
  const H = templateImg.naturalHeight || templateImg.height;
  canvas.width = W;
  canvas.height = H;

  ctx.drawImage(templateImg, 0, 0, W, H);

  const fontStr = `${cfg.font_style === "italic" ? "italic " : ""}${
    cfg.font_weight === "bold" ? "bold " : ""
  }${cfg.font_size}px "${cfg.font_family}", Arial, sans-serif`;
  ctx.font = fontStr;
  ctx.textBaseline = "top";

  const text = name || "Sample Name";
  const metrics = ctx.measureText(text);
  const tw = metrics.width;
  const th = cfg.font_size * 1.2;

  let x = cfg.text_x;
  if (cfg.text_align === "center") x = cfg.text_x - tw / 2;
  else if (cfg.text_align === "right") x = cfg.text_x - tw;
  const y = cfg.text_y;

  if (cfg.text_rotation !== 0) {
    ctx.save();
    ctx.translate(cfg.text_x, cfg.text_y + th / 2);
    ctx.rotate((cfg.text_rotation * Math.PI) / 180);
    ctx.translate(-cfg.text_x, -(cfg.text_y + th / 2));
  }

  if (cfg.text_shadow) {
    ctx.save();
    ctx.shadowColor = cfg.shadow_color;
    ctx.shadowOffsetX = cfg.shadow_offset_x;
    ctx.shadowOffsetY = cfg.shadow_offset_y;
    ctx.shadowBlur = cfg.shadow_blur * 2;
    ctx.fillStyle = cfg.font_color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  if (cfg.text_outline) {
    ctx.strokeStyle = cfg.outline_color;
    ctx.lineWidth = cfg.outline_width * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
  }

  ctx.fillStyle = cfg.font_color;
  ctx.fillText(text, x, y);

  if (cfg.text_underline) {
    ctx.fillStyle = cfg.font_color;
    ctx.fillRect(x, y + th + 2, tw, Math.max(1, cfg.font_size / 20));
  }

  if (cfg.text_strikethrough) {
    ctx.fillStyle = cfg.font_color;
    ctx.fillRect(x, y + th / 2, tw, Math.max(1, cfg.font_size / 20));
  }

  if (cfg.text_rotation !== 0) ctx.restore();
}

export function canvasToDataURL(canvas) {
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function parseNamesFile(file) {
  const txt = await file.text();
  if (file.name.endsWith(".txt")) {
    return txt
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
  }
  if (file.name.endsWith(".csv")) {
    const lines = txt.split("\n").filter(Boolean);
    const parse = (l) =>
      l.split(",")[0].replace(/^"|"$/g, "").trim();
    let arr = lines.map(parse).filter(Boolean);
    if (
      arr[0] &&
      arr[0].toLowerCase().includes("name") &&
      !/[\u0600-\u06FF]/.test(arr[0])
    )
      arr = arr.slice(1);
    return arr;
  }
  return [];
}
