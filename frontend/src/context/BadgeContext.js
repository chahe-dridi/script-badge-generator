import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { renderBadgeToCanvas, canvasToDataURL } from "../utils/canvas";

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

const BadgeContext = createContext();

export function BadgeProvider({ children }) {
  // Global App States
  const [cfg, setCfg] = useState(INIT_CFG);
  const [templateFile, setTF] = useState(null);
  const [templateImg, setTImg] = useState(null);
  const [namesFile, setNF] = useState(null);
  const [names, setNames] = useState([]);
  const [previewName, setPN] = useState("Sample Name");

  // Designs (Saved presets)
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try {
      const v = localStorage.getItem("badge_saved_designs");
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("badge_saved_designs", JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  // Gallery State
  const [gallery, setGallery] = useState([]);
  const [galLoading, setGL] = useState(false);
  const [galProgress, setGP] = useState(0);

  // Zip Export State
  const [zipLoading, setZL] = useState(false);
  const [zipProgress, setZP] = useState(0);
  const [zipDone, setZD] = useState(0);

  // Common UI State
  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Helpers
  const updateCfg = useCallback((key, value) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadDesign = useCallback((design) => {
    setCfg(design);
    notify("Design loaded!", "success");
  }, [notify]);

  const saveDesign = useCallback((name) => {
    const newDesign = { ...cfg, designName: name, id: Date.now() };
    setSavedDesigns(prev => [...prev, newDesign]);
    notify("Design saved!", "success");
  }, [cfg, notify]);

  const removeDesign = useCallback((id) => {
    setSavedDesigns(prev => prev.filter(d => d.id !== id));
    notify("Design removed", "info");
  }, [notify]);

  // Gallery actions
  const buildGallery = useCallback(async () => {
    if (!templateImg) return notify("Upload a template first", "error");
    if (names.length === 0 && !namesFile)
      return notify("Upload a names file first", "error");
    if (names.length === 0)
      return notify("Could not parse names — use TXT or CSV", "error");

    setGL(true);
    setGP(0);
    setGallery([]);

    const canvas = document.createElement("canvas");
    const results = [];
    for (let i = 0; i < names.length; i++) {
      renderBadgeToCanvas(canvas, templateImg, names[i], cfg);
      const dataUrl = canvasToDataURL(canvas);
      results.push({ _i: i, name: names[i], dataUrl, ok: !!dataUrl });
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

  const regenOne = useCallback(
    (id, newName, overrides) => {
      setGallery((g) => {
        const itemIdx = g.findIndex(b => b._i === id);
        if (itemIdx === -1) return g;
        
        const item = g[itemIdx];
        const name = newName !== undefined ? newName : item.name;
        
        let newCustomCfg = item.customCfg;
        if (overrides !== undefined) {
          newCustomCfg = { ...(item.customCfg || {}) };
          for (const k in overrides) {
            if (overrides[k] === undefined) {
              delete newCustomCfg[k];
            } else {
              newCustomCfg[k] = overrides[k];
            }
          }
          if (Object.keys(newCustomCfg).length === 0) newCustomCfg = null;
        }
        
        const bCfg = { ...cfg, ...(newCustomCfg || {}) };
        
        const canvas = document.createElement("canvas");
        renderBadgeToCanvas(canvas, templateImg, name, bCfg);
        const dataUrl = canvasToDataURL(canvas);
        
        const newG = [...g];
        newG[itemIdx] = { ...item, name, dataUrl, ok: !!dataUrl, customCfg: newCustomCfg };
        return newG;
      });
      return true;
    },
    [templateImg, cfg]
  );

  const removeBadge = useCallback((id) => {
    setGallery((g) => g.filter((b) => b._i !== id));

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

  const downloadZip = useCallback(async () => {
    if (!templateFile && !templateImg) return notify("Upload a template first", "error");
    if (!namesFile && names.length === 0)
      return notify("Upload a names file first", "error");

    const eventName = cfg.event_name.trim() || "Badges";

    setZL(true);
    setZP(0);
    setZD(0);

    const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

    if (gallery.length > 0) {
      try {
        if (!window.JSZip) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const zip = new window.JSZip();
        const folder = zip.folder(eventName);
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
        a.download = `${eventName}.zip`;
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
        fd.append("settings", JSON.stringify({...cfg, event_name: eventName}));
        const res = await fetch(API + "/generate", { method: "POST", body: fd });
        clearInterval(sim);
        if (!res.ok) throw new Error((await res.json()).detail || "Failed");
        const blob = await res.blob();
        setZP(100);
        setZD(total);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${eventName}.zip`;
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
  }, [templateFile, templateImg, namesFile, names, cfg, gallery, notify]);

  const resetAll = useCallback(() => {
    setCfg(INIT_CFG);
    setTF(null);
    setTImg(null);
    setNF(null);
    setNames([]);
    setGallery([]);
  }, []);

  const value = {
    cfg, setCfg, updateCfg,
    templateFile, setTF,
    templateImg, setTImg,
    namesFile, setNF,
    names, setNames,
    previewName, setPN,
    gallery, setGallery,
    galLoading, setGL,
    galProgress, setGP,
    zipLoading, zipProgress, zipDone,
    toast, notify,
    savedDesigns, loadDesign, saveDesign, removeDesign,
    buildGallery, regenOne, removeBadge, removeGalleryItem: removeBadge, regenAll, downloadZip, resetAll, INIT_CFG
  };

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
}

export function useBadgeContext() {
  return useContext(BadgeContext);
}
