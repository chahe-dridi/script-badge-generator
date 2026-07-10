import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages-Admin.css';

const TABS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Plans', to: '/admin/plans' },
];

const PLAN_OPTIONS = [
  { value: 'free',  label: 'Free' },
  { value: 'pro',   label: 'Pro' },
  { value: 'team',  label: 'Premier' },
];

function PlanBadge({ plan }) {
  const cls = plan === 'free' ? 'admin-plan-badge-free'
            : plan === 'pro'  ? 'admin-plan-badge-pro'
            : 'admin-plan-badge-team';
  const label = plan === 'team' ? 'Premier' : plan.charAt(0).toUpperCase() + plan.slice(1);
  return <span className={`admin-plan-badge ${cls}`}>{label}</span>;
}

export default function AdminUsersPage() {
  const location = useLocation();
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState({});

  useEffect(() => {
    api.adminUsers()
      .then(data => { setUsers(data); setFiltered(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    if (!q) { setFiltered(users); return; }
    setFiltered(users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    ));
  }, [query, users]);

  async function patch(userId, data) {
    setSaving(s => ({ ...s, [userId]: true }));
    try {
      const updated = await api.adminUpdateUser(userId, data);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(s => ({ ...s, [userId]: false }));
    }
  }

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
          <h1>Users</h1>
          <p>Manage plans, access, and account status.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-search-row">
        <input
          className="admin-search-input"
          type="search"
          placeholder="Search by name or email…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className="admin-user-count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
          Loading users…
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Admin</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">No users found.</div>
                  </td>
                </tr>
              ) : filtered.map(u => {
                const isSelf = u.id === me?.id;
                const busy = saving[u.id];
                return (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'var(--fmono)', fontSize: 12 }}>
                      {u.id}
                    </td>
                    <td>
                      <div className="admin-user-meta">
                        <span className="admin-user-name">{u.full_name || '—'}</span>
                        <span className="admin-user-email">{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="admin-plan-select"
                        value={u.plan}
                        disabled={busy}
                        onChange={e => patch(u.id, { plan: e.target.value })}
                      >
                        {PLAN_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`admin-status ${u.is_active ? 'admin-status-active' : 'admin-status-inactive'}`}>
                        <span className="admin-status-dot" />
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      {u.is_admin && (
                        <span className="admin-shield-icon" title="Admin">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
                          </svg>
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--fmono)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          className={`admin-action-btn ${u.is_active ? 'admin-btn-suspend' : 'admin-btn-activate'}`}
                          disabled={busy || isSelf}
                          title={isSelf ? 'Cannot suspend yourself' : undefined}
                          onClick={() => patch(u.id, { is_active: !u.is_active })}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          className="admin-action-btn admin-btn-admin"
                          disabled={busy || isSelf}
                          title={isSelf ? 'Cannot change your own admin status' : undefined}
                          onClick={() => patch(u.id, { is_admin: !u.is_admin })}
                        >
                          {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
