import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBadgeContext } from "../context/BadgeContext";
import { parseNamesFile } from "../utils/canvas";
import "../styles/Pages-Setup.css";

export default function SetupPage() {
  const navigate = useNavigate();
  const {
    cfg, updateCfg,
    templateFile, setTF,
    templateImg, setTImg,
    namesFile, setNF,
    names, setNames,
    setGallery, notify
  } = useBadgeContext();

  const [dragOver, setDO] = useState(null);
  const tRef = useRef();
  const nRef = useRef();
  const previewCanvasRef = useRef();

  const loadTemplate = (file) => {
    if (!file || !file.type.startsWith("image/"))
      return notify("Upload an image file", "error");
    setTF(file);
    setGallery([]);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setTImg(img);
    img.src = url;
    notify("Template loaded ✓", "success");
  };

  const loadNames = async (file) => {
    setNF(file);
    const arr = await parseNamesFile(file);
    setNames(arr);
    if (arr.length) notify(`${arr.length} names loaded ✓`, "success");
    else notify("File loaded — Excel names resolved at generation time", "info");
  };

  const onDrop = (e, type) => {
    e.preventDefault();
    setDO(null);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (type === "tpl") loadTemplate(f);
    else loadNames(f);
  };

  const canDesign = !!templateImg;

  return (
    <div className="pg pg-setup">
      <div className="setup-hero">
        <h1>
          Create <em>stunning</em>
          <br />
          event badges
        </h1>
        <p>Upload a template, add names, get personalized badges in seconds.</p>
      </div>

      <div className="setup-grid">
        {/* Template */}
        <div
          className={`ucard ${templateImg ? "ucard-done" : ""} ${
            dragOver === "tpl" ? "ucard-drag" : ""
          }`}
          onClick={() => tRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDO("tpl");
          }}
          onDragLeave={() => setDO(null)}
          onDrop={(e) => onDrop(e, "tpl")}
        >
          <input
            ref={tRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => loadTemplate(e.target.files[0])}
          />
          {templateImg && templateFile ? (
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
              <div className="ucard-hint">
                PNG · JPG · BMP
                <br />
                Drag & drop
              </div>
            </>
          )}
        </div>

        {/* Names */}
        <div
          className={`ucard ${namesFile ? "ucard-done" : ""} ${
            dragOver === "names" ? "ucard-drag" : ""
          }`}
          onClick={() => nRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDO("names");
          }}
          onDragLeave={() => setDO(null)}
          onDrop={(e) => onDrop(e, "names")}
        >
          <input
            ref={nRef}
            type="file"
            accept=".txt,.csv,.xlsx,.xls"
            hidden
            onChange={(e) => loadNames(e.target.files[0])}
          />
          {namesFile ? (
            <>
              <div className="ucard-names-list">
                {names.slice(0, 5).map((n, i) => (
                  <div key={i} className="ucard-name-row">
                    {n}
                  </div>
                ))}
                {names.length > 5 && (
                  <div className="ucard-name-more">+{names.length - 5} more names</div>
                )}
                {names.length === 0 && (
                  <div className="ucard-name-more">Excel file — names load at generation</div>
                )}
              </div>
              <div className="ucard-info">
                <div className="ucard-check">✓</div>
                <div className="ucard-name">{namesFile.name}</div>
                <div className="ucard-change">
                  {names.length > 0 ? `${names.length} names` : "Excel"} · Click to change
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="ucard-plus">+</div>
              <div className="ucard-title">Names List</div>
              <div className="ucard-hint">
                TXT · CSV · Excel
                <br />
                Drag & drop
              </div>
            </>
          )}
        </div>

        {/* Event name */}
        <div className={`ucard ${cfg.event_name ? "ucard-done" : ""}`} onClick={(e) => e.stopPropagation()}>
          <div className="ucard-plus">🎫</div>
          <div className="ucard-title">Event Name</div>
          <input
            className="event-inp"
            placeholder="e.g. Tech Summit 2025"
            value={cfg.event_name}
            onChange={(e) => updateCfg("event_name", e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="ucard-hint">Becomes the folder name in your ZIP</div>
        </div>
      </div>

      <div className="setup-foot">
        <button
          className={`cta ${canDesign ? "cta-on" : ""}`}
          disabled={!canDesign}
          onClick={() => navigate('/design')}
        >
          Continue to Design →
        </button>
        {!canDesign && (
          <div className="setup-req">Upload a template image to continue</div>
        )}
      </div>
    </div>
  );
}
