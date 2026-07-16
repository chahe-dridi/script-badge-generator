import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconUpload, IconPalette, IconDownload, IconZap,
  IconPackage, IconGlobe, IconShield, IconSliders,
  IconEye, IconGithub, IconArrowRight, IconCheck, IconX
} from '../components/Icons';
import { api } from '../api/client';
import { useBadgeContext } from '../context/BadgeContext';
import { SAMPLE_PRESETS, loadPreset } from '../utils/sampleTemplates';
import '../styles/Pages-Landing.css';

const DEFAULT_PLANS = [
  { tier: 'free',  label: 'Free',    price_usd: 0,  max_projects: 3,    max_batch: 50,   watermark: true,  pdf_export: false },
  { tier: 'pro',   label: 'Pro',     price_usd: 9,  max_projects: 50,   max_batch: 5000, watermark: false, pdf_export: true  },
  { tier: 'team',  label: 'Premier', price_usd: 29, max_projects: null, max_batch: null, watermark: false, pdf_export: true  },
];

function planFeatures(p) {
  const projects = p.max_projects === null ? 'Unlimited projects' : `${p.max_projects} projects`;
  const batch    = p.max_batch    === null ? 'Unlimited badges/batch' : `Up to ${p.max_batch.toLocaleString()} badges/batch`;
  return [
    { text: projects,                  included: true },
    { text: batch,                     included: true },
    { text: 'CSV, TXT, Excel import',  included: true },
    { text: 'No watermark',            included: !p.watermark },
    { text: 'PDF export',              included: !!p.pdf_export },
    { text: 'Priority support',        included: p.tier === 'team' },
  ];
}

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
  const navigate   = useNavigate();
  const badgeCtx   = useBadgeContext();
  const canvasRefs = useRef({});

  const [plans,    setPlans]    = useState(DEFAULT_PLANS);
  const [loading,  setLoading]  = useState(null); // preset id being loaded

  useEffect(() => {
    api.plans()
      .then(data => { if (data?.length) setPlans(data); })
      .catch(() => {});
  }, []);

  // Render each preset's mini preview onto its canvas once mounted
  useEffect(() => {
    SAMPLE_PRESETS.forEach(preset => {
      const canvas = canvasRefs.current[preset.id];
      if (canvas) {
        canvas.width  = preset.width;
        canvas.height = preset.height;
        preset.draw(canvas);
      }
    });
  }, []);

  async function tryPreset(preset) {
    setLoading(preset.id);
    try {
      await loadPreset(preset, badgeCtx);
      navigate('/design');
    } catch {
      setLoading(null);
    }
  }

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

      {/* ── Try it ── */}
      <section className="landing-try">
        <div className="section-header">
          <p className="section-eyebrow">Live demo</p>
          <h2 className="section-title">Try a sample — right now</h2>
          <p className="section-subtitle">
            Pick a ready-made template and names list, then jump straight to the design step.
          </p>
        </div>

        <div className="try-grid">
          {SAMPLE_PRESETS.map(preset => (
            <div key={preset.id} className={`try-card try-theme-${preset.theme}`}>
              <div className="try-canvas-wrap">
                <canvas
                  ref={el => { canvasRefs.current[preset.id] = el; }}
                  className="try-canvas"
                  aria-label={`${preset.title} badge template preview`}
                />
              </div>
              <div className="try-card-body">
                <div className="try-card-meta">
                  <div className="try-card-title">{preset.title}</div>
                  <div className="try-card-subtitle">{preset.subtitle}</div>
                </div>
                <div className="try-names-preview">
                  {preset.names.slice(0, 3).map(n => (
                    <span key={n} className="try-name-chip">{n}</span>
                  ))}
                  <span className="try-name-more">+{preset.names.length - 3} names</span>
                </div>
                <button
                  className={`cta cta-on try-btn${loading === preset.id ? ' try-btn-loading' : ''}`}
                  disabled={loading !== null}
                  onClick={() => tryPreset(preset)}
                >
                  {loading === preset.id ? (
                    <>
                      <span className="try-spinner" />{" "}
                      Loading…
                    </>
                  ) : (
                    <>
                      Try this template{" "}
                      <IconArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
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

      {/* ── Pricing ── */}
      <section className="landing-pricing">
        <div className="section-header">
          <p className="section-eyebrow">Pricing</p>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">
            Start free — upgrade when you need more power.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map(plan => {
            const isPro     = plan.tier === 'pro';
            const isPremier = plan.tier === 'team';
            const label     = isPremier ? 'Premier' : plan.label;
            const features  = planFeatures(plan);
            let ctaLabel = 'Get Pro';
            if (plan.tier === 'free') ctaLabel = 'Start Free';
            else if (isPremier) ctaLabel = 'Contact Us';
            const ctaPath   = plan.tier === 'free' ? '/setup' : '/register';

            return (
              <div key={plan.tier} className={`pricing-card${isPro ? ' pricing-card-featured' : ''}`}>
                {isPro && <div className="pricing-popular-badge">Most Popular</div>}
                <div className={`pricing-tier-chip pricing-tier-${plan.tier}`}>{plan.tier.toUpperCase()}</div>
                <div className="pricing-label">{label}</div>
                <div className="pricing-price">
                  <span className="pricing-amount">${plan.price_usd}</span>
                  <span className="pricing-period">{plan.price_usd === 0 ? 'forever' : '/month'}</span>
                </div>
                <ul className="pricing-features">
                  {features.map(f => (
                    <li key={f.text} className={`pricing-feature${f.included ? '' : ' pricing-feature-no'}`}>
                      {f.included
                        ? <IconCheck size={13} />
                        : <IconX size={13} />}
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  className={`cta pricing-cta${isPro ? ' cta-on' : ' cta-ghost'}`}
                  onClick={() => navigate(ctaPath)}
                >
                  {ctaLabel}
                  <IconArrowRight size={14} />
                </button>
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
