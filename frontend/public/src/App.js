import React, { useState, useRef, useCallback } from "react";
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
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
      />
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-num"
      />
      {unit && <span className="slider-unit">{unit}</span>}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <div className={`toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
        <div className="toggle-thumb" />
      </div>
    </label>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateURL, setTemplateURL] = useState(null);
  const [namesFile, setNamesFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewName, setPreviewName] = useState("Sample Name");
  const [activeTab, setActiveTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const templateInputRef = useRef();
  const namesInputRef = useRef();

  const set = useCallback((key, val) => {
    setSettings((s) => ({ ...s, [key]: val }));
  }, []);

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTemplateFile(file);
    setTemplateURL(URL.createObjectURL(file));
    setPreviewImg(null);
  };

  const handleNamesUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNamesFile(file);
    setSuccess(`✓ Loaded: ${file.name}`);
  };

  const handlePreview = async () => {
    if (!templateFile) return setError("Please upload a template image first.");
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("template", templateFile);
      form.append("settings", JSON.stringify(settings));
      form.append("name", previewName);
      const res = await fetch(`${API_URL}/preview`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Preview failed");
      }
      const data = await res.json();
      setPreviewImg(data.image);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!templateFile) return setError("Please upload a template image.");
    if (!namesFile) return setError("Please upload a names file.");
    if (!settings.event_name.trim()) return setError("Please enter an event name.");
    setGenerating(true);
    setError(null);
    setProgress(10);
    try {
      const form = new FormData();
      form.append("template", templateFile);
      form.append("names_file", namesFile);
      form.append("settings", JSON.stringify(settings));
      setProgress(30);
      const res = await fetch(`${API_URL}/generate`, { method: "POST", body: form });
      setProgress(80);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Generation failed");
      }
      const blob = await res.blob();
      setProgress(100);
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${settings.event_name || "badges"}_badges.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("🎉 Badges generated! Your ZIP is downloading.");
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Badge<em>Gen</em></span>
          </div>
          <p className="header-sub">Professional badge generator · Arabic &amp; RTL support</p>
        </div>
      </header>

      {/* ── Alerts ── */}
      {error && (
        <div className="alert alert-error" onClick={() => setError(null)}>
          ✕ {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" onClick={() => setSuccess(null)}>
          {success}
        </div>
      )}

      <main className="main">
        {/* ── Left: Controls ── */}
        <aside className="panel panel-left">
          {/* Event name */}
          <section className="section">
            <h3 className="section-title">EVENT</h3>
            <input
              className="text-input"
              placeholder="Event name (used as folder name)"
              value={settings.event_name}
              onChange={(e) => set("event_name", e.target.value)}
            />
          </section>

          {/* Upload area */}
          <section className="section">
            <h3 className="section-title">FILES</h3>
            <div
              className={`dropzone ${templateFile ? "has-file" : ""}`}
              onClick={() => templateInputRef.current.click()}
            >
              <input
                ref={templateInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleTemplateUpload}
              />
              <span className="dropzone-icon">🖼</span>
              <span className="dropzone-label">
                {templateFile ? templateFile.name : "Upload badge template"}
              </span>
              <span className="dropzone-hint">PNG / JPG / BMP</span>
            </div>

            <div
              className={`dropzone ${namesFile ? "has-file" : ""}`}
              onClick={() => namesInputRef.current.click()}
            >
              <input
                ref={namesInputRef}
                type="file"
                accept=".txt,.csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleNamesUpload}
              />
              <span className="dropzone-icon">📋</span>
              <span className="dropzone-label">
                {namesFile ? namesFile.name : "Upload names list"}
              </span>
              <span className="dropzone-hint">TXT · CSV · Excel</span>
            </div>
          </section>

          {/* Tabs */}
          <section className="section">
            <div className="tabs">
              {["text", "position", "effects", "language"].map((t) => (
                <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={activeTab === t} onClick={() => setActiveTab(t)} />
              ))}
            </div>

            {/* ── Text tab ── */}
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
                    <button key={a} className={`align-btn ${settings.text_align === a ? "active" : ""}`} onClick={() => set("text_align", a)}>
                      {a === "left" ? "⬤◯◯" : a === "center" ? "◯⬤◯" : "◯◯⬤"}
                    </button>
                  ))}
                </div>
                <Toggle label="Underline" checked={settings.text_underline} onChange={(v) => set("text_underline", v)} />
                <Toggle label="Strikethrough" checked={settings.text_strikethrough} onChange={(v) => set("text_strikethrough", v)} />
                <Slider label="Rotation" value={settings.text_rotation} min={-180} max={180} onChange={(v) => set("text_rotation", v)} unit="°" />
              </div>
            )}

            {/* ── Position tab ── */}
            {activeTab === "position" && (
              <div className="tab-content">
                <Slider label="X" value={settings.text_x} min={0} max={2000} onChange={(v) => set("text_x", v)} unit="px" />
                <Slider label="Y" value={settings.text_y} min={0} max={2000} onChange={(v) => set("text_y", v)} unit="px" />
                <div className="preset-grid">
                  {[
                    ["↖", 0.1, 0.1], ["↑", 0.5, 0.1], ["↗", 0.9, 0.1],
                    ["←", 0.1, 0.5], ["✛", 0.5, 0.5], ["→", 0.9, 0.5],
                    ["↙", 0.1, 0.9], ["↓", 0.5, 0.9], ["↘", 0.9, 0.9],
                  ].map(([icon, px, py]) => (
                    <button key={icon} className="preset-btn" onClick={() => {
                      const w = 800, h = 600; // default estimate
                      set("text_x", Math.round(w * px));
                      set("text_y", Math.round(h * py));
                    }}>
                      {icon}
                    </button>
                  ))}
                </div>
                <p className="hint">Click arrows to snap to preset positions, or drag sliders above.</p>
              </div>
            )}

            {/* ── Effects tab ── */}
            {activeTab === "effects" && (
              <div className="tab-content">
                <Toggle label="Shadow" checked={settings.text_shadow} onChange={(v) => set("text_shadow", v)} />
                {settings.text_shadow && (
                  <div className="sub-section">
                    <div className="form-row">
                      <label>Shadow color</label>
                      <input type="color" value={settings.shadow_color} onChange={(e) => set("shadow_color", e.target.value)} className="color-picker" />
                    </div>
                    <Slider label="Offset X" value={settings.shadow_offset_x} min={-20} max={20} onChange={(v) => set("shadow_offset_x", v)} />
                    <Slider label="Offset Y" value={settings.shadow_offset_y} min={-20} max={20} onChange={(v) => set("shadow_offset_y", v)} />
                    <Slider label="Blur" value={settings.shadow_blur} min={0} max={10} onChange={(v) => set("shadow_blur", v)} />
                  </div>
                )}
                <div className="divider" />
                <Toggle label="Outline" checked={settings.text_outline} onChange={(v) => set("text_outline", v)} />
                {settings.text_outline && (
                  <div className="sub-section">
                    <div className="form-row">
                      <label>Outline color</label>
                      <input type="color" value={settings.outline_color} onChange={(e) => set("outline_color", e.target.value)} className="color-picker" />
                    </div>
                    <Slider label="Width" value={settings.outline_width} min={1} max={10} onChange={(v) => set("outline_width", v)} />
                  </div>
                )}
              </div>
            )}

            {/* ── Language tab ── */}
            {activeTab === "language" && (
              <div className="tab-content">
                <Toggle label="Arabic / RTL support" checked={settings.arabic_support} onChange={(v) => set("arabic_support", v)} />
                <div className="info-box">
                  <strong>Arabic fonts to use:</strong>
                  <ul>
                    <li>Traditional Arabic</li>
                    <li>Arabic Typesetting</li>
                    <li>Simplified Arabic</li>
                    <li>Tahoma (mixed)</li>
                  </ul>
                  <p>Text direction is auto-detected. Arabic names will be correctly shaped and rendered right-to-left.</p>
                </div>
              </div>
            )}
          </section>
        </aside>

        {/* ── Right: Preview ── */}
        <div className="panel panel-right">
          <div className="preview-header">
            <h3 className="section-title">PREVIEW</h3>
            <div className="preview-name-row">
              <input
                className="text-input preview-name-input"
                placeholder="Preview name..."
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
              />
              <button className="btn btn-secondary" onClick={handlePreview} disabled={loading}>
                {loading ? <span className="spinner" /> : "↺ Refresh"}
              </button>
            </div>
          </div>

          <div className="preview-area">
            {previewImg ? (
              <img src={previewImg} alt="Badge preview" className="preview-image" />
            ) : templateURL ? (
              <img src={templateURL} alt="Template" className="preview-image preview-template" />
            ) : (
              <div className="preview-empty">
                <span className="preview-empty-icon">◈</span>
                <p>Upload a template to see a live preview</p>
              </div>
            )}
          </div>

          {/* Generate */}
          <div className="generate-section">
            {generating && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
            <button
              className="btn btn-generate"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner" /> Generating badges…
                </>
              ) : (
                <>⬇ Generate &amp; Download ZIP</>
              )}
            </button>
            <p className="generate-hint">
              All badges will be packaged into a single ZIP file ready to download.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}