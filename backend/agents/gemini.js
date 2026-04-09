import Groq from "groq-sdk";

// Mock the Gemini interface so we don't have to rewrite the 6 agents!
export const model = {
    generateContent: async (prompt) => {
        // Instantiate lazily so process.env is fully loaded by dotenv
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile', 
            temperature: 0.2, // Keep it grounded for JSON structuring
        });
        
        return {
            response: {
                text: () => completion.choices[0]?.message?.content || ""
            }
        };
    }
};

/**
 * Helper to parse a JSON code block from a text response.
 */
export const extractJSON = (text) => {
  try {
    const match = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(text); // fallback if no code blocks
  } catch (e) {
    console.error("Failed to parse JSON output:", text);
    throw new Error("Invalid JSON from LLM");
  }
};
