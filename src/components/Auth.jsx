import { useState } from "react";
import { supabase } from "../utils/supabase";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handle = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account, then log in!");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: import.meta.env.DEV
          ? "http://localhost:5173"
          : "https://lingua-app-lyart.vercel.app",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a13", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "sans-serif" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "3rem", fontWeight: 700, color: "#f0c040" }}>Lingua</div>
        <div style={{ color: "#7c7890", fontSize: "0.72rem", letterSpacing: "3px", textTransform: "uppercase", marginTop: "0.2rem" }}>AI Language Tutor</div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: "#161423", border: "1px solid #2e2b45", borderRadius: 16, padding: "2rem" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem" }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
              style={{ flex: 1, padding: "0.65rem", borderRadius: 10, border: `1px solid ${mode === m ? "#f0c040" : "#2e2b45"}`, background: mode === m ? "rgba(240,192,64,0.12)" : "#201e30", color: mode === m ? "#f0c040" : "#7c7890", fontFamily: "sans-serif", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google Button */}
        <button onClick={handleGoogle}
          style={{ width: "100%", padding: "0.85rem", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, color: "#f0ecfa", fontFamily: "sans-serif", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 4.9C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.9 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ flex: 1, height: 1, background: "#2e2b45" }} />
          <span style={{ fontSize: "0.72rem", color: "#7c7890" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#2e2b45" }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7c7890", display: "block", marginBottom: "0.4rem" }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: "100%", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 10, padding: "0.75rem 1rem", color: "#f0ecfa", fontFamily: "sans-serif", fontSize: "0.9rem", outline: "none" }} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "0.72rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7c7890", display: "block", marginBottom: "0.4rem" }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()}
            style={{ width: "100%", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 10, padding: "0.75rem 1rem", color: "#f0ecfa", fontFamily: "sans-serif", fontSize: "0.9rem", outline: "none" }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 8, padding: "0.65rem 0.85rem", fontSize: "0.82rem", color: "#e05c5c", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div style={{ background: "rgba(92,200,120,0.1)", border: "1px solid rgba(92,200,120,0.3)", borderRadius: 8, padding: "0.65rem 0.85rem", fontSize: "0.82rem", color: "#5cc878", marginBottom: "1rem" }}>
            {message}
          </div>
        )}

        {/* Submit */}
        <button onClick={handle} disabled={!email || !password || loading}
          style={{ width: "100%", padding: "0.9rem", background: email && password && !loading ? "linear-gradient(135deg, #f0c040, #e07840)" : "#201e30", border: "none", borderRadius: 12, color: email && password && !loading ? "#111" : "#7c7890", fontFamily: "sans-serif", fontSize: "0.95rem", fontWeight: 700, cursor: email && password && !loading ? "pointer" : "not-allowed" }}>
          {loading ? "Please wait…" : mode === "login" ? "Log In →" : "Create Account →"}
        </button>
      </div>
    </div>
  );
}