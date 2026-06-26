import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconLock, IconArrowLeft, IconCheck,
  IconZap, IconShield, IconUsers, IconSliders
} from '../components/Icons';
import '../styles/Pages-Legal.css';

const PLANNED_FEATURES = [
  { icon: IconUsers,   text: "Team workspaces — collaborate with your organization" },
  { icon: IconZap,     text: "Cloud templates — save and sync designs across devices" },
  { icon: IconSliders, text: "Advanced presets — share configuration packs with your team" },
  { icon: IconShield,  text: "Private galleries — secure, shareable badge collections" },
];

export default function ComingSoonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isLogin    = location.pathname === '/login';
  const pageLabel  = isLogin ? 'Sign In' : 'Create Account';

  function handleNotify(e) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <div className="pg pg-coming-soon">
      <div className="coming-soon-inner">

        <div className="coming-soon-icon">
          <IconLock size={32} />
        </div>

        <p className="coming-soon-eyebrow">
          {pageLabel} · Under Development
        </p>

        <h1 className="coming-soon-title">
          User accounts are coming soon
        </h1>

        <p className="coming-soon-sub">
          We're building a full authentication system so your templates,
          designs, and galleries are always with you. For now, BadgeGen
          works great without an account.
        </p>

        {/* Planned features */}
        <div className="coming-soon-features">
          <h3>What's coming with accounts</h3>
          <ul className="coming-soon-feature-list">
            {PLANNED_FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="coming-soon-feature-item">
                <Icon size={16} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Notify form */}
        {!submitted ? (
          <form className="coming-soon-notify" onSubmit={handleNotify}>
            <input
              type="email"
              className="coming-soon-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-label="Email address for launch notification"
            />
            <button type="submit" className="cta cta-on" style={{ flexShrink: 0 }}>
              Notify me
            </button>
          </form>
        ) : (
          <div className="legal-highlight" style={{ marginBottom: '24px', textAlign:'left' }}>
            <p style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <IconCheck size={14} style={{ color:'var(--a)', flexShrink:0 }} />
              Got it — we'll let you know when accounts launch.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="cta cta-on" onClick={() => navigate('/setup')}>
            Continue without account
          </button>
          <button className="coming-soon-back" onClick={() => navigate(-1)}>
            <IconArrowLeft size={14} /> Go back
          </button>
        </div>

      </div>
    </div>
  );
}
