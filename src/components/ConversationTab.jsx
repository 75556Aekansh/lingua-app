export default function ConversationTab({ language, level }) {
    return (
      <div style={{ padding: "2rem", color: "#f0ecfa", fontFamily: "sans-serif" }}>
        <h2>💬 Converse</h2>
        <p style={{ color: "#7c7890", marginTop: "0.5rem" }}>{language} · {level} — coming in Issue #8</p>
      </div>
    );
  }