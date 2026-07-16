import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import '../styles/Pages-Admin.css';

const TABS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Plans', to: '/admin/plans' },
];

function Toggle({ checked, onChange }) {
  return (
    <label className="admin-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="admin-toggle-slider" />
    </label>
  );
}

function PlanCard({ config, onSaved }) {
  const [draft, setDraft] = useState({ ...config });
  const [unlimitedProjects, setUnlimitedProjects] = useState(config.max_projects === null);
  const [unlimitedBatch,    setUnlimitedBatch]    = useState(config.max_batch === null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const tier = config.tier;
  const cardCls = tier === 'pro' ? ' admin-plan-card-pro' : '';
  const tierCls = tier === 'free' ? 'admin-tier-free' : tier === 'pro' ? 'admin-tier-pro' : 'admin-tier-premier';
  const tierLabel = tier === 'team' ? 'Premier' : tier.charAt(0).toUpperCase() + tier.slice(1);

  async function save() {
    setSaving(true);
    setError('');
    const payload = {
      label:        draft.label,
      price_usd:    parseFloat(draft.price_usd) || 0,
      max_projects: unlimitedProjects ? null : (parseInt(draft.max_projects, 10) || null),
      max_batch:    unlimitedBatch    ? null : (parseInt(draft.max_batch,    10) || null),
      watermark:    draft.watermark,
      pdf_export:   draft.pdf_export,
    };
    try {
      const updated = await api.adminUpdatePlan(tier, payload);
      onSaved(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`admin-plan-card${cardCls}`}>
      <div className="admin-plan-card-header">
        <span className={`admin-plan-card-tier ${tierCls}`}>{tier.toUpperCase()}</span>
      </div>

      <div className="admin-plan-card-title">{tierLabel}</div>

      {error && <div className="admin-error" style={{ marginBottom: 0 }}>{error}</div>}

      <div className="admin-field-group">
        <div className="admin-field">
          <div className="admin-field-label">Display Label</div>
          <input
            className="admin-field-input"
            value={draft.label}
            onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
          />
        </div>

        <div className="admin-field">
          <div className="admin-field-label">Monthly Price</div>
          <div className="admin-field-row">
            <span className="admin-field-prefix">$</span>
            <input
              className="admin-field-input"
              type="number"
              min="0"
              step="0.01"
              value={draft.price_usd}
              onChange={e => setDraft(d => ({ ...d, price_usd: e.target.value }))}
            />
            <span className="admin-field-prefix">/mo</span>
          </div>
        </div>

        <div className="admin-field">
          <div className="admin-field-label">Max Projects</div>
          <div className="admin-field-row">
            <input
              className="admin-field-input"
              type="number"
              min="1"
              disabled={unlimitedProjects}
              value={unlimitedProjects ? '' : (draft.max_projects ?? '')}
              placeholder="Unlimited"
              onChange={e => setDraft(d => ({ ...d, max_projects: e.target.value }))}
            />
            <Toggle
              checked={unlimitedProjects}
              onChange={v => { setUnlimitedProjects(v); }}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>∞</span>
          </div>
        </div>

        <div className="admin-field">
          <div className="admin-field-label">Max Batch Size</div>
          <div className="admin-field-row">
            <input
              className="admin-field-input"
              type="number"
              min="1"
              disabled={unlimitedBatch}
              value={unlimitedBatch ? '' : (draft.max_batch ?? '')}
              placeholder="Unlimited"
              onChange={e => setDraft(d => ({ ...d, max_batch: e.target.value }))}
            />
            <Toggle
              checked={unlimitedBatch}
              onChange={v => { setUnlimitedBatch(v); }}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>∞</span>
          </div>
        </div>
      </div>

      <div>
        <div className="admin-toggle-row">
          <span className="admin-toggle-label">Watermark on exports</span>
          <Toggle
            checked={draft.watermark}
            onChange={v => setDraft(d => ({ ...d, watermark: v }))}
          />
        </div>
        <div className="admin-toggle-row">
          <span className="admin-toggle-label">PDF export</span>
          <Toggle
            checked={draft.pdf_export}
            onChange={v => setDraft(d => ({ ...d, pdf_export: v }))}
          />
        </div>
      </div>

      <div className="admin-plan-card-footer">
        <button
          className="cta cta-on cta-sm"
          style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
          disabled={saving}
          onClick={save}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminPlans()
      .then(setPlans)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(updated) {
    setPlans(prev => prev.map(p => p.tier === updated.tier ? updated : p));
  }

  const ORDER = ['free', 'pro', 'team'];
  const sorted = [...plans].sort((a, b) => ORDER.indexOf(a.tier) - ORDER.indexOf(b.tier));

  return (
    <div className="pg-admin">
      <nav className="admin-tabs">
        {TABS.map(t => (
          <Link
            key={t.to}
            to={t.to}
            className={`admin-tab${location.pathname === t.to ? ' admin-tab-active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Plans</h1>
          <p>Set prices, limits, and features for each plan tier.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
          Loading plans…
        </div>
      ) : (
        <div className="admin-plans-grid">
          {sorted.map(plan => (
            <PlanCard key={plan.tier} config={plan} onSaved={handleSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
