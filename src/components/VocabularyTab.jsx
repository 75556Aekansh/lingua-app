import { useState, useEffect } from "react";
import { callAI, buildSystemPrompt } from "../utils/api";
import { supabase } from "../utils/supabase";

const TOPICS = [
  "everyday life", "travel", "food", "work",
  "emotions", "nature", "family", "technology", "health", "culture"
];

function VocabCard({ card, index }) {
  const [flipped, setFlipped] = useState(false);


  return (
    <div onClick={() => setFlipped(f => !f)}
      style={{ perspective: 800, cursor: "pointer", height: 160 }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.45s ease",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* Front */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase", color: "#7c7890", marginBottom: "0.5rem", fontFamily: "sans-serif" }}>#{index + 1}</div>
          <div style={{ fontSize: "1.4rem", color: "#f0ecfa", textAlign: "center", fontFamily: "Georgia, serif" }}>{card.word}</div>
          <div style={{ fontSize: "0.65rem", color: "#7c7890", marginTop: "0.6rem", fontFamily: "sans-serif" }}>tap to flip</div>
        </div>

        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: "rgba(240,192,64,0.1)", border: "1px solid rgba(240,192,64,0.3)", borderRadius: 12,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0.85rem", gap: "0.4rem",
        }}>
          <div style={{ fontSize: "1.2rem", color: "#f0c040", textAlign: "center", fontFamily: "Georgia, serif" }}>{card.translation}</div>
          {card.pronunciation && <div style={{ fontSize: "0.72rem", color: "#7c7890", fontFamily: "sans-serif" }}>{card.pronunciation}</div>}
          {card.example && <div style={{ fontSize: "0.75rem", color: "#f0ecfa", textAlign: "center", fontStyle: "italic", fontFamily: "sans-serif", lineHeight: 1.4 }}>{card.example}</div>}
        </div>
      </div>
    </div>
  );
}

export default function VocabularyTab({ language, level }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("everyday life");
  const [error, setError] = useState("");


  const generate = async (t = topic) => {
    setLoading(true);
    setCards([]);
    const reply = await callAI(
      [{ role: "user", content: `Give me 6 ${language} vocabulary cards about "${t}" for ${level} learners.` }],
      buildSystemPrompt(language, level, "vocab")
    );
    try {
      const clean = reply.replace(/```json|```/g, "").trim();
      setCards(JSON.parse(clean));
      // Save vocab session to Supabase
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  await supabase.from("vocab_sessions").insert({
    user_id: user.id,
    language,
    level,
    topic: t,
  });
}
    } catch {
      setCards([]);
      setError("Failed to generate cards .Please try again");
    }
    setLoading(false);
  };

  useEffect(() => { generate(); }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      
      {/* Topic chips */}
      <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
        {TOPICS.map(t => (
          <button key={t} onClick={() => { setTopic(t); generate(t); }}
            style={{
              whiteSpace: "nowrap", padding: "0.3rem 0.75rem", borderRadius: 20,
              fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, cursor: "pointer",
              background: topic === t ? "rgba(240,192,64,0.12)" : "#161423",
              border: `1px solid ${topic === t ? "#f0c040" : "#2e2b45"}`,
              color: topic === t ? "#f0c040" : "#7c7890",
              transition: "all 0.15s",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: "1rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #2e2b45", borderTop: "3px solid #f0c040", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: "#7c7890", fontSize: "0.82rem" }}>Generating cards…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

{error && (
  <div style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 8, padding: "0.65rem 0.85rem", fontSize: "0.82rem", color: "#e05c5c", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    {error}
    <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#e05c5c", cursor: "pointer", fontSize: "1rem" }}>✕</button>
  </div>
)}

      {/* Cards grid */}
      {!loading && cards.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
          {cards.map((card, i) => <VocabCard key={`${topic}-${i}`} card={card} index={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && cards.length === 0 && (
        <div style={{ textAlign: "center", color: "#7c7890", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🃏</div>
          <div style={{ fontSize: "0.85rem" }}>No cards yet — try generating!</div>
        </div>
      )}

      {/* Generate button */}
      <button onClick={() => generate()}
        style={{ width: "100%", marginTop: "1.25rem", padding: "0.85rem", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, color: "#f0ecfa", fontFamily: "sans-serif", fontSize: "0.88rem", cursor: "pointer", fontWeight: 600 }}>
        🔄 Generate new set
      </button>
    </div>
  );
}