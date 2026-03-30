import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBadgeContext } from "../context/BadgeContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { cfg } = useBadgeContext();
  const location = useLocation();
  const navigate = useNavigate();

  const STEPS = [
    { label: "Setup", path: "/setup" },
    { label: "Design", path: "/design" },
    { label: "Gallery", path: "/gallery" },
    { label: "Export", path: "/export" }
  ];

  const isLanding = location.pathname === "/";
  const currentIndex = STEPS.findIndex(s => s.path === location.pathname);
  const event_name = cfg.event_name;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-mark">B</div>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}><span className="nav-brand-name" style={{ color: "var(--txt)" }}>BadgeGen</span></Link>
        {!isLanding && event_name && <span className="nav-event">{event_name}</span>}
      </div>

      {!isLanding && (<div className="nav-steps">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            <button
              className={`nav-step ${i < currentIndex ? "nav-step-done" : ""} ${i === currentIndex ? "nav-step-active" : ""}`}
              onClick={() => i < currentIndex && navigate(step.path)}
              disabled={i > currentIndex}
            >
              <div className="nav-step-num">{i < currentIndex ? "✓" : i + 1}</div>
              <span className="nav-step-lbl">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`nav-step-line ${i < currentIndex ? "nav-step-line-done" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      )}

      <div className="nav-end">
        {!isLanding && currentIndex > 0 && (
          <button
            className="nav-back"
            onClick={() => navigate(STEPS[currentIndex - 1].path)}
          >
            ← Back
          </button>
        )}
        {isLanding && <button className="cta cta-sm cta-on" onClick={() => navigate("/setup")}>Launch App →</button>}
      </div>
    </nav>
  );
}
