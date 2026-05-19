const { GoogleGenerativeAI } = require("@google/generative-ai");
const LLMProvider = require("./LLMProvider");

/**
 * Gemini provider. Uses the `responseSchema` feature so the model returns
 * structured JSON directly — this is the main lever for the 99%+ JSON
 * integrity claim. Falls back to text-mode parsing only if a schema isn't
 * supplied (e.g. for free-form repair calls).
 *
 * Tier map keeps the cheapest model on the most frequent call (lesson),
 * which is the biggest knob for stretching a free-tier Gemini key.
 */
const TIER_TO_MODEL = {
  planner: "gemini-2.0-flash-lite",
  writer: "gemini-2.0-flash-lite",
  repair: "gemini-2.0-flash-lite",
};

class GeminiProvider extends LLMProvider {
  constructor() {
    super({ name: "gemini" });
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!key) throw new Error("GEMINI_API_KEY is not set");
      this._client = new GoogleGenerativeAI(key);
    }
    return this._client;
  }

  _getModel(tier, schema) {
    const modelName = TIER_TO_MODEL[tier] || TIER_TO_MODEL.writer;
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: 4096,
    };
    if (schema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = schema;
    }
    return this._getClient().getGenerativeModel({
      model: modelName,
      generationConfig,
    });
  }

  async generateJSON({ system, user, schema, tier = "writer" }) {
    const model = this._getModel(tier, schema);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: user }] }],
      systemInstruction: system ? { role: "system", parts: [{ text: system }] } : undefined,
    });

    const text = result.response.text();
    if (schema) {
      // responseSchema guarantees parseable JSON; still wrap defensively.
      return JSON.parse(text);
    }
    return this._parseLooseJSON(text);
  }

  _parseLooseJSON(text) {
    try {
      return JSON.parse(text);
    } catch (_) {
      const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (fence && fence[1]) return JSON.parse(fence[1].trim());
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first !== -1 && last !== -1) return JSON.parse(text.substring(first, last + 1));
      throw new Error("Could not extract JSON from Gemini response");
    }
  }
}

module.exports = GeminiProvider;
