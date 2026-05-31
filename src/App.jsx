import Welcome from "./components/Welcome";
import ConversationTab from "./components/ConversationTab";
import VocabularyTab from "./components/VocabularyTab";
import GrammarTab from "./components/GrammarTab";
import {  useEffect,useState } from "react";
import { supabase } from "./utils/supabase";
import Auth from "./components/Auth";

const TABS = [
  { id: "converse", icon: "💬", label: "Converse" },
  { id: "vocab", icon: "🃏", label: "Vocab" },
  { id: "grammar", icon: "✏️", label: "Grammar" },
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

function MainApp({ language, level,user, onBack }) {
  const [tab, setTab] = useState("converse");
  const cefr = CEFR_LEVELS.find(l => l.code === level);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a13", color: "#f0ecfa" }}>
      {/* Header */}
      <div style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #2e2b45", display: "flex", alignItems: "center", gap: "0.75rem", background: "#161423", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#7c7890", cursor: "pointer", fontSize: "1.1rem" }}>←</button>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", flex: 1 }}>Lingua</div>
        <div style={{ fontSize: "0.7rem", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 6, padding: "0.2rem 0.55rem", color: "#7c7890" }}>
          {language} · {level}
        </div>
        <button
  onClick={logout}
  style={{
    fontSize: "0.7rem",
    background: "#201e30",
    border: "1px solid #2e2b45",
    borderRadius: 6,
    padding: "0.2rem 0.55rem",
    color: "#7c7890",
    cursor: "pointer"
  }}
>
  Logout
</button>
      </div>

      {/* Tab content */}
      <div style={{ paddingBottom: "5rem" }}>
  {tab === "converse" && <ConversationTab language={language} level={level} />}
  {tab === "vocab" && <VocabularyTab language={language} level={level} />}
  {tab === "grammar" && <GrammarTab language={language} level={level} />}
</div>

      {/* Bottom nav */}
{/* Bottom nav */}
<div style={{
  position: "fixed", bottom: 0, left: 0, right: 0,
  background: "#161423",
  borderTop: "1px solid #2e2b45",
  display: "flex",
  zIndex: 10,
  paddingBottom: "env(safe-area-inset-bottom)",
}}>
  {TABS.map(t => (
    <button key={t.id} onClick={() => setTab(t.id)}
      style={{
        flex: 1,
        padding: "0.75rem 0.5rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.2rem",
        color: tab === t.id ? "#f0c040" : "#7c7890",
        transition: "color 0.15s",
        fontFamily: "sans-serif",
        borderTop: tab === t.id ? "2px solid #f0c040" : "2px solid transparent",
      }}>
      <span style={{ fontSize: "1.3rem" }}>{t.icon}</span>
      <span style={{
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
      }}>
        {t.label}
      </span>
    </button>
  ))}
</div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0b0a13", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #2e2b45", borderTop: "3px solid #f0c040", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Auth onAuth={setUser} />;

  if (!session) return <Welcome onStart={(lang, level) => setSession({ lang, level })} />;

  return <MainApp language={session.lang} level={session.level} user={user} onBack={() => setSession(null)} />;
}