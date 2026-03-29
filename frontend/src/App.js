import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const FONTS = [
  "Arial","Times New Roman","Georgia","Verdana","Tahoma",
  "Trebuchet MS","Impact","Courier New","Segoe UI","Calibri",
  "Traditional Arabic","Arabic Typesetting","Simplified Arabic",
];

const INIT = {
  event_name:"",font_family:"Arial",font_size:48,
  font_style:"normal",font_weight:"normal",font_color:"#1a1a2e",
  text_x:400,text_y:300,text_align:"center",
  text_shadow:false,shadow_color:"#333333",shadow_offset_x:3,shadow_offset_y:3,shadow_blur:2,
  text_outline:false,outline_color:"#ffffff",outline_width:2,
  text_underline:false,text_strikethrough:false,text_rotation:0,arabic_support:true,
};

// ─── Canvas-based instant preview ─────────────────────────────────────────
// Renders text directly in browser — zero network calls, truly instant
function renderBadgeToCanvas(canvas, templateImg, name, cfg) {
  if (!canvas || !templateImg) return;
  const ctx = canvas.getContext("2d");
  const W = templateImg.naturalWidth || templateImg.width;
  const H = templateImg.naturalHeight || templateImg.height;
  canvas.width = W;
  canvas.height = H;

  // Draw template
  ctx.drawImage(templateImg, 0, 0, W, H);

  // Font string
  const fontStr = `${cfg.font_style === "italic" ? "italic " : ""}${cfg.font_weight === "bold" ? "bold " : ""}${cfg.font_size}px "${cfg.font_family}", Arial, sans-serif`;
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

  // Rotation
  if (cfg.text_rotation !== 0) {
    ctx.save();
    ctx.translate(cfg.text_x, cfg.text_y + th / 2);
    ctx.rotate((cfg.text_rotation * Math.PI) / 180);
    ctx.translate(-cfg.text_x, -(cfg.text_y + th / 2));
  }

  // Shadow
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

  // Outline
  if (cfg.text_outline) {
    ctx.strokeStyle = cfg.outline_color;
    ctx.lineWidth = cfg.outline_width * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
  }

  // Main text
  ctx.fillStyle = cfg.font_color;
  ctx.fillText(text, x, y);

  // Underline
  if (cfg.text_underline) {
    ctx.fillStyle = cfg.font_color;
    ctx.fillRect(x, y + th + 2, tw, Math.max(1, cfg.font_size / 20));
  }
  // Strikethrough
  if (cfg.text_strikethrough) {
    ctx.fillStyle = cfg.font_color;
    ctx.fillRect(x, y + th / 2, tw, Math.max(1, cfg.font_size / 20));
  }

  if (cfg.text_rotation !== 0) ctx.restore();
}

// Get canvas data URL
function canvasToDataURL(canvas) {
  try { return canvas.toDataURL("image/png"); } catch { return null; }
}

// ─── Helper: parse names ────────────────────────────────────────────────────
async function parseNamesFile(file) {
  const txt = await file.text();
  if (file.name.endsWith(".txt")) {
    return txt.split("\n").map(n => n.trim()).filter(Boolean);
  }
  if (file.name.endsWith(".csv")) {
    const lines = txt.split("\n").filter(Boolean);
    const parse = l => l.split(",")[0].replace(/^"|"$/g, "").trim();
    let arr = lines.map(parse).filter(Boolean);
    if (arr[0] && arr[0].toLowerCase().includes("name") && !/[\u0600-\u06FF]/.test(arr[0])) arr = arr.slice(1);
    return arr;
  }
  return []; // excel needs server
}

function cls(...a) { return a.filter(Boolean).join(" "); }

// ─── UI atoms ──────────────────────────────────────────────────────────────
function Knob({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div className="knob">
      <div className="knob-row">
        <span className="knob-label">{label}</span>
        <div className="knob-right">
          <input className="knob-num" type="number" value={value} min={min} max={max} step={step}
            onChange={e => onChange(+e.target.value)} />
          {unit && <span className="knob-unit">{unit}</span>}
        </div>
      </div>
      <input className="knob-range" type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} />
    </div>
  );
}

function Sw({ label, sub, on, onChange }) {
  return (
    <div className="sw" onClick={() => onChange(!on)}>
      <div><div className="sw-label">{label}</div>{sub && <div className="sw-sub">{sub}</div>}</div>
      <div className={cls("sw-track", on && "sw-on")}><div className="sw-thumb" /></div>
    </div>
  );
}

function Steps({ step, onClick }) {
  const labels = ["Setup", "Design", "Gallery", "Export"];
  return (
    <div className="steps">
      {labels.map((l, i) => (
        <React.Fragment key={l}>
          <button className={cls("step", i < step && "step-done", i === step && "step-active")}
            onClick={() => i < step && onClick(i)}>
            <div className="step-num">{i < step ? "✓" : i + 1}</div>
            <span className="step-lbl">{l}</span>
          </button>
          {i < labels.length - 1 && <div className={cls("step-line", i < step && "step-line-done")} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Toast({ msg, type }) {
  return <div className={cls("toast", "toast-" + type)}>{msg}</div>;
}

// ─── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(0);
  const [cfg, setCfg] = useState(INIT);
  const [templateFile, setTF] = useState(null);
  const [templateImg, setTImg] = useState(null); // HTMLImageElement
  const [namesFile, setNF] = useState(null);
  const [names, setNames] = useState([]);
  const [previewName, setPN] = useState("Sample Name");
  const [designTab, setDT] = useState("text");
  const [gallery, setGallery] = useState([]); // [{name, dataUrl, ok}]
  const [galLoading, setGL] = useState(false);
  const [galProgress, setGP] = useState(0);
  const [selIdx, setSel] = useState(null);
  const [editName, setEN] = useState("");
  const [zipLoading, setZL] = useState(false);
  const [zipProgress, setZP] = useState(0);
  const [zipDone, setZD] = useState(0);
  const [toast, setToast] = useState(null);
  const [dragOver, setDO] = useState(null);
  const [galFilter, setGF] = useState(""); // search in gallery
  const [regenSel, setRS] = useState(false); // regen selected loading

  const tRef = useRef(); const nRef = useRef();
  const previewCanvasRef = useRef();
  const abortRef = useRef();

  const s = useCallback((k, v) => setCfg(c => ({ ...c, [k]: v })), []);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── INSTANT canvas preview — fires on every render ──────────────────────
  useEffect(() => {
    if (!previewCanvasRef.current || !templateImg) return;
    renderBadgeToCanvas(previewCanvasRef.current, templateImg, previewName, cfg);
  }); // no dep array = every render = truly instant

  // ─── Load template image into HTMLImageElement ───────────────────────────
  const loadTemplate = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return notify("Upload an image file", "error");
    setTF(file);
    setGallery([]);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setTImg(img); };
    img.src = url;
    notify("Template loaded ✓", "success");
  }, [notify]);

  // ─── Load names ───────────────────────────────────────────────────────────
  const loadNames = useCallback(async (file) => {
    setNF(file);
    const arr = await parseNamesFile(file);
    setNames(arr);
    if (arr.length) notify(`${arr.length} names loaded ✓`, "success");
    else notify("File loaded — Excel names resolved at generation time", "info");
  }, [notify]);

  // ─── Drag & drop ──────────────────────────────────────────────────────────
  const onDrop = useCallback((e, type) => {
    e.preventDefault(); setDO(null);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (type === "tpl") loadTemplate(f);
    else loadNames(f);
  }, [loadTemplate, loadNames]);

  // ─── Build gallery using canvas (NO server calls!) ───────────────────────
  const buildGallery = useCallback(async () => {
    if (!templateImg) return notify("Upload a template first", "error");
    if (names.length === 0 && !namesFile) return notify("Upload a names file first", "error");
    if (names.length === 0) return notify("Could not parse names — use TXT or CSV", "error");

    setGL(true); setGP(0); setGallery([]); setPage(2); setSel(null);

    const canvas = document.createElement("canvas");
    const results = [];
    for (let i = 0; i < names.length; i++) {
      renderBadgeToCanvas(canvas, templateImg, names[i], cfg);
      const dataUrl = canvasToDataURL(canvas);
      results.push({ name: names[i], dataUrl, ok: !!dataUrl });
      if (i % 5 === 0) {
        setGallery([...results]);
        setGP(Math.round(((i + 1) / names.length) * 100));
        await new Promise(r => setTimeout(r, 0)); // yield to browser
      }
    }
    setGallery([...results]);
    setGP(100); setGL(false);
    notify(`${results.length} badges generated ✓`, "success");
  }, [templateImg, names, namesFile, cfg, notify]);

  // ─── Regen one (canvas, instant) ─────────────────────────────────────────
  const regenOne = useCallback((idx, newName) => {
    const name = newName ?? gallery[idx].name;
    setRS(true);
    const canvas = document.createElement("canvas");
    renderBadgeToCanvas(canvas, templateImg, name, cfg);
    const dataUrl = canvasToDataURL(canvas);
    setGallery(g => g.map((b, i) => i === idx ? { name, dataUrl, ok: !!dataUrl } : b));
    setRS(false);
    return dataUrl;
  }, [gallery, templateImg, cfg]);

  // ─── Regen all (canvas, fast batch) ──────────────────────────────────────
  const regenAll = useCallback(async () => {
    if (!templateImg || gallery.length === 0) return;
    setGL(true); setGP(0);
    const canvas = document.createElement("canvas");
    const updated = [];
    for (let i = 0; i < gallery.length; i++) {
      renderBadgeToCanvas(canvas, templateImg, gallery[i].name, cfg);
      updated.push({ ...gallery[i], dataUrl: canvasToDataURL(canvas), ok: true });
      if (i % 10 === 0) {
        setGallery([...updated, ...gallery.slice(i + 1)]);
        setGP(Math.round(((i + 1) / gallery.length) * 100));
        await new Promise(r => setTimeout(r, 0));
      }
    }
    setGallery(updated); setGL(false); setGP(100);
    notify("All badges updated ✓", "success");
  }, [gallery, templateImg, cfg, notify]);

  // ─── Download ZIP — two strategies ───────────────────────────────────────
  // If gallery exists: zip in browser (JSZip) — instant, no server wait
  // Else: server /generate endpoint
  const downloadZip = useCallback(async () => {
    if (!templateFile) return notify("Upload a template first", "error");
    if (!namesFile && names.length === 0) return notify("Upload a names file first", "error");
    if (!cfg.event_name.trim()) return notify("Enter an event name first", "error");

    setZL(true); setZP(0); setZD(0); setPage(3);

    if (gallery.length > 0) {
      // ── Client-side ZIP using pre-rendered canvas images ──────────────────
      try {
        // Lazy-load JSZip from CDN
        if (!window.JSZip) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const zip = new window.JSZip();
        const folder = zip.folder(cfg.event_name);
        const total = gallery.length;
        for (let i = 0; i < total; i++) {
          const b = gallery[i];
          if (!b.dataUrl) continue;
          // dataUrl → binary
          const base64 = b.dataUrl.split(",")[1];
          const safe = b.name.replace(/[^a-zA-Z0-9\u0600-\u06FF _-]/g, "").trim().replace(/\s+/g, "_") || `badge_${i + 1}`;
          folder.file(`${safe}_badge.png`, base64, { base64: true });
          setZD(i + 1);
          setZP(Math.round(((i + 1) / total) * 90));
          if (i % 20 === 0) await new Promise(r => setTimeout(r, 0));
        }
        setZP(95);
        const blob = await zip.generateAsync({ type: "blob" });
        setZP(100); setZD(total);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${cfg.event_name}_badges.zip`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        notify("ZIP downloaded! 🎉", "success");
      } catch (e) {
        notify("Client ZIP failed, trying server… " + e.message, "error");
      }
    } else {
      // ── Server fallback ────────────────────────────────────────────────────
      try {
        const total = names.length || 1;
        let simCount = 0;
        const sim = setInterval(() => {
          simCount = Math.min(simCount + Math.ceil(total * 0.04), total - 1);
          setZD(simCount);
          setZP(p => Math.min(p + 3, 80));
        }, 600);
        const fd = new FormData();
        fd.append("template", templateFile);
        fd.append("names_file", namesFile);
        fd.append("settings", JSON.stringify(cfg));
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 300000);
        const res = await fetch(API + "/generate", { method: "POST", body: fd, signal: ctrl.signal });
        clearInterval(sim); clearTimeout(t);
        if (!res.ok) throw new Error((await res.json()).detail || "Failed");
        const blob = await res.blob();
        setZP(100); setZD(total);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${cfg.event_name}_badges.zip`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        notify("ZIP downloaded! 🎉", "success");
      } catch (e) {
        notify(e.name === "AbortError" ? "Timed out — server waking up, retry in 30s" : e.message, "error");
      }
    }
    setZL(false);
  }, [templateFile, namesFile, names, cfg, gallery, notify]);

  // ─── Gallery helpers ───────────────────────────────────────────────────────
  const filteredGallery = useMemo(() => {
    if (!galFilter.trim()) return gallery.map((b, i) => ({ ...b, _i: i }));
    const q = galFilter.toLowerCase();
    return gallery.map((b, i) => ({ ...b, _i: i })).filter(b => b.name.toLowerCase().includes(q));
  }, [gallery, galFilter]);

  const selectedBadge = selIdx !== null ? gallery[selIdx] : null;

  const canDesign = !!templateImg;
  const canGallery = !!templateImg && names.length > 0;
  const canExport = !!templateFile && !!(namesFile || names.length > 0) && !!cfg.event_name.trim();

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="root">
      <div className="noise" />

      {/* HEADER */}
      <header className="hdr">
        <div className="brand">
          <div className="brand-mark">B</div>
          <span className="brand-name">BadgeGen</span>
        </div>
        <Steps step={page} onClick={setPage} />
        <div className="hdr-end">
          {page > 0 && (
            <button className="ghost" onClick={() => setPage(p => Math.max(0, p - 1))}>← Back</button>
          )}
        </div>
      </header>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ══ PAGE 0: SETUP ════════════════════════════════════════════════════ */}
      {page === 0 && (
        <div className="pg pg-setup">
          <div className="setup-hero">
            <h1>Create <em>stunning</em><br />event badges</h1>
            <p>Upload a template, add names, get personalized badges in seconds.</p>
          </div>

          <div className="setup-grid">
            {/* Template */}
            <div className={cls("ucard", templateImg && "ucard-done", dragOver === "tpl" && "ucard-drag")}
              onClick={() => tRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDO("tpl"); }}
              onDragLeave={() => setDO(null)}
              onDrop={e => onDrop(e, "tpl")}>
              <input ref={tRef} type="file" accept="image/*" hidden onChange={e => loadTemplate(e.target.files[0])} />
              {templateImg ? (
                <>
                  <div className="ucard-thumb">
                    <canvas ref={previewCanvasRef} style={{ display: "none" }} />
                    <img src={URL.createObjectURL(templateFile)} alt="tpl" />
                  </div>
                  <div className="ucard-info">
                    <div className="ucard-check">✓</div>
                    <div className="ucard-name">{templateFile.name}</div>
                    <div className="ucard-change">Click to change</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="ucard-plus">+</div>
                  <div className="ucard-title">Badge Template</div>
                  <div className="ucard-hint">PNG · JPG · BMP<br />Drag & drop</div>
                </>
              )}
            </div>

            {/* Names */}
            <div className={cls("ucard", namesFile && "ucard-done", dragOver === "names" && "ucard-drag")}
              onClick={() => nRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDO("names"); }}
              onDragLeave={() => setDO(null)}
              onDrop={e => onDrop(e, "names")}>
              <input ref={nRef} type="file" accept=".txt,.csv,.xlsx,.xls" hidden onChange={e => loadNames(e.target.files[0])} />
              {namesFile ? (
                <>
                  <div className="ucard-names-list">
                    {names.slice(0, 5).map((n, i) => <div key={i} className="ucard-name-row">{n}</div>)}
                    {names.length > 5 && <div className="ucard-name-more">+{names.length - 5} more names</div>}
                    {names.length === 0 && <div className="ucard-name-more">Excel file — names load at generation</div>}
                  </div>
                  <div className="ucard-info">
                    <div className="ucard-check">✓</div>
                    <div className="ucard-name">{namesFile.name}</div>
                    <div className="ucard-change">{names.length > 0 ? `${names.length} names` : "Excel"} · Click to change</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="ucard-plus">+</div>
                  <div className="ucard-title">Names List</div>
                  <div className="ucard-hint">TXT · CSV · Excel<br />Drag & drop</div>
                </>
              )}
            </div>

            {/* Event name */}
            <div className={cls("ucard", cfg.event_name && "ucard-done")} onClick={e => e.stopPropagation()}>
              <div className="ucard-plus">🎫</div>
              <div className="ucard-title">Event Name</div>
              <input className="event-inp" placeholder="e.g. Tech Summit 2025"
                value={cfg.event_name} onChange={e => s("event_name", e.target.value)}
                onClick={e => e.stopPropagation()} />
              <div className="ucard-hint">Becomes the folder name in your ZIP</div>
            </div>
          </div>

          <div className="setup-foot">
            <button className={cls("cta", canDesign && "cta-on")} disabled={!canDesign}
              onClick={() => setPage(1)}>
              Continue to Design →
            </button>
            {!canDesign && <div className="setup-req">Upload a template image to continue</div>}
          </div>
        </div>
      )}

      {/* ══ PAGE 1: DESIGN ═══════════════════════════════════════════════════ */}
      {page === 1 && (
        <div className="pg pg-design">
          {/* Controls */}
          <aside className="design-aside">
            <div className="dtabs">
              {["text", "position", "effects", "language"].map(t => (
                <button key={t} className={cls("dtab", designTab === t && "dtab-on")}
                  onClick={() => setDT(t)}>{t}</button>
              ))}
            </div>

            <div className="dscroll">
              {designTab === "text" && (
                <div className="dgroup">
                  <div className="dfield">
                    <label className="dlbl">FONT FAMILY</label>
                    <select className="dsel" value={cfg.font_family} onChange={e => s("font_family", e.target.value)}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <Knob label="FONT SIZE" value={cfg.font_size} min={8} max={300} unit="px" onChange={v => s("font_size", v)} />
                  <div className="dfield">
                    <label className="dlbl">STYLE</label>
                    <div className="dpills">
                      {[["normal", "font_style"], ["italic", "font_style"], ["normal", "font_weight"], ["bold", "font_weight"]].map(([v, k]) => (
                        <button key={k + v} className={cls("dpill", cfg[k] === v && "dpill-on")}
                          onClick={() => s(k, v)}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div className="dfield">
                    <label className="dlbl">COLOR</label>
                    <div className="color-row">
                      <input type="color" className="cpick" value={cfg.font_color} onChange={e => s("font_color", e.target.value)} />
                      <span className="chex">{cfg.font_color}</span>
                    </div>
                  </div>
                  <div className="dfield">
                    <label className="dlbl">ALIGNMENT</label>
                    <div className="dpills">
                      {["left", "center", "right"].map(a => (
                        <button key={a} className={cls("dpill", cfg.text_align === a && "dpill-on")}
                          onClick={() => s("text_align", a)}>{a}</button>
                      ))}
                    </div>
                  </div>
                  <Sw label="Underline" on={cfg.text_underline} onChange={v => s("text_underline", v)} />
                  <Sw label="Strikethrough" on={cfg.text_strikethrough} onChange={v => s("text_strikethrough", v)} />
                  <Knob label="ROTATION" value={cfg.text_rotation} min={-180} max={180} unit="°" onChange={v => s("text_rotation", v)} />
                </div>
              )}
              {designTab === "position" && (
                <div className="dgroup">
                  <Knob label="X POSITION" value={cfg.text_x} min={0} max={3000} unit="px" onChange={v => s("text_x", v)} />
                  <Knob label="Y POSITION" value={cfg.text_y} min={0} max={3000} unit="px" onChange={v => s("text_y", v)} />
                  <div className="dfield">
                    <label className="dlbl">SNAP TO POSITION</label>
                    <div className="snap9">
                      {[["↖", .1, .1], ["↑", .5, .1], ["↗", .9, .1], ["←", .1, .5], ["✛", .5, .5], ["→", .9, .5], ["↙", .1, .9], ["↓", .5, .9], ["↘", .9, .9]].map(([ic, px, py]) => (
                        <button key={ic} className="snap9-btn"
                          onClick={() => { s("text_x", Math.round((templateImg?.naturalWidth || 800) * px)); s("text_y", Math.round((templateImg?.naturalHeight || 600) * py)); }}>{ic}</button>
                      ))}
                    </div>
                  </div>
                  <div className="dinfo">Coordinates snap to actual template dimensions</div>
                </div>
              )}
              {designTab === "effects" && (
                <div className="dgroup">
                  <Sw label="Drop Shadow" sub="Depth behind text" on={cfg.text_shadow} onChange={v => s("text_shadow", v)} />
                  {cfg.text_shadow && (
                    <div className="effect-sub">
                      <div className="dfield">
                        <label className="dlbl">SHADOW COLOR</label>
                        <div className="color-row">
                          <input type="color" className="cpick" value={cfg.shadow_color} onChange={e => s("shadow_color", e.target.value)} />
                          <span className="chex">{cfg.shadow_color}</span>
                        </div>
                      </div>
                      <Knob label="OFFSET X" value={cfg.shadow_offset_x} min={-20} max={20} onChange={v => s("shadow_offset_x", v)} />
                      <Knob label="OFFSET Y" value={cfg.shadow_offset_y} min={-20} max={20} onChange={v => s("shadow_offset_y", v)} />
                      <Knob label="BLUR" value={cfg.shadow_blur} min={0} max={15} onChange={v => s("shadow_blur", v)} />
                    </div>
                  )}
                  <div className="fx-div" />
                  <Sw label="Text Outline" sub="Border around letters" on={cfg.text_outline} onChange={v => s("text_outline", v)} />
                  {cfg.text_outline && (
                    <div className="effect-sub">
                      <div className="dfield">
                        <label className="dlbl">OUTLINE COLOR</label>
                        <div className="color-row">
                          <input type="color" className="cpick" value={cfg.outline_color} onChange={e => s("outline_color", e.target.value)} />
                          <span className="chex">{cfg.outline_color}</span>
                        </div>
                      </div>
                      <Knob label="WIDTH" value={cfg.outline_width} min={1} max={12} onChange={v => s("outline_width", v)} />
                    </div>
                  )}
                </div>
              )}
              {designTab === "language" && (
                <div className="dgroup">
                  <Sw label="Arabic / RTL Support" sub="Auto-detects per name" on={cfg.arabic_support} onChange={v => s("arabic_support", v)} />
                  <div className="lang-note">
                    <div className="lang-note-title">Arabic-friendly fonts</div>
                    {["Traditional Arabic", "Arabic Typesetting", "Simplified Arabic", "Tahoma"].map(f => (
                      <button key={f} className={cls("lang-font-btn", cfg.font_family === f && "lang-font-on")}
                        onClick={() => s("font_family", f)}>{f}</button>
                    ))}
                    <div className="lang-note-hint">Note: Canvas preview uses browser fonts. Final server-rendered badges may differ slightly for Arabic.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="design-footer">
              <div className="pname-box">
                <label className="dlbl">PREVIEW NAME</label>
                <input className="pname-inp" value={previewName} onChange={e => setPN(e.target.value)} placeholder="Type any name…" />
              </div>
              <div className="design-ctas">
                {canGallery && (
                  <button className="cta cta-ghost" onClick={buildGallery}>🖼 Build Gallery</button>
                )}
                {canExport && (
                  <button className="cta cta-on" onClick={downloadZip}>⬇ Download ZIP</button>
                )}
              </div>
            </div>
          </aside>

          {/* Live canvas preview */}
          <div className="design-preview">
            <div className="prev-header">
              <span className="prev-lbl">LIVE PREVIEW</span>
              <span className="prev-instant">⚡ Instant — no server needed</span>
            </div>
            <div className="prev-wrap">
              {templateImg ? (
                <canvas ref={previewCanvasRef} className="prev-canvas" />
              ) : (
                <div className="prev-empty">Upload a template to begin</div>
              )}
            </div>
            <div className="prev-foot">
              {templateImg && (
                <span className="prev-dim">{templateImg.naturalWidth} × {templateImg.naturalHeight}px</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ PAGE 2: GALLERY ══════════════════════════════════════════════════ */}
      {page === 2 && (
        <div className="pg pg-gallery">
          {/* Toolbar */}
          <div className="gbar">
            <div className="gbar-l">
              <span className="gbar-title">Gallery</span>
              <span className="gbar-count">
                {galLoading ? `${gallery.length} / ${names.length} generating…` : `${gallery.length} badges`}
              </span>
              {galLoading && (
                <div className="gbar-prog"><div className="gbar-prog-fill" style={{ width: galProgress + "%" }} /></div>
              )}
              {!galLoading && gallery.length > 0 && (
                <input className="gal-search" placeholder="🔍 Search names…"
                  value={galFilter} onChange={e => setGF(e.target.value)} />
              )}
            </div>
            <div className="gbar-r">
              {!galLoading && gallery.length > 0 && (
                <button className="ghost" onClick={regenAll}>↺ Apply Settings to All</button>
              )}
              <button className="ghost" onClick={() => setPage(1)}>✏ Edit Design</button>
              <button className={cls("cta cta-sm", canExport && "cta-on")} onClick={downloadZip} disabled={!canExport}>
                ⬇ Download ZIP
              </button>
            </div>
          </div>

          <div className="gal-body">
            {/* Grid */}
            <div className="gal-grid">
              {gallery.length === 0 && galLoading && (
                <div className="gal-empty-state">
                  <div className="big-spin" /><p>Building gallery…</p>
                </div>
              )}
              {filteredGallery.map(b => (
                <div key={b._i}
                  className={cls("gcard", !b.ok && "gcard-err", selIdx === b._i && "gcard-sel")}
                  onClick={() => { setSel(selIdx === b._i ? null : b._i); setEN(b.name); }}>
                  <div className="gcard-img">
                    {b.dataUrl
                      ? <img src={b.dataUrl} alt={b.name} loading="lazy" />
                      : <div className="gcard-noimg">⚠</div>}
                  </div>
                  <div className="gcard-foot">
                    <span className="gcard-name">{b.name}</span>
                    <div className="gcard-btns">
                      <button className="gcard-btn" title="Edit"
                        onClick={e => { e.stopPropagation(); setSel(b._i); setEN(b.name); }}>✏</button>
                      <button className="gcard-btn" title="Regenerate"
                        onClick={e => { e.stopPropagation(); regenOne(b._i); }}>↺</button>
                      {b.dataUrl && (
                        <a className="gcard-btn" href={b.dataUrl} download={`${b.name}_badge.png`}
                          onClick={e => e.stopPropagation()} title="Download">⬇</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredGallery.length === 0 && !galLoading && galFilter && (
                <div className="gal-empty-state"><p>No badges match "{galFilter}"</p></div>
              )}
            </div>

            {/* Side panel */}
            {selIdx !== null && selectedBadge && (
              <div className="gal-side">
                <div className="gside-hdr">
                  <span className="gside-title">Edit Badge</span>
                  <button className="close-x" onClick={() => setSel(null)}>✕</button>
                </div>

                <div className="gside-prev">
                  {selectedBadge.dataUrl
                    ? <img src={selectedBadge.dataUrl} alt="sel" />
                    : <div className="gside-noimg">No preview</div>}
                </div>

                <div className="gside-body">
                  <label className="dlbl">NAME ON BADGE</label>
                  <input className="gside-inp" value={editName}
                    onChange={e => setEN(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") regenOne(selIdx, editName.trim()); }} />

                  <div className="gside-actions">
                    <button className="gside-btn" onClick={() => regenOne(selIdx, editName.trim())}>
                      {regenSel ? "↺ Saving…" : "↺ Save & Update"}
                    </button>
                    {selectedBadge.dataUrl && (
                      <a className="gside-btn gside-dl" href={selectedBadge.dataUrl}
                        download={`${selectedBadge.name}_badge.png`}>⬇ Download</a>
                    )}
                    <button className="gside-btn gside-del"
                      onClick={() => { setGallery(g => g.filter((_, i) => i !== selIdx)); setSel(null); }}>
                      🗑 Remove
                    </button>
                  </div>
                </div>

                <div className="gside-nav">
                  <button className="nav-btn" disabled={selIdx === 0}
                    onClick={() => { const n = selIdx - 1; setSel(n); setEN(gallery[n].name); }}>← Prev</button>
                  <span className="nav-pos">{selIdx + 1} / {gallery.length}</span>
                  <button className="nav-btn" disabled={selIdx === gallery.length - 1}
                    onClick={() => { const n = selIdx + 1; setSel(n); setEN(gallery[n].name); }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ PAGE 3: EXPORT ═══════════════════════════════════════════════════ */}
      {page === 3 && (
        <div className="pg pg-export">
          <div className="exp-card">
            {zipLoading ? (
              <>
                <div className="big-spin" />
                <h2 className="exp-h2">Packaging your badges…</h2>
                <div className="exp-prog-wrap">
                  <div className="exp-prog">
                    <div className="exp-prog-fill" style={{ width: zipProgress + "%" }} />
                  </div>
                  <div className="exp-count">
                    {gallery.length > 0
                      ? `${zipDone} / ${gallery.length} badges`
                      : `${zipProgress}%`}
                  </div>
                </div>
                <div className="exp-status">
                  {zipProgress < 20 && "Starting…"}
                  {zipProgress >= 20 && zipProgress < 90 && "Building ZIP in browser…"}
                  {zipProgress >= 90 && "Finalizing…"}
                </div>
                {gallery.length > 0 && (
                  <div className="exp-note">Using cached previews — no server wait!</div>
                )}
              </>
            ) : (
              <>
                <div className="exp-done">✓</div>
                <h2 className="exp-h2">All done!</h2>
                <p className="exp-sub">Your ZIP downloaded automatically.</p>
                <div className="exp-actions">
                  <button className="cta cta-on" onClick={downloadZip}>⬇ Download again</button>
                  <button className="cta cta-ghost" onClick={() => setPage(2)}>← Back to Gallery</button>
                  <button className="cta cta-ghost" onClick={() => setPage(1)}>✏ Edit Design</button>
                  <button className="cta cta-ghost" onClick={() => setPage(0)}>⌂ New Project</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for rendering (page 0) */}
      {page === 0 && <canvas ref={previewCanvasRef} style={{ display: "none" }} />}
    </div>
  );
}