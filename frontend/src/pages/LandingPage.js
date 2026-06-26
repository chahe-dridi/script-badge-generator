import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconUpload, IconPalette, IconDownload, IconZap,
  IconPackage, IconGlobe, IconShield, IconSliders,
  IconEye, IconGithub, IconArrowRight, IconCheck
} from '../components/Icons';
import '../styles/Pages-Landing.css';

const FEATURES = [
  {
    icon: IconZap,
    title: "Instant Canvas Rendering",
    desc: "All badge generation runs in your browser via HTML5 Canvas. No server round-trips, no waiting.",
    accent: "a",
  },
  {
    icon: IconSliders,
    title: "Advanced Typography",
    desc: "Full control over font, size, weight, color, alignment, rotation, shadows, and outlines.",
    accent: "a2",
  },
  {
    icon: IconPackage,
    title: "Bulk ZIP Export",
    desc: "Import hundreds of names from CSV, TXT or Excel — export a ZIP of individual badge images.",
    accent: "a",
  },
  {
    icon: IconGlobe,
    title: "Arabic & RTL Support",
    desc: "Built-in Arabic reshaping and bidirectional text rendering so every name looks right.",
    accent: "a2",
  },
  {
    icon: IconEye,
    title: "Live Preview Gallery",
    desc: "See all badges in real-time before exporting. Edit individual entries on the fly.",
    accent: "a",
  },
  {
    icon: IconShield,
    title: "Privacy First",
    desc: "Nothing leaves your device. No account, no upload, no tracking. Works fully offline.",
    accent: "a2",
  },
];

const STEPS = [
  {
    icon: IconUpload,
    num: "01",
    title: "Upload your files",
    desc: "Drop your badge template image and a names file (TXT, CSV, or Excel). Drag & drop supported.",
  },
  {
    icon: IconPalette,
    num: "02",
    title: "Customize the design",
    desc: "Position your text with pixel precision. Adjust fonts, effects, colors, and more in real time.",
  },
  {
    icon: IconDownload,
    num: "03",
    title: "Export your badges",
    desc: "Review the gallery, make per-badge tweaks, then download a ZIP with all your badges.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="pg pg-landing">

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />{" "}
            Professional Badge Generator
          </div>

          <h1 className="hero-title">
            {"Design. Customize. "}
            <span className="hero-title-accent">Export.</span>
          </h1>

          <p className="hero-subtitle">
            Create personalized event badges at scale — directly in your browser.
            No sign-up, no server, no limits.
          </p>

          <div className="hero-actions">
            <button className="cta cta-lg cta-on hero-cta-primary" onClick={() => navigate('/setup')}>
              Start Generating
              <IconArrowRight size={16} />
            </button>
            <a
              href="https://github.com/chahe-dridi/script-badge-generator"
              target="_blank"
              rel="noreferrer"
              className="cta cta-lg cta-ghost hero-cta-secondary"
            >
              <IconGithub size={16} />
              View on GitHub
            </a>
          </div>

          <ul className="hero-checklist">
            {["Free & open source", "Works offline", "Up to 2000 badges per batch"].map(item => (
              <li key={item} className="hero-checklist-item">
                <IconCheck size={13} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="badge-stack">
            <div className="badge-card badge-card-back2" />
            <div className="badge-card badge-card-back1" />
            <div className="badge-card badge-card-main">
              <div className="badge-card-header">
                <div className="badge-card-logo-dot" />
                <span className="badge-card-event">TechConf 2025</span>
              </div>
              <div className="badge-card-body">
                <div className="badge-card-avatar">
                  <div className="badge-card-avatar-inner">AJ</div>
                </div>
                <div className="badge-card-name">ALEX JOHNSON</div>
                <div className="badge-card-role">Software Engineer</div>
                <div className="badge-card-divider" />
                <div className="badge-card-tag">SPEAKER</div>
              </div>
            </div>
          </div>

          {/* Floating decorative chips */}
          <div className="hero-chip hero-chip-1">
            <IconZap size={12} /> Canvas API
          </div>
          <div className="hero-chip hero-chip-2">
            <IconPackage size={12} /> ZIP Export
          </div>
          <div className="hero-chip hero-chip-3">
            <IconGlobe size={12} /> RTL Support
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-how">
        <div className="section-header">
          <p className="section-eyebrow">How it works</p>
          <h2 className="section-title">Three steps to your badges</h2>
        </div>

        <div className="how-steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.num}>
                <div className="how-step">
                  <div className="how-step-icon-wrap">
                    <Icon size={22} />
                  </div>
                  <div className="how-step-body">
                    <div className="how-step-num">{step.num}</div>
                    <h3 className="how-step-title">{step.title}</h3>
                    <p className="how-step-desc">{step.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="how-step-arrow" aria-hidden="true">
                    <IconArrowRight size={18} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <div className="section-header">
          <p className="section-eyebrow">Features</p>
          <h2 className="section-title">Everything you need</h2>
          <p className="section-subtitle">
            Built for event organizers who need professional results without complexity.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(feat => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className={`feat-card feat-accent-${feat.accent}`}>
                <div className="feat-icon-wrap">
                  <Icon size={20} />
                </div>
                <h3 className="feat-title">{feat.title}</h3>
                <p className="feat-desc">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta-banner">
        <div className="cta-banner-inner">
          <h2 className="cta-banner-title">Ready to create your badges?</h2>
          <p className="cta-banner-sub">Free, instant, and runs entirely in your browser.</p>
          <button className="cta cta-lg cta-on cta-banner-btn" onClick={() => navigate('/setup')}>
            Get Started
            <IconArrowRight size={16} />
          </button>
        </div>
      </section>

    </div>
  );
}
