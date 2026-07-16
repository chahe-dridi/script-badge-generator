import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, clearTokens, getAccessToken, setTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load if we have a stored token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getAccessToken()) {
        try {
          const me = await api.me();
          if (!cancelled) setUser(me);
        } catch {
          clearTokens();
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const tokens = await api.login(email, password);
    setTokens(tokens);
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (email, password, fullName) => {
      await api.register({ email, password, full_name: fullName || undefined });
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
