import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import '../styles/Pages-Admin.css';

const TABS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Plans', to: '/admin/plans' },
];

const PLAN_LABELS = { free: 'Free', pro: 'Pro', team: 'Premier' };

export default function AdminDashboardPage() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminStats()
      .then(setStats)
      .catch(e => setError(e.message));
  }, []);

  const total = stats?.total_users || 0;
  const byPlan = stats?.by_plan || {};
  const freeCount = byPlan.free || 0;
  const proCount = byPlan.pro || 0;
  const teamCount = byPlan.team || 0;

  const barFree    = total ? Math.round((freeCount / total) * 100) : 0;
  const barPro     = total ? Math.round((proCount  / total) * 100) : 0;
  const barPremier = total ? Math.round((teamCount / total) * 100) : 0;

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
          <h1>Dashboard</h1>
          <p>Overview of users and plan adoption.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!stats && !error && (
        <div className="admin-loading">
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
          Loading stats…
        </div>
      )}

      {stats && (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card admin-stat-neu">
              <div className="admin-stat-label">Total Users</div>
              <div className="admin-stat-value">{stats.total_users}</div>
              <div className="admin-stat-sub">all time</div>
            </div>
            <div className="admin-stat-card admin-stat-a">
              <div className="admin-stat-label">Active</div>
              <div className="admin-stat-value">{stats.active_users}</div>
              <div className="admin-stat-sub">not suspended</div>
            </div>
            <div className="admin-stat-card admin-stat-a3">
              <div className="admin-stat-label">Suspended</div>
              <div className="admin-stat-value">{stats.inactive_users}</div>
              <div className="admin-stat-sub">is_active = false</div>
            </div>
            <div className="admin-stat-card admin-stat-a2">
              <div className="admin-stat-label">7-day Signups</div>
              <div className="admin-stat-value">{stats.recent_signups_7d}</div>
              <div className="admin-stat-sub">last 7 days</div>
            </div>
          </div>

          <div className="admin-plan-bar-wrap">
            <div className="admin-plan-bar-title">Plan adoption</div>
            <div className="admin-plan-bar">
              <div
                className="admin-plan-bar-seg admin-plan-bar-seg-free"
                style={{ width: `${barFree}%` }}
              />
              <div
                className="admin-plan-bar-seg admin-plan-bar-seg-pro"
                style={{ width: `${barPro}%` }}
              />
              <div
                className="admin-plan-bar-seg admin-plan-bar-seg-premier"
                style={{ width: `${barPremier}%` }}
              />
            </div>
            <div className="admin-plan-bar-legend">
              {[
                { key: 'free',  label: 'Free',    count: freeCount,  cls: 'admin-plan-bar-seg-free'    },
                { key: 'pro',   label: 'Pro',     count: proCount,   cls: 'admin-plan-bar-seg-pro'     },
                { key: 'team',  label: 'Premier', count: teamCount,  cls: 'admin-plan-bar-seg-premier' },
              ].map(p => (
                <div key={p.key} className="admin-plan-legend-item">
                  <div className={`admin-plan-legend-dot ${p.cls}`} />
                  {p.label}: <strong>{p.count}</strong>
                  {total > 0 && (
                    <span> ({Math.round((p.count / total) * 100)}%)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
