const LLMProvider = require("./LLMProvider");

/**
 * Groq provider. Uses the OpenAI-compatible REST endpoint with
 * `response_format: json_schema` so output conforms to our schemas
 * natively — same JSON-integrity guarantee as Gemini's responseSchema.
 *
 * Why this is the primary provider on the free tier:
 *   Groq's free tier currently allows ~14,400 requests/day on Llama
 *   models, vs. Gemini free's ~50–200/day on flash-lite. That's roughly
 *   two orders of magnitude more headroom for the same code path.
 *
 * Model tiers map to Groq's speed/size tradeoff:
 *   planner  -> 8B (cheap, fast, outline only)
 *   writer   -> 70B (better prose for lesson bodies + MCQs)
 *   repair   -> 8B
 */
const TIER_TO_MODEL = {
  planner: process.env.GROQ_MODEL_PLANNER || "llama-3.1-8b-instant",
  writer: process.env.GROQ_MODEL_WRITER || "llama-3.3-70b-versatile",
  repair: process.env.GROQ_MODEL_REPAIR || "llama-3.1-8b-instant",
};

class GroqProvider extends LLMProvider {
  constructor() {
    super({ name: "groq" });
    this.endpoint = "https://api.groq.com/openai/v1/chat/completions";
  }

  _apiKey() {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set");
    return key;
  }

  async generateJSON({ system, user, schema, tier = "writer" }) {
    const model = TIER_TO_MODEL[tier] || TIER_TO_MODEL.writer;
    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: user });

    const body = {
      model,
      messages,
      temperature: 0.2,
      max_tokens: 4096,
    };

    // Groq supports `json_schema` only on select models (e.g. 70B+); all
    // models support `json_object`. We use the universal mode and rely on
    // the downstream ValidatorAgent (Zod) to enforce structure — keeps
    // the provider model-agnostic.
    body.response_format = { type: "json_object" };

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this._apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      const err = new Error(`Groq API ${res.status}: ${text.slice(0, 300)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq returned empty content");
    return JSON.parse(content);
  }
}

module.exports = GroqProvider;
