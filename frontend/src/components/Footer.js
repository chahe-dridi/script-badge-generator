import React from "react";
import { Link } from "react-router-dom";
import { IconBadge, IconGithub, IconExternalLink } from "./Icons";
import { VERSION } from "../version";
import "../styles/Footer.css";

const PRODUCT_LINKS = [
  { label: "Features",     to: "/#features",  external: false },
  { label: "How it works", to: "/#how",       external: false },
  { label: "Open Source",  to: "https://github.com/chahe-dridi/script-badge-generator", external: true },
];

const COMPANY_LINKS = [
  { label: "About Us",  to: "/about",     external: false },
  { label: "Changelog", to: "/changelog", external: false },
  { label: "Contact",   to: "https://github.com/chahe-dridi/script-badge-generator/issues", external: true },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", to: "/terms",   external: false },
  { label: "Privacy Policy",   to: "/privacy", external: false },
];

function FooterLink({ label, to, external }) {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className="footer-link">
        {label}
        <IconExternalLink size={11} />
      </a>
    );
  }
  return (
    <Link to={to} className="footer-link">
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── Col 1: Brand ── */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="footer-brand-link">
            <div className="footer-brand-mark">
              <IconBadge size={16} />
            </div>
            <span className="footer-brand-name">BadgeGen</span>
          </Link>
          <p className="footer-brand-desc">
            Create professional event badges at scale — free, open-source,
            and entirely in your browser.
          </p>
          <a
            href="https://github.com/chahe-dridi/script-badge-generator"
            target="_blank"
            rel="noreferrer"
            className="footer-github-link"
          >
            <IconGithub size={15} />
            View on GitHub
          </a>
        </div>

        {/* ── Col 2: Product ── */}
        <div className="footer-col">
          <h4 className="footer-col-heading">Product</h4>
          <ul className="footer-link-list">
            {PRODUCT_LINKS.map(l => (
              <li key={l.label}>
                <FooterLink {...l} />
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 3: Company ── */}
        <div className="footer-col">
          <h4 className="footer-col-heading">Company</h4>
          <ul className="footer-link-list">
            {COMPANY_LINKS.map(l => (
              <li key={l.label}>
                <FooterLink {...l} />
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 4: Legal ── */}
        <div className="footer-col">
          <h4 className="footer-col-heading">Legal</h4>
          <ul className="footer-link-list">
            {LEGAL_LINKS.map(l => (
              <li key={l.label}>
                <FooterLink {...l} />
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span className="footer-status-dot" aria-hidden="true" />
          <span className="footer-status-label">All systems online</span>
          <span className="footer-bottom-sep" aria-hidden="true" />
          <span className="footer-copyright">
            © {new Date().getFullYear()} BadgeGen · MIT License
          </span>
        </div>

        <div className="footer-bottom-right">
          <Link to="/changelog" className="footer-version" title="View release notes">v{VERSION}</Link>
        </div>
      </div>
    </footer>
  );
}
