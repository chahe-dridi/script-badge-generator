import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconGithub, IconCode, IconZap, IconGlobe, IconShield, IconExternalLink } from '../components/Icons';
import '../styles/Pages-Legal.css';

export default function AboutPage() {
  return (
    <div className="pg pg-legal">
      <article className="legal-article">

        <Link to="/" className="legal-back">
          <IconArrowLeft size={14} /> Back to Home
        </Link>

        <p className="legal-eyebrow">Who we are</p>
        <h1 className="legal-title">About BadgeGen</h1>
        <p className="legal-meta">Open-source project · Built with care</p>

        {/* Stats row */}
        <div className="about-hero-grid">
          <div className="about-stat-card">
            <div className="about-stat-value">2000+</div>
            <div className="about-stat-label">Badges per batch</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-value">100%</div>
            <div className="about-stat-label">Client-side</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-value">0</div>
            <div className="about-stat-label">Data uploaded</div>
          </div>
          <div className="about-stat-card">
            <div className="about-stat-value">Free</div>
            <div className="about-stat-label">Forever</div>
          </div>
        </div>

        <div className="legal-section">
          <h2>What is BadgeGen?</h2>
          <p>
            BadgeGen is a free, open-source browser tool that lets event organizers
            create personalized name badges at scale — without needing a server,
            a subscription, or a design background.
          </p>
          <p>
            Upload your badge template, import a list of attendee names from a CSV,
            TXT, or Excel file, position your text with pixel-level control, and
            export a ZIP file of individual badge images in seconds.
          </p>
          <div className="legal-highlight">
            <p>
              Everything runs inside your browser using the HTML5 Canvas API.
              No files are ever sent to a server. Your attendee data stays private.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2>Our mission</h2>
          <p>
            Professional badge generation has historically required expensive software,
            design skills, or slow print-on-demand services. We built BadgeGen to
            remove every one of those barriers.
          </p>
          <p>
            Our goal is simple: anyone organizing an event — a school workshop, a
            corporate conference, a community meetup — should be able to produce
            polished, consistent name badges in under five minutes.
          </p>
        </div>

        <div className="legal-section">
          <h2>Features at a glance</h2>
          <ul>
            <li><strong>Instant canvas rendering</strong> — badges generated in real time, no waiting.</li>
            <li><strong>Bulk processing</strong> — import hundreds of names at once from CSV, TXT, or XLSX.</li>
            <li><strong>Advanced typography</strong> — font, size, weight, rotation, shadow, and outline controls.</li>
            <li><strong>Arabic & RTL support</strong> — built-in text reshaping and bidirectional rendering.</li>
            <li><strong>Per-badge overrides</strong> — edit individual badges in the gallery before exporting.</li>
            <li><strong>ZIP export</strong> — download all badges as individual PNG files in one click.</li>
            <li><strong>Design presets</strong> — save and reload your typography settings across sessions.</li>
            <li><strong>Offline capable</strong> — once loaded, the app works without an internet connection.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Tech stack</h2>
          <p>BadgeGen is built entirely with open web standards:</p>
          <div className="about-stack-pills">
            <span className="about-pill about-pill-a2">React 18</span>
            <span className="about-pill about-pill-a">HTML5 Canvas</span>
            <span className="about-pill about-pill-a2">React Router v7</span>
            <span className="about-pill about-pill-a">JSZip</span>
            <span className="about-pill about-pill-a2">arabic-reshaper</span>
            <span className="about-pill about-pill-muted">Python / FastAPI (optional backend)</span>
            <span className="about-pill about-pill-muted">Pillow</span>
          </div>
          <p style={{ marginTop: '16px' }}>
            Icons are hand-crafted SVGs following the Feather icon grid — no icon fonts,
            no external dependencies, no AI-generated assets.
          </p>
        </div>

        <div className="legal-section">
          <h2>Core values</h2>
          <ul>
            <li>
              <IconZap size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px', color:'var(--a)' }} />
              <strong>Speed</strong> — from upload to download in under a minute.
            </li>
            <li>
              <IconShield size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px', color:'var(--a)' }} />
              <strong>Privacy</strong> — zero telemetry, zero uploads, zero accounts required.
            </li>
            <li>
              <IconGlobe size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px', color:'var(--a)' }} />
              <strong>Accessibility</strong> — RTL support, WCAG-compliant contrast, keyboard-navigable.
            </li>
            <li>
              <IconCode size={14} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px', color:'var(--a)' }} />
              <strong>Open source</strong> — MIT licensed, community contributions welcome.
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Roadmap</h2>
          <p>We're actively developing BadgeGen. Planned features include:</p>
          <ul>
            <li>User accounts with cloud-saved templates and designs</li>
            <li>Team workspaces for collaborative badge creation</li>
            <li>QR code integration per badge</li>
            <li>More export formats (PDF, SVG)</li>
            <li>Template marketplace</li>
          </ul>
          <p>
            Follow development and contribute on{' '}
            <a href="https://github.com/chahe-dridi/script-badge-generator" target="_blank" rel="noreferrer">
              GitHub <IconExternalLink size={12} style={{ display:'inline', verticalAlign:'middle' }} />
            </a>.
          </p>
        </div>

        <div className="legal-section">
          <h2>Contact</h2>
          <p>
            Found a bug? Have a feature request? Open an issue on{' '}
            <a href="https://github.com/chahe-dridi/script-badge-generator/issues" target="_blank" rel="noreferrer">
              GitHub Issues <IconExternalLink size={12} style={{ display:'inline', verticalAlign:'middle' }} />
            </a>
            . Pull requests are always welcome.
          </p>
          <div style={{ marginTop: '16px' }}>
            <a
              href="https://github.com/chahe-dridi/script-badge-generator"
              target="_blank"
              rel="noreferrer"
              className="cta cta-on"
              style={{ display:'inline-flex', alignItems:'center', gap:'8px' }}
            >
              <IconGithub size={16} /> View on GitHub
            </a>
          </div>
        </div>

      </article>
    </div>
  );
}
