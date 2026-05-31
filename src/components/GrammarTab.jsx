import { useState, useEffect, useRef } from "react";
import { callAI, buildSystemPrompt } from "../utils/api";
import { supabase } from "../utils/supabase";

export default function GrammarTab({ language, level }) {
  const [exercise, setExercise] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [streak, setStreak] = useState(0);
  const usedPrompts = useRef([]);
  const [error, setError] = useState("");
  const generate = async () => {
    setLoading(true);
    setFeedback(null);
    setAnswer("");
    setExercise(null);

    const avoidList = usedPrompts.current.length > 0
      ? `\nDo NOT repeat any of these prompts you already used: ${usedPrompts.current.map(p => `"${p}"`).join(", ")}`
      : "";

    const reply = await callAI(
      [{ role: "user", content: "Give me a grammar exercise." }],
      buildSystemPrompt(language, level, "grammar") + avoidList
    );

    try {
      const clean = reply.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      usedPrompts.current = [...usedPrompts.current, parsed.prompt];
      setExercise(parsed);
    } catch {
      setError("Failed to generate exercise. Please try again.");
      setExercise({
        type: "translate",
        instruction: "Translate this into " + language,
        prompt: "I would like a coffee, please.",
        hint: ""
      });
    }
    setLoading(false);
  };

  const check = async () => {
    if (!answer.trim() || !exercise) return;
    setChecking(true);

    const reply = await callAI(
      [{
        role: "user",
        content: `Exercise: ${exercise.instruction}\nPrompt: "${exercise.prompt}"\nStudent answer: "${answer}"`
      }],
      `You are a ${language} grammar teacher. Evaluate strictly but kindly.
Return ONLY a JSON: {"correct":true/false,"score":0-100,"correction":"correct answer if wrong, empty string if correct","explanation":"brief explanation in 1-2 sentences","encouragement":"short encouraging line"}`
    );

    try {
      const clean = reply.replace(/```json|```/g, "").trim();
      const fb = JSON.parse(clean);
      setFeedback(fb);
      if (fb.correct || fb.score >= 70) setStreak(s => s + 1);
      else setStreak(0);
    
      // Save score to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("grammar_scores").insert({
          user_id: user.id,
          language,
          level,
          score: fb.score,
          correct: fb.correct,
        });
      }
    } catch {
      setFeedback({
        correct: false, score: 0,
        explanation: "Could not evaluate. Please try again.",
        encouragement: "", correction: ""
      });
    }
    setChecking(false);
  };

  useEffect(() => { generate(); }, []);

  const scoreColor = !feedback ? "#7c7890"
    : feedback.score >= 80 ? "#5cc878"
    : feedback.score >= 50 ? "#f0c040"
    : "#e05c5c";

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: "0.9rem" }}>

{error && (
  <div style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 8, padding: "0.65rem 0.85rem", fontSize: "0.82rem", color: "#e05c5c", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    {error}
    <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#e05c5c", cursor: "pointer", fontSize: "1rem" }}>✕</button>
  </div>
)}
      {/* Streak */}
      {streak > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#f0c040", fontWeight: 600 }}>
          🔥 {streak} correct in a row
        </div>
      )}

      {/* Session counter */}
      {usedPrompts.current.length > 0 && (
        <div style={{ fontSize: "0.72rem", color: "#7c7890", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          ✅ {usedPrompts.current.length} unique {usedPrompts.current.length === 1 ? "exercise" : "exercises"} done this session
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: "1rem" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #2e2b45", borderTop: "3px solid #f0c040", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: "#7c7890", fontSize: "0.82rem" }}>Generating exercise…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Exercise card */}
      {!loading && exercise && (
        <>
          <div style={{ background: "#201e30", border: "1px solid #2e2b45", borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.62rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "#f0c040", marginBottom: "0.4rem", fontWeight: 700 }}>
              {exercise.type}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#7c7890", marginBottom: "0.75rem" }}>
              {exercise.instruction}
            </div>
            <div style={{ fontSize: "1.3rem", color: "#f0ecfa", lineHeight: 1.45, fontFamily: "Georgia, serif" }}>
              {exercise.prompt}
            </div>
            {exercise.hint && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.76rem", color: "#7c7890", fontStyle: "italic" }}>
                💡 {exercise.hint}
              </div>
            )}
          </div>

          {/* Answer */}
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} disabled={!!feedback}
            placeholder="Type your answer…" rows={3}
            style={{ background: "#161423", border: `1px solid ${feedback ? "#2e2b45" : "rgba(240,192,64,0.4)"}`, borderRadius: 12, padding: "0.85rem 1rem", color: "#f0ecfa", fontFamily: "sans-serif", fontSize: "0.9rem", resize: "none", outline: "none", lineHeight: 1.5 }} />

          {/* Check button */}
          {!feedback && (
            <button onClick={check} disabled={!answer.trim() || checking}
              style={{ padding: "0.9rem", background: answer.trim() && !checking ? "linear-gradient(135deg, #f0c040, #e07840)" : "#201e30", border: "none", borderRadius: 12, color: answer.trim() && !checking ? "#111" : "#7c7890", fontSize: "0.95rem", fontWeight: 700, cursor: answer.trim() && !checking ? "pointer" : "not-allowed" }}>
              {checking ? "Checking…" : "Check Answer →"}
            </button>
          )}

          {/* Feedback */}
          {feedback && (
            <>
              <div style={{ background: "#201e30", border: `1px solid ${feedback.correct ? "#5cc87833" : "#e05c5c33"}`, borderRadius: 14, padding: "1.1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.65rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>{feedback.correct ? "✅" : "❌"}</span>
                  <span style={{ fontSize: "1.25rem", color: scoreColor, fontWeight: 700, fontFamily: "Georgia, serif" }}>{feedback.score}/100</span>
                </div>
                {feedback.correction && (
                  <div style={{ marginBottom: "0.5rem", fontSize: "0.82rem" }}>
                    <span style={{ color: "#7c7890" }}>Correct: </span>
                    <span style={{ color: "#5cc878", fontWeight: 600 }}>{feedback.correction}</span>
                  </div>
                )}
                <div style={{ fontSize: "0.84rem", color: "#f0ecfa", lineHeight: 1.5, marginBottom: "0.4rem" }}>{feedback.explanation}</div>
                {feedback.encouragement && (
                  <div style={{ fontSize: "0.78rem", color: "#f0c040", fontStyle: "italic" }}>{feedback.encouragement}</div>
                )}
              </div>

              <button onClick={generate}
                style={{ padding: "0.9rem", background: "#201e30", border: "1px solid #2e2b45", borderRadius: 12, color: "#f0ecfa", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}>
                Next Exercise →
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}