import React from "react";
import "../styles/Pages-Design.css";

const FONTS = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Impact",
  "Courier New",
  "Segoe UI",
  "Calibri",
  "Traditional Arabic",
  "Arabic Typesetting",
  "Simplified Arabic",
];

function Knob({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div className="knob">
      <div className="knob-row">
        <span className="knob-label">{label}</span>
        <div className="knob-right">
          <input
            className="knob-num"
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(+e.target.value)}
          />
          {unit && <span className="knob-unit">{unit}</span>}
        </div>
      </div>
      <input
        className="knob-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </div>
  );
}

function Sw({ label, sub, on, onChange }) {
  return (
    <div className="sw" onClick={() => onChange(!on)}>
      <div>
        <div className="sw-label">{label}</div>
        {sub && <div className="sw-sub">{sub}</div>}
      </div>
      <div className={`sw-track ${on ? "sw-on" : ""}`}>
        <div className="sw-thumb" />
      </div>
    </div>
  );
}

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

export default function DesignPage({
  cfg,
  onCfgChange,
  previewName,
  onPreviewNameChange,
  templateImg,
  previewCanvasRef,
  canGallery,
  canExport,
  onBuildGallery,
  onDownloadZip,
}) {
  const [designTab, setDT] = React.useState("text");

  const s = (k, v) => onCfgChange(k, v);

  return (
    <div className="pg pg-design">
      {/* Controls */}
      <aside className="design-aside">
        <div className="dtabs">
          {["text", "position", "effects", "language"].map((t) => (
            <button
              key={t}
              className={cls("dtab", designTab === t && "dtab-on")}
              onClick={() => setDT(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="dscroll">
          {designTab === "text" && (
            <div className="dgroup">
              <div className="dfield">
                <label className="dlbl">FONT FAMILY</label>
                <select className="dsel" value={cfg.font_family} onChange={(e) => s("font_family", e.target.value)}>
                  {FONTS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <Knob
                label="FONT SIZE"
                value={cfg.font_size}
                min={8}
                max={300}
                unit="px"
                onChange={(v) => s("font_size", v)}
              />
              <div className="dfield">
                <label className="dlbl">STYLE</label>
                <div className="dpills">
                  {[
                    ["normal", "font_style"],
                    ["italic", "font_style"],
                    ["normal", "font_weight"],
                    ["bold", "font_weight"],
                  ].map(([v, k]) => (
                    <button
                      key={k + v}
                      className={cls("dpill", cfg[k] === v && "dpill-on")}
                      onClick={() => s(k, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="dfield">
                <label className="dlbl">COLOR</label>
                <div className="color-row">
                  <input
                    type="color"
                    className="cpick"
                    value={cfg.font_color}
                    onChange={(e) => s("font_color", e.target.value)}
                  />
                  <span className="chex">{cfg.font_color}</span>
                </div>
              </div>
              <div className="dfield">
                <label className="dlbl">ALIGNMENT</label>
                <div className="dpills">
                  {["left", "center", "right"].map((a) => (
                    <button
                      key={a}
                      className={cls("dpill", cfg.text_align === a && "dpill-on")}
                      onClick={() => s("text_align", a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <Sw label="Underline" on={cfg.text_underline} onChange={(v) => s("text_underline", v)} />
              <Sw label="Strikethrough" on={cfg.text_strikethrough} onChange={(v) => s("text_strikethrough", v)} />
              <Knob
                label="ROTATION"
                value={cfg.text_rotation}
                min={-180}
                max={180}
                unit="°"
                onChange={(v) => s("text_rotation", v)}
              />
            </div>
          )}
          {designTab === "position" && (
            <div className="dgroup">
              <Knob
                label="X POSITION"
                value={cfg.text_x}
                min={0}
                max={3000}
                unit="px"
                onChange={(v) => s("text_x", v)}
              />
              <Knob
                label="Y POSITION"
                value={cfg.text_y}
                min={0}
                max={3000}
                unit="px"
                onChange={(v) => s("text_y", v)}
              />
              <div className="dfield">
                <label className="dlbl">SNAP TO POSITION</label>
                <div className="snap9">
                  {[
                    ["↖", 0.1, 0.1],
                    ["↑", 0.5, 0.1],
                    ["↗", 0.9, 0.1],
                    ["←", 0.1, 0.5],
                    ["✛", 0.5, 0.5],
                    ["→", 0.9, 0.5],
                    ["↙", 0.1, 0.9],
                    ["↓", 0.5, 0.9],
                    ["↘", 0.9, 0.9],
                  ].map(([ic, px, py]) => (
                    <button
                      key={ic}
                      className="snap9-btn"
                      onClick={() => {
                        s("text_x", Math.round((templateImg?.naturalWidth || 800) * px));
                        s("text_y", Math.round((templateImg?.naturalHeight || 600) * py));
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div className="dinfo">Coordinates snap to actual template dimensions</div>
            </div>
          )}
          {designTab === "effects" && (
            <div className="dgroup">
              <Sw label="Drop Shadow" sub="Depth behind text" on={cfg.text_shadow} onChange={(v) => s("text_shadow", v)} />
              {cfg.text_shadow && (
                <div className="effect-sub">
                  <div className="dfield">
                    <label className="dlbl">SHADOW COLOR</label>
                    <div className="color-row">
                      <input
                        type="color"
                        className="cpick"
                        value={cfg.shadow_color}
                        onChange={(e) => s("shadow_color", e.target.value)}
                      />
                      <span className="chex">{cfg.shadow_color}</span>
                    </div>
                  </div>
                  <Knob
                    label="OFFSET X"
                    value={cfg.shadow_offset_x}
                    min={-20}
                    max={20}
                    onChange={(v) => s("shadow_offset_x", v)}
                  />
                  <Knob
                    label="OFFSET Y"
                    value={cfg.shadow_offset_y}
                    min={-20}
                    max={20}
                    onChange={(v) => s("shadow_offset_y", v)}
                  />
                  <Knob
                    label="BLUR"
                    value={cfg.shadow_blur}
                    min={0}
                    max={15}
                    onChange={(v) => s("shadow_blur", v)}
                  />
                </div>
              )}
              <div className="fx-div" />
              <Sw
                label="Text Outline"
                sub="Border around letters"
                on={cfg.text_outline}
                onChange={(v) => s("text_outline", v)}
              />
              {cfg.text_outline && (
                <div className="effect-sub">
                  <div className="dfield">
                    <label className="dlbl">OUTLINE COLOR</label>
                    <div className="color-row">
                      <input
                        type="color"
                        className="cpick"
                        value={cfg.outline_color}
                        onChange={(e) => s("outline_color", e.target.value)}
                      />
                      <span className="chex">{cfg.outline_color}</span>
                    </div>
                  </div>
                  <Knob
                    label="WIDTH"
                    value={cfg.outline_width}
                    min={1}
                    max={12}
                    onChange={(v) => s("outline_width", v)}
                  />
                </div>
              )}
            </div>
          )}
          {designTab === "language" && (
            <div className="dgroup">
              <Sw
                label="Arabic / RTL Support"
                sub="Auto-detects per name"
                on={cfg.arabic_support}
                onChange={(v) => s("arabic_support", v)}
              />
              <div className="lang-note">
                <div className="lang-note-title">Arabic-friendly fonts</div>
                {["Traditional Arabic", "Arabic Typesetting", "Simplified Arabic", "Tahoma"].map((f) => (
                  <button
                    key={f}
                    className={cls("lang-font-btn", cfg.font_family === f && "lang-font-on")}
                    onClick={() => s("font_family", f)}
                  >
                    {f}
                  </button>
                ))}
                <div className="lang-note-hint">
                  Note: Canvas preview uses browser fonts. Final server-rendered badges may differ slightly for Arabic.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="design-footer">
          <div className="pname-box">
            <label className="dlbl">PREVIEW NAME</label>
            <input
              className="pname-inp"
              value={previewName}
              onChange={(e) => onPreviewNameChange(e.target.value)}
              placeholder="Type any name…"
            />
          </div>
          <div className="design-ctas">
            {canGallery && (
              <button className="cta cta-ghost" onClick={onBuildGallery}>
                🖼 Build Gallery
              </button>
            )}
            {canExport && (
              <button className="cta cta-on" onClick={onDownloadZip}>
                ⬇ Download ZIP
              </button>
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
            <span className="prev-dim">
              {templateImg.naturalWidth} × {templateImg.naturalHeight}px
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
