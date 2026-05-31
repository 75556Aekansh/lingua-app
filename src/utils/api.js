const LEVEL_INSTRUCTIONS = {
    A0: "The student has ZERO knowledge of this language. Speak mostly in English. Introduce only 1-2 words at a time in the target language. Be very encouraging and patient. Start from absolute basics like greetings and pronunciation.",
    A1: "The student knows very basic words and simple phrases. Use simple sentences in the target language. Always provide English translations. Focus on everyday vocabulary.",
    A2: "The student knows simple everyday sentences. Use short sentences in the target language. Provide translations for harder words. Focus on practical conversations.",
    B1: "The student can handle familiar topics. Speak mostly in the target language. Provide translations only for complex words. Introduce grammar concepts naturally.",
    B2: "The student can handle complex texts. Speak fully in the target language. Only translate very advanced vocabulary. Challenge them with nuanced grammar.",
    C1: "The student is fluent. Speak entirely in the target language. Use sophisticated vocabulary and complex grammar. Discuss abstract topics.",
    C2: "The student is at near-native level. Speak entirely in the target language like a native speaker. Use idioms, slang, and cultural references freely.",
  };
  
  export async function callAI(messages, system) {
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system,
          messages,
        }),
      });
      const data = await res.json();
      return data.content?.[0]?.text || "";
    } catch {
      return "";
    }
  }
  
  export function buildSystemPrompt(language, level, type) {
    const levelGuide = LEVEL_INSTRUCTIONS[level] || LEVEL_INSTRUCTIONS["A1"];
  
    if (type === "converse") {
      return `You are a warm, encouraging ${language} tutor. ${levelGuide}
  Gently correct mistakes without discouraging the student.
  After your message write exactly "---" on its own line then a JSON: {"translation":"English translation of your message","tip":"one short grammar or vocab tip"}`;
    }
  
    if (type === "vocab") {
      return `You are a ${language} vocabulary teacher. ${levelGuide}
  Return ONLY a valid JSON array of 6 objects. Each: {"word":"${language} word","translation":"English meaning","pronunciation":"phonetic or empty string","example":"short example sentence"}
  No markdown, no preamble, just the JSON array.`;
    }
  
    if (type === "grammar") {
      return `You are a ${language} grammar teacher. ${levelGuide}
  Generate ONE exercise appropriate for ${level} level.
  Return ONLY a JSON object: {"type":"translate|fill|conjugate","instruction":"clear instruction in English","prompt":"the sentence or task","hint":"optional hint or empty string"}
  No markdown, just the JSON.`;
    }
  
    return `You are a helpful ${language} tutor. ${levelGuide}`;
  }