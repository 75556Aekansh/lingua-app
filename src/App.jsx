import { useState } from "react";
import Welcome from "./components/Welcome";
import ConversationTab from "./components/ConversationTab";
import VocabularyTab from "./components/VocabularyTab";
import GrammarTab from "./components/GrammarTab";

const TABS = [
  { id: "converse", icon: "💬", label: "Converse" },
  { id: "vocab", icon: "🃏", label: "Vocab" },
  { id: "grammar", icon: "✏️", label: "Grammar" },
];

function MainApp({ language, level, onBack }) {
  const [tab, setTab] = useState("converse");

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a13", color: "#f0ecfa" }}>
      {/* Header */}
      <div style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #2e2b45", display: "flex", alignItems: "center", gap: "0.75rem", background: "#161423", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#7c7890", cursor: "pointer", fontSize: "1.1rem" }}>←</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", flex: 1 }}>Lingua</div>
        <div style={{ fontSize: "0.7rem", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 6, padding: "0.2rem 0.55rem", color: "#7c7890" }}>
          {language} · {level}
        </div>
      </div>

      {/* Tab content */}
      {tab === "converse" && <ConversationTab language={language} level={level} />}
      {tab === "vocab" && <VocabularyTab language={language} level={level} />}
      {tab === "grammar" && <GrammarTab language={language} level={level} />}

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#161423", borderTop: "1px solid #2e2b45", display: "flex", zIndex: 10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "0.7rem 0.5rem", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", color: tab === t.id ? "#f0c040" : "#7c7890", fontFamily: "sans-serif" }}>
            <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  if (!session) return <Welcome onStart={(lang, level) => setSession({ lang, level })} />;
  return <MainApp language={session.lang} level={session.level} onBack={() => setSession(null)} />;
}