import React, { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const FONTS = [
  "Arial", "Times New Roman", "Calibri", "Verdana", "Georgia",
  "Trebuchet MS", "Impact", "Tahoma", "Courier New", "Segoe UI",
  "Traditional Arabic", "Arabic Typesetting", "Simplified Arabic",
];

const DEFAULT_SETTINGS = {
  event_name: "",
  font_family: "Arial",
  font_size: 48,
  font_style: "normal",
  font_weight: "normal",
  font_color: "#000000",
  text_x: 400,
  text_y: 300,
  text_align: "center",
  text_shadow: false,
  shadow_color: "#808080",
  shadow_offset_x: 3,
  shadow_offset_y: 3,
  shadow_blur: 2,
  text_outline: false,
  outline_color: "#ffffff",
  outline_width: 2,
  text_underline: false,
  text_strikethrough: false,
  text_rotation: 0,
  arabic_support: true,
};

function Slider({ label, value, min, max, onChange, unit = "" }) {
  return (
    <div className="slider-row">
      <span className="slider-label">{label}</span>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="slider" />
      <input type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(Number(e.target.value))} className="slider-num" />
      {unit && <span className="slider-unit">{unit}</span>}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <div className={"toggle" + (checked ? " on" : "")} onClick={() => onChange(!checked)}>
        <div className="toggle-thumb" />
      </div>
    </label>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button className={"tab" + (active ? " active" : "")} onClick={onClick}>{label}</button>
  );
}

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateURL, setTemplateURL] = useState(null);
  const [namesFile, setNamesFile] = useState(null);
  const [namesList, setNamesList] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewName, setPreviewName] = useState("Sample Name");
  const [activeTab, setActiveTab] = useState("text");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [view, setView] = useState("editor");
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState(0);
  const [editingBadge, setEditingBadge] = useState(null);

  const templateInputRef = useRef();
  const namesInputRef = useRef();
  const debounceRef = useRef(null);

  const runPreview = useCallback(async (tFile, sSettings, sName) => {
    if (!tFile) return;
    setPreviewLoading(true);
    try {
      const form = new FormData();
      form.append("template", tFile);
      form.append("settings", JSON.stringify(sSettings));
      form.append("name", sName);
      const res = await fetch(API_URL + "/preview", { method: "POST", body: form });
      if (!res.ok) throw new Error("Preview failed");
      const data = await res.json();
      setPreviewImg(data.image);
    } catch (e) {
      console.warn("Preview error:", e.message);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const schedulePreview = useCallback((tFile, sSettings, sName) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runPreview(tFile, sSettings, sName);
    }, 700);
  }, [runPreview]);

  // Auto-refresh when settings or previewName changes
  useEffect(() => {
    if (templateFile) schedulePreview(templateFile, settings, previewName);
  }, [settings, previewName, templateFile, schedulePreview]);

  const set = useCallback((key, val) => {
    setSettings((s) => ({ ...s, [key]: val }));
  }, []);

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTemplateFile(file);
    setTemplateURL(URL.createObjectURL(file));
    setPreviewImg(null);
    setGallery([]);
  };

  const handleNamesUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNamesFile(file);
    try {
      const text = await file.text();
      let names = [];
      if (file.name.endsWith(".txt")) {
        names = text.split("\n").map(n => n.trim()).filter(Boolean);
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(Boolean);
        names = lines.slice(1).map(l => l.split(",")[0].replace(/"/g, "").trim()).filter(Boolean);
        if (names.length === 0) names = lines.map(l => l.split(",")[0].replace(/"/g, "").trim()).filter(Boolean);
      }
      setNamesList(names);
      setSuccess("Loaded " + (names.length || "?") + " names from " + file.name);
    } catch {
      setSuccess("Loaded " + file.name);
    }
  };

  const handleBuildGallery = async () => {
    if (!templateFile) return setError("Please upload a template image.");
    if (!namesFile) return setError("Please upload a names file.");
    if (namesList.length === 0) return setError("Could not parse names. Use TXT or CSV for gallery preview.");
    setGalleryLoading(true);
    setGallery([]);
    setView("gallery");
    setError(null);
    const BATCH = 3;
    const results = [];
    for (let i = 0; i < namesList.length; i += BATCH) {
      const batch = namesList.slice(i, i + BATCH);
      const batchResults = await Promise.all(batch.map(async (name) => {
        try {
          const form = new FormData();
          form.append("template", templateFile);
          form.append("settings", JSON.stringify(settings));
          form.append("name", name);
          const res = await fetch(API_URL + "/preview", { method: "POST", body: form });
          if (!res.ok) throw new Error();
          const data = await res.json();
          return { name, dataUrl: data.image, error: null };
        } catch {
          return { name, dataUrl: null, error: "Failed" };
        }
      }));
      results.push(...batchResults);
      setGallery([...results]);
      setGalleryProgress(Math.round(((i + BATCH) / namesList.length) * 100));
    }
    setGalleryLoading(false);
  };

  const regenerateBadge = async (index) => {
    const name = gallery[index].name;
    setEditingBadge(null);
    const form = new FormData();
    form.append("template", templateFile);
    form.append("settings", JSON.stringify(settings));
    form.append("name", name);
    try {
      const res = await fetch(API_URL + "/preview", { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGallery(g => g.map((b, i) => i === index ? { ...b, dataUrl: data.image, error: null } : b));
    } catch {
      setError("Failed to regenerate badge for " + name);
    }
  };

  const regenerateAll = async () => {
    if (gallery.length === 0) return;
    setGalleryLoading(true);
    setGalleryProgress(0);
    const BATCH = 3;
    for (let i = 0; i < gallery.length; i += BATCH) {
      const batch = gallery.slice(i, i + BATCH);
      const updated = await Promise.all(batch.map(async (badge) => {
        try {
          const form = new FormData();
          form.append("template", templateFile);
          form.append("settings", JSON.stringify(settings));
          form.append("name", badge.name);
          const res = await fetch(API_URL + "/preview", { method: "POST", body: form });
          if (!res.ok) throw new Error();
          const data = await res.json();
          return { ...badge, dataUrl: data.image, error: null };
        } catch {
          return { ...badge, error: "Failed" };
        }
      }));
      setGallery(g => {
        const copy = [...g];
        updated.forEach((b, j) => { copy[i + j] = b; });
        return copy;
      });
      setGalleryProgress(Math.round(((i + BATCH) / gallery.length) * 100));
    }
    setGalleryLoading(false);
  };

  const handleDownloadZip = async () => {
    if (!templateFile) return setError("Please upload a template image.");
    if (!namesFile) return setError("Please upload a names file.");
    if (!settings.event_name.trim()) return setError("Please enter an event name.");
    setGenerating(true);
    setGenProgress(5);
    setGenStatus("Connecting to server…");
    setError(null);
    try {
      const form = new FormData();
      form.append("template", templateFile);
      form.append("names_file", namesFile);
      form.append("settings", JSON.stringify(settings));
      setGenProgress(20);
      setGenStatus("Generating badges on server…");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000);
      const res = await fetch(API_URL + "/generate", {
        method: "POST", body: form, signal: controller.signal
      });
      clearTimeout(timeout);
      setGenProgress(85);
      setGenStatus("Packaging ZIP…");
      if (!res.ok) throw new Error((await res.json()).detail || "Generation failed");
      const blob = await res.blob();
      setGenProgress(100);
      setGenStatus("Done!");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (settings.event_name || "badges") + "_badges.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("ZIP downloaded successfully!");
    } catch (e) {
      if (e.name === "AbortError") {
        setError("Timed out. Your Render instance may be waking up — wait 30 seconds and try again.");
      } else {
        setError(e.message);
      }
    } finally {
      setGenerating(false);
      setTimeout(() => { setGenProgress(0); setGenStatus(""); }, 3000);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Badge<em>Gen</em></span>
          </div>
          <p className="header-sub">Professional badge generator · Arabic &amp; RTL support</p>
          <div className="view-switcher">
            <button className={"view-btn" + (view === "editor" ? " active" : "")} onClick={() => setView("editor")}>
              ✏ Editor
            </button>
            <button
              className={"view-btn" + (view === "gallery" ? " active" : "")}
              onClick={() => gallery.length > 0 ? setView("gallery") : handleBuildGallery()}
              disabled={!namesFile || !templateFile}
            >
              🖼 Gallery {gallery.length > 0 ? "(" + gallery.length + ")" : ""}
            </button>
          </div>
        </div>
      </header>

      {error && <div className="alert alert-error" onClick={() => setError(null)}>✕ {error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess(null)}>{success}</div>}

      {view === "editor" && (
        <main className="main">
          <aside className="panel panel-left">
            <section className="section">
              <h3 className="section-title">EVENT</h3>
              <input className="text-input" placeholder="Event name (folder name in ZIP)"
                value={settings.event_name} onChange={(e) => set("event_name", e.target.value)} />
            </section>

            <section className="section">
              <h3 className="section-title">FILES</h3>
              <div className={"dropzone" + (templateFile ? " has-file" : "")} onClick={() => templateInputRef.current.click()}>
                <input ref={templateInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleTemplateUpload} />
                <span className="dropzone-icon">🖼</span>
                <span className="dropzone-label">{templateFile ? templateFile.name : "Upload badge template"}</span>
                <span className="dropzone-hint">PNG / JPG / BMP</span>
              </div>
              <div className={"dropzone" + (namesFile ? " has-file" : "")} onClick={() => namesInputRef.current.click()}>
                <input ref={namesInputRef} type="file" accept=".txt,.csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleNamesUpload} />
                <span className="dropzone-icon">📋</span>
                <span className="dropzone-label">
                  {namesFile ? namesFile.name + (namesList.length > 0 ? " · " + namesList.length + " names" : "") : "Upload names list"}
                </span>
                <span className="dropzone-hint">TXT · CSV · Excel</span>
              </div>
            </section>

            <section className="section">
              <div className="tabs">
                {["text", "position", "effects", "language"].map((t) => (
                  <Tab key={t} label={t[0].toUpperCase() + t.slice(1)} active={activeTab === t} onClick={() => setActiveTab(t)} />
                ))}
              </div>

              {activeTab === "text" && (
                <div className="tab-content">
                  <div className="form-row">
                    <label>Font</label>
                    <select className="select" value={settings.font_family} onChange={(e) => set("font_family", e.target.value)}>
                      {FONTS.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <Slider label="Size" value={settings.font_size} min={10} max={300} onChange={(v) => set("font_size", v)} unit="px" />
                  <div className="form-row">
                    <label>Style</label>
                    <select className="select" value={settings.font_style} onChange={(e) => set("font_style", e.target.value)}>
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                    <select className="select" value={settings.font_weight} onChange={(e) => set("font_weight", e.target.value)}>
                      <option value="normal">Regular</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Color</label>
                    <input type="color" value={settings.font_color} onChange={(e) => set("font_color", e.target.value)} className="color-picker" />
                    <span className="color-hex">{settings.font_color}</span>
                  </div>
                  <div className="form-row">
                    <label>Align</label>
                    {["left", "center", "right"].map((a) => (
                      <button key={a} className={"align-btn" + (settings.text_align === a ? " active" : "")} onClick={() => set("text_align", a)}>
                        {a === "left" ? "⬤◯◯" : a === "center" ? "◯⬤◯" : "◯◯⬤"}
                      </button>
                    ))}
                  </div>
                  <Toggle label="Underline" checked={settings.text_underline} onChange={(v) => set("text_underline", v)} />
                  <Toggle label="Strikethrough" checked={settings.text_strikethrough} onChange={(v) => set("text_strikethrough", v)} />
                  <Slider label="Rotation" value={settings.text_rotation} min={-180} max={180} onChange={(v) => set("text_rotation", v)} unit="°" />
                </div>
              )}

              {activeTab === "position" && (
                <div className="tab-content">
                  <Slider label="X" value={settings.text_x} min={0} max={2000} onChange={(v) => set("text_x", v)} unit="px" />
                  <Slider label="Y" value={settings.text_y} min={0} max={2000} onChange={(v) => set("text_y", v)} unit="px" />
                  <p className="hint" style={{marginTop:8}}>Snap to preset:</p>
                  <div className="preset-grid">
                    {[["↖",0.1,0.1],["↑",0.5,0.1],["↗",0.9,0.1],["←",0.1,0.5],["✛",0.5,0.5],["→",0.9,0.5],["↙",0.1,0.9],["↓",0.5,0.9],["↘",0.9,0.9]].map(([icon,px,py]) => (
                      <button key={icon} className="preset-btn" onClick={() => { set("text_x", Math.round(800*px)); set("text_y", Math.round(600*py)); }}>{icon}</button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "effects" && (
                <div className="tab-content">
                  <Toggle label="Shadow" checked={settings.text_shadow} onChange={(v) => set("text_shadow", v)} />
                  {settings.text_shadow && (
                    <div className="sub-section">
                      <div className="form-row">
                        <label>Color</label>
                        <input type="color" value={settings.shadow_color} onChange={(e) => set("shadow_color", e.target.value)} className="color-picker" />
                      </div>
                      <Slider label="X" value={settings.shadow_offset_x} min={-20} max={20} onChange={(v) => set("shadow_offset_x", v)} />
                      <Slider label="Y" value={settings.shadow_offset_y} min={-20} max={20} onChange={(v) => set("shadow_offset_y", v)} />
                      <Slider label="Blur" value={settings.shadow_blur} min={0} max={10} onChange={(v) => set("shadow_blur", v)} />
                    </div>
                  )}
                  <div className="divider" />
                  <Toggle label="Outline" checked={settings.text_outline} onChange={(v) => set("text_outline", v)} />
                  {settings.text_outline && (
                    <div className="sub-section">
                      <div className="form-row">
                        <label>Color</label>
                        <input type="color" value={settings.outline_color} onChange={(e) => set("outline_color", e.target.value)} className="color-picker" />
                      </div>
                      <Slider label="Width" value={settings.outline_width} min={1} max={10} onChange={(v) => set("outline_width", v)} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "language" && (
                <div className="tab-content">
                  <Toggle label="Arabic / RTL support" checked={settings.arabic_support} onChange={(v) => set("arabic_support", v)} />
                  <div className="info-box">
                    <strong>Recommended Arabic fonts:</strong>
                    <ul>
                      <li>Traditional Arabic</li>
                      <li>Arabic Typesetting</li>
                      <li>Simplified Arabic</li>
                      <li>Tahoma (mixed text)</li>
                    </ul>
                    <p>Text direction is auto-detected per name.</p>
                  </div>
                </div>
              )}
            </section>
          </aside>

          <div className="panel panel-right">
            <div className="preview-header">
              <div>
                <h3 className="section-title">LIVE PREVIEW</h3>
                <p className="hint">Auto-updates as you change settings</p>
              </div>
              <div className="preview-name-row">
                <input className="text-input preview-name-input" placeholder="Type a name to preview…"
                  value={previewName} onChange={(e) => setPreviewName(e.target.value)} />
                {previewLoading && <span className="spinner-sm" />}
              </div>
            </div>

            <div className="preview-area">
              {previewImg
                ? <img src={previewImg} alt="Badge preview" className="preview-image" />
                : templateURL
                ? <img src={templateURL} alt="Template" className="preview-image preview-template" />
                : (
                  <div className="preview-empty">
                    <span className="preview-empty-icon">◈</span>
                    <p>Upload a template to see a live preview</p>
                  </div>
                )}
              {previewLoading && (
                <div className="preview-loading-overlay">
                  <span className="spinner" />
                </div>
              )}
            </div>

            <div className="action-row">
              <button className="btn btn-secondary" onClick={handleBuildGallery}
                disabled={!namesFile || !templateFile || galleryLoading}>
                {galleryLoading ? <><span className="spinner-sm" /> Building…</> : "🖼 Preview All Badges"}
              </button>
              <button className="btn btn-generate" onClick={handleDownloadZip} disabled={generating}>
                {generating ? <><span className="spinner" /> {genStatus || "Generating…"}</> : "⬇ Generate & Download ZIP"}
              </button>
            </div>

            {generating && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: genProgress + "%" }} />
                <span className="progress-label">{genStatus}</span>
              </div>
            )}

            <p className="generate-hint">
              {namesList.length > 0
                ? "Ready to generate " + namesList.length + " badges · ZIP downloads automatically"
                : "Upload a names file to generate badges"}
            </p>
          </div>
        </main>
      )}

      {view === "gallery" && (
        <div className="gallery-view">
          <div className="gallery-toolbar">
            <div className="gallery-toolbar-left">
              <button className="btn btn-secondary" onClick={() => setView("editor")}>← Back to Editor</button>
              <span className="gallery-count">
                {galleryLoading
                  ? "Generating… " + Math.min(gallery.length, namesList.length) + " / " + namesList.length
                  : gallery.length + " badges"}
              </span>
              {galleryLoading && (
                <div className="gallery-progress">
                  <div className="gallery-progress-fill" style={{ width: galleryProgress + "%" }} />
                </div>
              )}
            </div>
            <div className="gallery-toolbar-right">
              {gallery.length > 0 && !galleryLoading && (
                <button className="btn btn-secondary" onClick={regenerateAll}>↺ Apply Settings to All</button>
              )}
              <button className="btn btn-generate" onClick={handleDownloadZip} disabled={generating}>
                {generating ? <><span className="spinner" /> {genStatus}</> : "⬇ Download All as ZIP"}
              </button>
            </div>
          </div>

          {generating && (
            <div className="progress-bar gallery-gen-progress">
              <div className="progress-fill" style={{ width: genProgress + "%" }} />
              <span className="progress-label">{genStatus}</span>
            </div>
          )}

          {gallery.length === 0 && galleryLoading && (
            <div className="gallery-empty">
              <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <p>Generating previews…</p>
            </div>
          )}

          <div className="gallery-grid">
            {gallery.map((badge, i) => (
              <div key={i} className={"gallery-card" + (badge.error ? " has-error" : "") + (editingBadge === i ? " editing" : "")}>
                <div className="gallery-card-img">
                  {badge.dataUrl
                    ? <img src={badge.dataUrl} alt={badge.name} />
                    : <div className="gallery-card-error">⚠ Failed</div>}
                </div>
                <div className="gallery-card-footer">
                  {editingBadge === i ? (
                    <input className="text-input gallery-name-input" defaultValue={badge.name} autoFocus
                      onBlur={(e) => {
                        const n = e.target.value.trim();
                        if (n && n !== badge.name) {
                          setGallery(g => g.map((b, idx) => idx === i ? { ...b, name: n } : b));
                          setTimeout(() => regenerateBadge(i), 50);
                        } else setEditingBadge(null);
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingBadge(null); }}
                    />
                  ) : (
                    <span className="gallery-card-name" title={badge.name}>{badge.name}</span>
                  )}
                  <div className="gallery-card-actions">
                    <button className="card-action-btn" title="Edit name" onClick={() => setEditingBadge(editingBadge === i ? null : i)}>✏</button>
                    <button className="card-action-btn" title="Regenerate" onClick={() => regenerateBadge(i)}>↺</button>
                    <a className="card-action-btn" title="Download" href={badge.dataUrl} download={badge.name + "_badge.png"}>⬇</a>
                    <button className="card-action-btn card-action-danger" title="Remove" onClick={() => setGallery(g => g.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}