import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconShield } from '../components/Icons';
import '../styles/Pages-Legal.css';

export default function PrivacyPage() {
  return (
    <div className="pg pg-legal">
      <article className="legal-article">

        <Link to="/" className="legal-back">
          <IconArrowLeft size={14} /> Back to Home
        </Link>

        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-meta">Last updated: June 26, 2026 · Effective immediately</p>

        <div className="legal-highlight" style={{ marginBottom: '40px' }}>
          <p style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <IconShield size={16} style={{ color:'var(--a)', flexShrink:0 }} />
            <strong>Short version:</strong> BadgeGen collects no personal data.
            Everything runs in your browser. Nothing is uploaded, tracked, or stored on any server.
          </p>
        </div>

        <div className="legal-section">
          <h2>1. Overview</h2>
          <p>
            BadgeGen ("we", "us", or "our") is committed to protecting your privacy.
            This Privacy Policy explains what information we handle and how we handle it
            when you use our Service.
          </p>
          <p>
            Because BadgeGen operates entirely client-side — all badge generation happens
            in your browser using the HTML5 Canvas API — we have no ability to access,
            view, or store your files, names, templates, or any other data you work with.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Information we do not collect</h2>
          <p>We do not collect, process, or transmit any of the following:</p>
          <ul>
            <li>Personal names or attendee lists you import into the tool.</li>
            <li>Badge template images you upload.</li>
            <li>Generated badge images or ZIP exports.</li>
            <li>Your IP address or browser fingerprint.</li>
            <li>Usage analytics, page views, or click events.</li>
            <li>Device information, operating system, or browser version.</li>
            <li>Any form of cookies set by BadgeGen for tracking purposes.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Local storage</h2>
          <p>
            BadgeGen uses your browser's <code>localStorage</code> to save design
            presets (font settings, text position, effects) across sessions. This data
            never leaves your device.
          </p>
          <p>
            You can clear this data at any time by clearing your browser's site data
            for this page, or by using the reset function within the application.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Third-party services</h2>
          <p>
            BadgeGen loads fonts from Google Fonts via a standard CSS import. This
            means your browser makes a request to Google's CDN when the app loads.
            Google's own{' '}
            <a href="https://fonts.google.com/about" target="_blank" rel="noreferrer">
              privacy policy
            </a>{' '}
            applies to that request.
          </p>
          <p>
            We do not use any other third-party analytics, advertising, tracking, or
            monitoring services.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Open-source hosting</h2>
          <p>
            The BadgeGen source code is hosted on GitHub. If you visit our GitHub
            repository, GitHub's{' '}
            <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">
              Privacy Statement
            </a>{' '}
            applies.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Children's privacy</h2>
          <p>
            BadgeGen does not knowingly collect any information from children under
            the age of 13. The Service does not collect any personal data from any user,
            regardless of age.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Future authentication features</h2>
          <p>
            We plan to introduce optional user accounts in a future version of BadgeGen
            to enable features like cloud-saved templates and team workspaces. When that
            feature launches, this Privacy Policy will be updated to describe what
            account data is collected and how it is used, with advance notice to users.
          </p>
          <p>
            Until then, no accounts or login credentials are stored anywhere.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will indicate the
            date of the latest revision at the top of this page. Continued use of the
            Service after any changes constitutes acceptance of the updated policy.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. Contact</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please
            open a discussion on our{' '}
            <a href="https://github.com/chahe-dridi/script-badge-generator" target="_blank" rel="noreferrer">
              GitHub repository
            </a>
            .
          </p>
          <p>
            Also see our <Link to="/terms">Terms of Service</Link>.
          </p>
        </div>

      </article>
    </div>
  );
}
