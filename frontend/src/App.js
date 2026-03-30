import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import "./App.css";
import "./styles/Global.css";
import "./styles/Layout.css";

import Layout from "./components/Layout";
import SetupPage from "./pages/SetupPage";
import DesignPage from "./pages/DesignPage";
import GalleryPage from "./pages/GalleryPage";
import ExportPage from "./pages/ExportPage";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const INIT_CFG = {
  event_name: "",
  font_family: "Arial",
  font_size: 48,
  font_style: "normal",
  font_weight: "normal",
  font_color: "#1a1a2e",
  text_x: 400,
  text_y: 300,
  text_align: "center",
  text_shadow: false,
  shadow_color: "#333333",
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

// ─── Render badge to canvas ──────────────────────────────────────────────
function renderBadgeToCanvas(canvas, templateImg, name, cfg) {
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

function canvasToDataURL(canvas) {
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

// ─── Parse names file ────────────────────────────────────────────────────
async function parseNamesFile(file) {
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

// ─── Toast component ─────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  // State
  const [page, setPage] = useState(0);
  const [cfg, setCfg] = useState(INIT_CFG);
  const [templateFile, setTF] = useState(null);
  const [templateImg, setTImg] = useState(null);
  const [namesFile, setNF] = useState(null);
  const [names, setNames] = useState([]);
  const [previewName, setPN] = useState("Sample Name");
  const [gallery, setGallery] = useState([]);
  const [galLoading, setGL] = useState(false);
  const [galProgress, setGP] = useState(0);
  const [selIdx, setSel] = useState(null);
  const [editName, setEN] = useState("");
  const [zipLoading, setZL] = useState(false);
  const [zipProgress, setZP] = useState(0);
  const [zipDone, setZD] = useState(0);
  const [toast, setToast] = useState(null);
  const [dragOver, setDO] = useState(null);
  const [galFilter, setGF] = useState("");
  const [regenSel, setRS] = useState(false);

  const tRef = useRef();
  const nRef = useRef();
  const previewCanvasRef = useRef();

  // Utilities
  const s = useCallback((k, v) => setCfg((c) => ({ ...c, [k]: v })), []);

  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Instant preview ──────────────────────────────────────────────────
  useEffect(() => {
    if (!previewCanvasRef.current || !templateImg) return;
    renderBadgeToCanvas(previewCanvasRef.current, templateImg, previewName, cfg);
  });

  // ─── Load template ────────────────────────────────────────────────────
  const loadTemplate = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/"))
        return notify("Upload an image file", "error");
      setTF(file);
      setGallery([]);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setTImg(img);
      };
      img.src = url;
      notify("Template loaded ✓", "success");
    },
    [notify]
  );

  // ─── Load names ──────────────────────────────────────────────────────
  const loadNames = useCallback(
    async (file) => {
      setNF(file);
      const arr = await parseNamesFile(file);
      setNames(arr);
      if (arr.length) notify(`${arr.length} names loaded ✓`, "success");
      else notify("File loaded — Excel names resolved at generation time", "info");
    },
    [notify]
  );

  // ─── Drag & drop ──────────────────────────────────────────────────────
  const onDrop = useCallback(
    (e, type) => {
      e.preventDefault();
      setDO(null);
      const f = e.dataTransfer.files[0];
      if (!f) return;
      if (type === "tpl") loadTemplate(f);
      else loadNames(f);
    },
    [loadTemplate, loadNames]
  );

  // ─── Build gallery ────────────────────────────────────────────────────
  const buildGallery = useCallback(async () => {
    if (!templateImg) return notify("Upload a template first", "error");
    if (names.length === 0 && !namesFile)
      return notify("Upload a names file first", "error");
    if (names.length === 0)
      return notify("Could not parse names — use TXT or CSV", "error");

    setGL(true);
    setGP(0);
    setGallery([]);
    setPage(2);
    setSel(null);

    const canvas = document.createElement("canvas");
    const results = [];
    for (let i = 0; i < names.length; i++) {
      renderBadgeToCanvas(canvas, templateImg, names[i], cfg);
      const dataUrl = canvasToDataURL(canvas);
      results.push({ name: names[i], dataUrl, ok: !!dataUrl });
      if (i % 5 === 0) {
        setGallery([...results]);
        setGP(Math.round(((i + 1) / names.length) * 100));
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    setGallery([...results]);
    setGP(100);
    setGL(false);
    notify(`${results.length} badges generated ✓`, "success");
  }, [templateImg, names, namesFile, cfg, notify]);

  // ─── Regen one badge ──────────────────────────────────────────────────
  const regenOne = useCallback(
    (idx, newName) => {
      const name = newName ?? gallery[idx].name;
      setRS(true);
      const canvas = document.createElement("canvas");
      renderBadgeToCanvas(canvas, templateImg, name, cfg);
      const dataUrl = canvasToDataURL(canvas);
      setGallery((g) =>
        g.map((b, i) => (i === idx ? { name, dataUrl, ok: !!dataUrl } : b))
      );
      setRS(false);
      return dataUrl;
    },
    [gallery, templateImg, cfg]
  );

  // ─── Remove badge ─────────────────────────────────────────────────────
  const removeBadge = useCallback((idx) => {
    setGallery((g) => g.filter((_, i) => i !== idx));
  }, []);

  // ─── Regen all ────────────────────────────────────────────────────────
  const regenAll = useCallback(async () => {
    if (!templateImg || gallery.length === 0) return;
    setGL(true);
    setGP(0);
    const canvas = document.createElement("canvas");
    const updated = [];
    for (let i = 0; i < gallery.length; i++) {
      renderBadgeToCanvas(canvas, templateImg, gallery[i].name, cfg);
      updated.push({
        ...gallery[i],
        dataUrl: canvasToDataURL(canvas),
        ok: true,
      });
      if (i % 10 === 0) {
        setGallery([...updated, ...gallery.slice(i + 1)]);
        setGP(Math.round(((i + 1) / gallery.length) * 100));
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    setGallery(updated);
    setGL(false);
    setGP(100);
    notify("All badges updated ✓", "success");
  }, [gallery, templateImg, cfg, notify]);

  // ─── Download ZIP ─────────────────────────────────────────────────────
  const downloadZip = useCallback(async () => {
    if (!templateFile) return notify("Upload a template first", "error");
    if (!namesFile && names.length === 0)
      return notify("Upload a names file first", "error");
    if (!cfg.event_name.trim())
      return notify("Enter an event name first", "error");

    setZL(true);
    setZP(0);
    setZD(0);
    setPage(3);

    if (gallery.length > 0) {
      try {
        if (!window.JSZip) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src =
              "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const zip = new window.JSZip();
        const folder = zip.folder(cfg.event_name);
        const total = gallery.length;
        for (let i = 0; i < total; i++) {
          const b = gallery[i];
          if (!b.dataUrl) continue;
          const base64 = b.dataUrl.split(",")[1];
          const safe = b.name
            .replace(/[^a-zA-Z0-9\u0600-\u06FF _-]/g, "")
            .trim()
            .replace(/\s+/g, "_") || `badge_${i + 1}`;
          folder.file(`${safe}_badge.png`, base64, { base64: true });
          setZD(i + 1);
          setZP(Math.round(((i + 1) / total) * 90));
          if (i % 20 === 0) await new Promise((r) => setTimeout(r, 0));
        }
        setZP(95);
        const blob = await zip.generateAsync({ type: "blob" });
        setZP(100);
        setZD(total);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cfg.event_name}_badges.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify("ZIP downloaded! 🎉", "success");
      } catch (e) {
        notify("Client ZIP failed, trying server… " + e.message, "error");
      }
    } else {
      try {
        const total = names.length || 1;
        let simCount = 0;
        const sim = setInterval(() => {
          simCount = Math.min(simCount + Math.ceil(total * 0.04), total - 1);
          setZD(simCount);
          setZP((p) => Math.min(p + 3, 80));
        }, 600);
        const fd = new FormData();
        fd.append("template", templateFile);
        fd.append("names_file", namesFile);
        fd.append("settings", JSON.stringify(cfg));
        const res = await fetch(API + "/generate", {
          method: "POST",
          body: fd,
        });
        clearInterval(sim);
        if (!res.ok) throw new Error((await res.json()).detail || "Failed");
        const blob = await res.blob();
        setZP(100);
        setZD(total);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cfg.event_name}_badges.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify("ZIP downloaded! 🎉", "success");
      } catch (e) {
        notify(
          e.name === "AbortError"
            ? "Timed out — server waking up, retry in 30s"
            : e.message,
          "error"
        );
      }
    }
    setZL(false);
  }, [templateFile, namesFile, names, cfg, gallery, notify]);

  // ─── Filtered gallery ──────────────────────────────────────────────────
  const filteredGallery = useMemo(() => {
    if (!galFilter.trim()) return gallery.map((b, i) => ({ ...b, _i: i }));
    const q = galFilter.toLowerCase();
    return gallery
      .map((b, i) => ({ ...b, _i: i }))
      .filter((b) => b.name.toLowerCase().includes(q));
  }, [gallery, galFilter]);

  const selectedBadge = selIdx !== null ? gallery[selIdx] : null;

  const canDesign = !!templateImg;
  const canGallery = !!templateImg && names.length > 0;
  const canExport =
    !!templateFile && !!(namesFile || names.length > 0) && !!cfg.event_name.trim();

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <Layout page={page} onPageChange={setPage} event_name={cfg.event_name}>
      <div className="noise" />

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {page === 0 && (
        <SetupPage
          templateImg={templateImg}
          templateFile={templateFile}
          namesFile={namesFile}
          names={names}
          cfg={cfg}
          dragOver={dragOver}
          tRef={tRef}
          nRef={nRef}
          onLoadTemplate={loadTemplate}
          onLoadNames={loadNames}
          onDrop={onDrop}
          onSetDragOver={setDO}
          onEventNameChange={(v) => s("event_name", v)}
          onContinue={() => setPage(1)}
          previewCanvasRef={previewCanvasRef}
        />
      )}

      {page === 1 && (
        <DesignPage
          cfg={cfg}
          onCfgChange={s}
          previewName={previewName}
          onPreviewNameChange={setPN}
          templateImg={templateImg}
          previewCanvasRef={previewCanvasRef}
          canGallery={canGallery}
          canExport={canExport}
          onBuildGallery={buildGallery}
          onDownloadZip={downloadZip}
        />
      )}

      {page === 2 && (
        <GalleryPage
          gallery={gallery}
          galLoading={galLoading}
          galProgress={galProgress}
          galFilter={galFilter}
          onGalFilterChange={setGF}
          selIdx={selIdx}
          onSelIdxChange={setSel}
          editName={editName}
          onEditNameChange={setEN}
          regenSel={regenSel}
          selectedBadge={selectedBadge}
          filteredGallery={filteredGallery}
          onRegenAll={regenAll}
          onRegenOne={regenOne}
          onDownloadZip={downloadZip}
          onEditDesign={() => setPage(1)}
          canExport={canExport}
          onRemoveBadge={removeBadge}
        />
      )}

      {page === 3 && (
        <ExportPage
          zipLoading={zipLoading}
          zipProgress={zipProgress}
          zipDone={zipDone}
          gallery={gallery}
          onDownloadZip={downloadZip}
          onBackToGallery={() => setPage(2)}
          onEditDesign={() => setPage(1)}
          onNewProject={() => {
            setPage(0);
            setCfg(INIT_CFG);
            setTF(null);
            setTImg(null);
            setNF(null);
            setNames([]);
            setGallery([]);
            setSel(null);
          }}
        />
      )}
    </Layout>
  );
}