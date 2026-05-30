import { useState } from "react";

const LANGUAGES = [
  { name: "Spanish", flag: "🇪🇸" }, { name: "French", flag: "🇫🇷" },
  { name: "Japanese", flag: "🇯🇵" }, { name: "German", flag: "🇩🇪" },
  { name: "Italian", flag: "🇮🇹" }, { name: "Portuguese", flag: "🇧🇷" },
  { name: "Korean", flag: "🇰🇷" }, { name: "Mandarin", flag: "🇨🇳" },
  { name: "Arabic", flag: "🇸🇦" }, { name: "Russian", flag: "🇷🇺" },
];

const CEFR_LEVELS = [
  { code: "A0", title: "Zero",         desc: "No prior knowledge at all",  color: "#a78bfa" },
  { code: "A1", title: "Beginner",     desc: "Basic words & phrases",      color: "#4ec9b0" },
  { code: "A2", title: "Elementary",   desc: "Simple everyday sentences",  color: "#4ec9b0" },
  { code: "B1", title: "Intermediate", desc: "Familiar topics & travel",   color: "#f0c040" },
  { code: "B2", title: "Upper-Inter.", desc: "Complex texts & discussion",  color: "#f0c040" },
  { code: "C1", title: "Advanced",     desc: "Fluent & spontaneous use",   color: "#e07840" },
  { code: "C2", title: "Mastery",      desc: "Near-native proficiency",    color: "#e05c5c" },
];

export default function Welcome({ onStart }) {
  const [lang, setLang] = useState(null);
  const [level, setLevel] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a13", color: "#f0ecfa", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 1.25rem" }}>
      
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "3rem", fontWeight: 700, color: "#f0c040" }}>Lingua</div>
        <div style={{ color: "#7c7890", fontSize: "0.72rem", letterSpacing: "3px", textTransform: "uppercase" }}>AI Language Tutor</div>
      </div>

      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Language grid */}
        <div style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "#7c7890", marginBottom: "0.75rem" }}>Choose a language</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginBottom: "1.75rem" }}>
          {LANGUAGES.map((l) => (
            <button key={l.name} onClick={() => setLang(l.name)}
              style={{ background: lang === l.name ? "rgba(240,192,64,0.12)" : "#161423", border: `1px solid ${lang === l.name ? "#f0c040" : "#2e2b45"}`, borderRadius: 10, padding: "0.75rem 0.25rem", cursor: "pointer", color: "#f0ecfa", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{l.flag}</span>
              <span style={{ fontSize: "0.6rem", color: lang === l.name ? "#f0c040" : "#7c7890", fontWeight: 600 }}>{l.name}</span>
            </button>
          ))}
        </div>

        {/* CEFR levels */}
        <div style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "#7c7890", marginBottom: "0.75rem" }}>Your CEFR level</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.55rem", marginBottom: "1rem" }}>
          {CEFR_LEVELS.map((l) => (
            <button key={l.code} onClick={() => setLevel(l.code)}
              style={{ padding: "0.8rem 0.5rem", borderRadius: 11, cursor: "pointer", background: level === l.code ? `${l.color}18` : "#161423", border: `1px solid ${level === l.code ? l.color : "#2e2b45"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "1.35rem", fontWeight: 700, color: level === l.code ? l.color : "#f0ecfa" }}>{l.code}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: level === l.code ? l.color : "#7c7890", textTransform: "uppercase" }}>{l.title}</span>
              <span style={{ fontSize: "0.6rem", color: "#7c7890", textAlign: "center" }}>{l.desc}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: "3px", marginBottom: "1.75rem" }}>
          {CEFR_LEVELS.map((l, i) => (
            <div key={l.code} style={{ flex: 1, height: 4, borderRadius: 4, background: level && CEFR_LEVELS.findIndex(x => x.code === level) >= i ? l.color : "#2e2b45", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* CTA */}
        <button disabled={!lang || !level} onClick={() => lang && level && onStart(lang, level)}
          style={{ width: "100%", padding: "1rem", background: lang && level ? "linear-gradient(135deg, #f0c040, #e07840)" : "#201e30", border: "none", borderRadius: 12, color: lang && level ? "#111" : "#7c7890", fontSize: "1rem", fontWeight: 700, cursor: lang && level ? "pointer" : "not-allowed" }}>
          {!lang ? "Select a language to begin" : !level ? "Select your CEFR level" : `Start ${lang} at ${level} →`}
        </button>
      </div>
    </div>
  );
}