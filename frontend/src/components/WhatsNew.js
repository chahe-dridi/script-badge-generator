import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VERSION, CHANGELOG } from "../version";
import "../styles/WhatsNew.css";

const STORAGE_KEY = "badgegen_seen_version";

export default function WhatsNew() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== VERSION) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, VERSION);
    setVisible(false);
  }

  if (!visible) return null;

  const latest = CHANGELOG[0];

  return (
    <div className="wn-banner" role="status" aria-live="polite">
      <div className="wn-inner">
        <span className="wn-badge">✦ New in v{latest.version}</span>
        <p className="wn-note">{latest.note}</p>
        <Link to="/changelog" className="wn-link" onClick={dismiss}>
          See all
        </Link>
        <button className="wn-dismiss" onClick={dismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
