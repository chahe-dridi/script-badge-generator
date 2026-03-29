import React from "react";
import "../styles/Navbar.css";

export default function Navbar({ page, onPageChange, event_name }) {
  const STEPS = ["Setup", "Design", "Gallery", "Export"];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-mark">B</div>
        <span className="nav-brand-name">BadgeGen</span>
        {event_name && <span className="nav-event">{event_name}</span>}
      </div>

      <div className="nav-steps">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <button
              className={`nav-step ${i < page ? "nav-step-done" : ""} ${i === page ? "nav-step-active" : ""}`}
              onClick={() => i < page && onPageChange(i)}
              disabled={i > page}
            >
              <div className="nav-step-num">{i < page ? "✓" : i + 1}</div>
              <span className="nav-step-lbl">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`nav-step-line ${i < page ? "nav-step-line-done" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="nav-end">
        {page > 0 && (
          <button
            className="nav-back"
            onClick={() => onPageChange(Math.max(0, page - 1))}
          >
            ← Back
          </button>
        )}
      </div>
    </nav>
  );
}
