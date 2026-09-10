import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm bg-panel border border-line rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-fog mb-1">AeroVir</h1>
        <p className="text-mist text-sm mb-6">
          {mode === "login" ? "Sign in to your dashboard" : "Create your account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-fog mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-panel2 border border-line px-3 py-2 text-fog focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-fog mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-panel2 border border-line px-3 py-2 text-fog focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>

          <div>
            <label className="block text-sm text-fog mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-panel2 border border-line px-3 py-2 text-fog focus:outline-none focus:ring-2 focus:ring-signal"
            />
          </div>

          {error && <p className="text-severe text-sm">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-signal hover:bg-signal2 disabled:opacity-50 text-white font-medium py-2 transition"
          >
            {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-mist mt-4 text-center">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            className="text-signal hover:underline"
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
