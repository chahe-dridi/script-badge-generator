import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pages-Landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="pg pg-landing">
      <div className="landing-hero">
        <h1 className="landing-title">Create Professional Badges in Seconds</h1>
        <p className="landing-subtitle">
          Instantly design, customize, and export bulk event badges with live previews directly in your browser. No sign-up required.
        </p>
        
        <div className="landing-actions">
          <button className="cta cta-lg cta-on" onClick={() => navigate('/setup')}>
            Start Generating ✨
          </button>
          <a href="https://github.com/chahe-dridi/script-badge-generator" target="_blank" rel="noreferrer" className="cta cta-lg ghost">
            View on GitHub
          </a>
        </div>
      </div>

      <div className="landing-features">
        <div className="feat-card">
          <div className="feat-icon">⚡</div>
          <h3>Client-Side Rendering</h3>
          <p>Everything happens securely in your browser using HTML5 Canvas. Zero upload time.</p>
        </div>
        <div className="feat-card">
          <div className="feat-icon">🎨</div>
          <h3>Advanced Customization</h3>
          <p>Full control over typography, shadows, outlines, alignment, and pinpoint positioning.</p>
        </div>
        <div className="feat-card">
          <div className="feat-icon">📦</div>
          <h3>Bulk Export</h3>
          <p>Import a CSV or TXT file of names and instantly generate a ZIP file of all your badges.</p>
        </div>
      </div>
    </div>
  );
}
