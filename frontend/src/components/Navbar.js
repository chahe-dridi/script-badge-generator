import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBadgeContext } from "../context/BadgeContext";
import { useAuth } from "../context/AuthContext";
import {
  IconBadge, IconUpload, IconPalette, IconGrid,
  IconDownload, IconCheck, IconArrowLeft, IconArrowRight,
  IconUserCircle
} from "./Icons";
import "../styles/Navbar.css";

const STEPS = [
  { label: "Setup",   path: "/setup",   icon: IconUpload   },
  { label: "Design",  path: "/design",  icon: IconPalette  },
  { label: "Gallery", path: "/gallery", icon: IconGrid     },
  { label: "Export",  path: "/export",  icon: IconDownload },
];

const APP_PATHS = new Set(["/setup", "/design", "/gallery", "/export"]);

export default function Navbar() {
  const { cfg } = useBadgeContext();
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  const isLanding   = location.pathname === "/";
  const isAppFlow   = APP_PATHS.has(location.pathname);
  const currentIndex = STEPS.findIndex(s => s.path === location.pathname);
  const event_name  = cfg.event_name;

  return (
    <nav className="navbar">

      {/* ── Brand ── */}
      <div className="nav-brand">
        <Link to="/" className="nav-brand-link">
          <div className="nav-brand-mark">
            <IconBadge size={18} />
          </div>
          <span className="nav-brand-name">BadgeGen</span>
        </Link>
        {isAppFlow && event_name && (
          <span className="nav-event" title={event_name}>{event_name}</span>
        )}
      </div>

      {/* ── Step progress (app flow only) ── */}
      {isAppFlow && (
        <div className="nav-steps">
          {/* Compact counter on mobile */}
          <div className="nav-steps-counter">
            Step {currentIndex + 1} / {STEPS.length}
          </div>

          {/* Full step list on larger screens */}
          <div className="nav-steps-list">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone     = i < currentIndex;
              const isActive   = i === currentIndex;
              const isDisabled = i > currentIndex;

              let stepState = "(locked)";
              if (isDone) stepState = "(completed)";
              else if (isActive) stepState = "(current)";

              return (
                <React.Fragment key={step.label}>
                  <button
                    className={`nav-step${isDone ? " nav-step-done" : ""}${isActive ? " nav-step-active" : ""}${isDisabled ? " nav-step-disabled" : ""}`}
                    onClick={() => isDone && navigate(step.path)}
                    disabled={isDisabled}
                    title={step.label}
                    aria-label={`${step.label} ${stepState}`}
                  >
                    <div className="nav-step-icon">
                      {isDone ? <IconCheck size={13} /> : <Icon size={15} />}
                    </div>
                    <span className="nav-step-lbl">{step.label}</span>
                  </button>

                  {i < STEPS.length - 1 && (
                    <div className={`nav-step-connector${isDone ? " nav-step-connector-done" : ""}`}>
                      <div className="nav-step-connector-line" />
                      <IconArrowRight size={10} className="nav-step-connector-arrow" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Right-side actions ── */}
      <div className="nav-end">
        {/* Back button — app flow, not first step */}
        {isAppFlow && currentIndex > 0 && (
          <button
            className="nav-back"
            onClick={() => navigate(STEPS[currentIndex - 1].path)}
            title={`Back to ${STEPS[currentIndex - 1].label}`}
          >
            <IconArrowLeft size={15} />
            <span className="nav-back-lbl">Back</span>
          </button>
        )}

        {/* Launch button — landing page only */}
        {isLanding && (
          <button
            className="cta cta-sm cta-on nav-launch-btn"
            onClick={() => navigate("/setup")}
          >
            Launch App
            <IconArrowRight size={13} />
          </button>
        )}

        {/* Account — reflects auth state (hidden until the session resolves) */}
        {!loading && (
          user ? (
            <div className="nav-account">
              <span className="nav-account-chip" title={user.email}>
                <IconUserCircle size={17} />
                <span className="nav-account-name">
                  {user.full_name || user.email.split("@")[0]}
                </span>
                <span className="nav-account-plan">{user.plan}</span>
              </span>
              <button className="nav-signout" onClick={handleSignOut} title="Sign out">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-signin" title="Sign in">
              <IconUserCircle size={17} />
              <span className="nav-signin-lbl">Sign In</span>
            </Link>
          )
        )}
      </div>

    </nav>
  );
}
