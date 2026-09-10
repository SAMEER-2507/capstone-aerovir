import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5174/api";

/** Safely parse JSON from a Response – returns parsed data or throws a descriptive error. */
async function safeJson(res) {
  const text = await res.text();
  if (!text) {
    throw new Error(
      res.ok
        ? "Server returned an empty response"
        : `Request failed (${res.status} ${res.statusText})`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned non-JSON response (${res.status}): ${text.slice(0, 200)}`
    );
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("aerovir_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) return Promise.reject();
        return safeJson(r);
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("aerovir_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || "login failed");
    localStorage.setItem("aerovir_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || "registration failed");
    localStorage.setItem("aerovir_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("aerovir_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
