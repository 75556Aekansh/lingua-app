import { useState, useRef, useEffect } from "react";
import { callAI, buildSystemPrompt } from "../utils/api";

function parse(raw) {
  const [text, ...rest] = raw.split("---");
  let meta = {};
  try { meta = JSON.parse(rest.join("---").trim()); } catch {}
  return { text: text.trim(), translation: meta.translation, tip: meta.tip };
}

export default function ConversationTab({ language, level }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const initialized = useRef(false);
  const messagesEnd = useRef(null);

  // AI greeting on first load
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setLoading(true);
    callAI(
      [{ role: "user", content: "Please greet me and start our lesson!" }],
      buildSystemPrompt(language, level, "converse")
    ).then(reply => {
      setMessages([{ role: "assistant", raw: reply }]);
      setLoading(false);
    });
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      content: m.role === "assistant" ? parse(m.raw).text : m.raw,
    }));
    history.push({ role: "user", content: text });
    setMessages(prev => [...prev, { role: "user", raw: text }]);

    const reply = await callAI(
      history,
      buildSystemPrompt(language, level, "converse")
    );
    setMessages(prev => [...prev, { role: "assistant", raw: reply }]);
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 108px)" }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1rem 0.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {messages.map((msg, i) => {
          // User message
          if (msg.role === "user") return (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                background: "rgba(240,192,64,0.12)",
                border: "1px solid rgba(240,192,64,0.3)",
                borderRadius: "14px 14px 3px 14px",
                padding: "0.75rem 1rem",
                maxWidth: "80%",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                color: "#f0ecfa",
                fontFamily: "sans-serif",
              }}>
                {msg.raw}
              </div>
            </div>
          );

          // AI message
          const { text, translation, tip } = parse(msg.raw);
          return (
            <div key={i} style={{ maxWidth: "85%" }}>
              <div style={{
                background: "#201e30",
                border: "1px solid #2e2b45",
                borderRadius: "14px 14px 14px 3px",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "#f0ecfa",
                fontFamily: "sans-serif",
              }}>
                {text}
              </div>

              {/* Translation & tip toggle */}
              {(translation || tip) && (
                <div style={{ marginTop: "0.3rem" }}>
                  <button onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                    style={{ fontSize: "0.68rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7c7890", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif", padding: "2px 1px" }}>
                    {expanded[i] ? "▲ hide" : "▼ translation & tip"}
                  </button>
                  {expanded[i] && (
                    <div style={{ background: "#161423", border: "1px solid #2e2b45", borderRadius: 10, padding: "0.7rem 0.85rem", marginTop: "0.2rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {translation && (
                        <p style={{ margin: 0, fontSize: "0.82rem", fontFamily: "sans-serif", color: "#f0ecfa" }}>
                          <span style={{ color: "#f0c040", fontWeight: 700 }}>EN: </span>{translation}
                        </p>
                      )}
                      {tip && (
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#7c7890", fontStyle: "italic", fontFamily: "sans-serif" }}>
                          💡 {tip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "0.7rem 1rem", background: "#201e30", borderRadius: 14, width: "fit-content" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: "#7c7890", display: "block",
                animation: `bounce 1.1s ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input bar */}
      <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #2e2b45", display: "flex", gap: "0.5rem", background: "#161423" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Type in any language…"
          style={{ flex: 1, background: "#201e30", border: "1px solid #2e2b45", borderRadius: 10, padding: "0.7rem 1rem", color: "#f0ecfa", fontFamily: "sans-serif", fontSize: "0.88rem", outline: "none" }}
        />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: 10, background: input.trim() && !loading ? "linear-gradient(135deg, #f0c040, #e07840)" : "#201e30", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: "1.1rem", color: "#111", flexShrink: 0 }}>
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}