import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

export default function ProgressTab({ language, level, user }) {
  const [stats, setStats] = useState(null);
  const [recentScores, setRecentScores] = useState([]);
  const [vocabSessions, setVocabSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDays, setActiveDays] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    // Fetch grammar scores
    const { data: scores } = await supabase
      .from("grammar_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch vocab sessions
    const { data: vocab } = await supabase
      .from("vocab_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (scores) {
      setRecentScores(scores.slice(0, 5));
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
        : 0;
      const correct = scores.filter(s => s.correct).length;

      // Get unique active days from scores + vocab
      const allDates = [
        ...(scores || []).map(s => s.created_at?.split("T")[0]),
        ...(vocab || []).map(v => v.created_at?.split("T")[0]),
      ].filter(Boolean);
      const uniqueDays = [...new Set(allDates)];
      setActiveDays(uniqueDays);

      setStats({
        totalExercises: scores.length,
        avgScore,
        correct,
        streak: uniqueDays.length,
        vocabSessions: vocab?.length || 0,
      });
    }

    if (vocab) setVocabSessions(vocab.slice(0, 5));
    setLoading(false);
  };

  // Generate last 30 days for calendar
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const scoreColor = (score) =>
    score >= 80 ? "#5cc878" : score >= 50 ? "#f0c040" : "#e05c5c";

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: "1rem" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #2e2b45", borderTop: "3px solid #f0c040", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "#7c7890", fontSize: "0.82rem", fontFamily: "sans-serif" }}>Loading your progress…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "#7c7890", marginBottom: "0.3rem" }}>Your Progress</div>
        <div style={{ fontSize: "1.2rem", fontFamily: "Georgia, serif", color: "#f0ecfa" }}>{language} · {level}</div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
          {[
            { label: "Exercises done", value: stats.totalExercises, icon: "✏️" },
            { label: "Avg score", value: `${stats.avgScore}/100`, icon: "🎯" },
            { label: "Correct answers", value: stats.correct, icon: "✅" },
            { label: "Vocab sessions", value: stats.vocabSessions, icon: "🃏" },
          ].map(s => (
            <div key={s.label} style={{ background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, padding: "0.85rem 1rem" }}>
              <div style={{ fontSize: "1.3rem", marginBottom: "0.3rem" }}>{s.icon}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f0c040", fontFamily: "Georgia, serif" }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "#7c7890", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Activity calendar */}
      <div style={{ background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, padding: "1rem" }}>
        <div style={{ fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "#7c7890", marginBottom: "0.75rem" }}>Last 30 days</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "4px" }}>
          {getLast30Days().map(day => {
            const isActive = activeDays.includes(day);
            return (
              <div key={day} title={day}
                style={{ aspectRatio: "1", borderRadius: 4, background: isActive ? "#f0c040" : "#2e2b45", opacity: isActive ? 1 : 0.5, transition: "background 0.2s" }} />
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.65rem", fontSize: "0.68rem", color: "#7c7890" }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#2e2b45" }} /> Not active
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f0c040", marginLeft: "0.5rem" }} /> Active
        </div>
      </div>

      {/* Recent grammar scores */}
      {recentScores.length > 0 && (
        <div style={{ background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #2e2b45", fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "#7c7890" }}>Recent grammar</div>
          {recentScores.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1rem", borderBottom: i < recentScores.length - 1 ? "1px solid #2e2b45" : "none" }}>
              <span style={{ fontSize: "1rem" }}>{s.correct ? "✅" : "❌"}</span>
              <span style={{ flex: 1, fontSize: "0.82rem", color: "#7c7890" }}>{s.language} · {s.level}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: scoreColor(s.score) }}>{s.score}/100</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent vocab sessions */}
      {vocabSessions.length > 0 && (
        <div style={{ background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #2e2b45", fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", color: "#7c7890" }}>Recent vocab</div>
          {vocabSessions.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1rem", borderBottom: i < vocabSessions.length - 1 ? "1px solid #2e2b45" : "none" }}>
              <span style={{ fontSize: "1rem" }}>🃏</span>
              <span style={{ flex: 1, fontSize: "0.82rem", color: "#f0ecfa" }}>{v.topic}</span>
              <span style={{ fontSize: "0.72rem", color: "#7c7890" }}>{v.language} · {v.level}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {stats && stats.totalExercises === 0 && stats.vocabSessions === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#7c7890" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📊</div>
          <div style={{ fontSize: "0.9rem", marginBottom: "0.4rem", color: "#f0ecfa" }}>No activity yet</div>
          <div style={{ fontSize: "0.8rem" }}>Complete grammar exercises and vocab sessions to see your progress here</div>
        </div>
      )}

      {/* Refresh */}
      <button onClick={fetchStats}
        style={{ padding: "0.85rem", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, color: "#7c7890", fontFamily: "sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
        🔄 Refresh
      </button>
    </div>
  );
}