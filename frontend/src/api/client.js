/**
 * Central API client — single source for the backend base URL, request
 * shaping (JSON / form), bearer-token injection, and error normalization.
 */

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const ACCESS_KEY = "badgegen_access";
const REFRESH_KEY = "badgegen_refresh";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem(ACCESS_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function request(path, { method = "GET", json, form, auth = false } = {}) {
  const headers = {};
  let body;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (form !== undefined) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(form).toString();
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(API_BASE + path, { method, headers, body });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let detail = data && data.detail;
    if (Array.isArray(detail)) detail = detail[0]?.msg || "Invalid input";
    throw new Error(typeof detail === "string" ? detail : `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", json: payload }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", form: { username: email, password } }),
  me: () => request("/api/auth/me", { auth: true }),
  plans: () => request("/api/plans"),
  myPlan: () => request("/api/plans/me", { auth: true }),
};
