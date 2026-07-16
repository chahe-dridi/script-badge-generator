import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconBadge } from "../components/Icons";
import "../styles/Pages-Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pg pg-auth">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <IconBadge size={20} />
          </div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your BadgeGen account.</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="cta cta-on auth-submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-alt">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
