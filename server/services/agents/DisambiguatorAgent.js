const LLMRouter = require("../llm/LLMRouter");

/**
 * Cheap one-shot agent that decides whether a topic is ambiguous (multiple
 * common meanings). Used by the frontend to surface a "did you mean..." prompt
 * BEFORE the full course-generation pipeline runs, so we don't waste tokens
 * generating a course about the wrong interpretation.
 *
 * Returns:
 *   { ambiguous: false, interpretations: [] }       — proceed directly
 *   { ambiguous: true,  interpretations: [ ... ] }  — 2–3 choices for the user
 */
const disambiguationJSONSchema = {
  type: "object",
  properties: {
    ambiguous: { type: "boolean" },
    interpretations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          description: { type: "string" },
        },
        required: ["label", "description"],
      },
    },
  },
  required: ["ambiguous", "interpretations"],
};

class DisambiguatorAgent {
  async run(topic, { provider } = {}) {
    const system = `You decide whether a user-supplied course topic is ambiguous.

Return ambiguous=true ONLY if the topic could plausibly refer to TWO OR MORE genuinely well-known subjects from DIFFERENT domains. Examples of true ambiguity:
- "RAG" → Retrieval-Augmented Generation (AI) vs Red/Amber/Green (project status) vs cloth/fabric
- "Java" → programming language vs island vs coffee
- "Python" → programming language vs snake
- "Spring" → Spring Framework (Java) vs season vs mechanical spring

Return ambiguous=false for:
- Clearly-phrased topics ("Introduction to Machine Learning", "Sparse Table in C++")
- Acronyms with one dominant meaning in education ("HTML", "CSS", "SQL")
- Anything where one interpretation is at least 10× more popular than the others

When ambiguous=true, return 2–3 interpretations. Each:
- "label": the disambiguated name (e.g. "Retrieval-Augmented Generation")
- "description": one sentence explaining what it is

When ambiguous=false, return an empty interpretations array.

Respond with ONLY valid JSON (no prose, no markdown fences) in this shape:
{ "ambiguous": boolean, "interpretations": [ { "label": "string", "description": "string" } ] }`;

    const user = `Topic: "${topic}"`;

    return LLMRouter.generateJSON({
      system,
      user,
      schema: disambiguationJSONSchema,
      tier: "planner",
      provider,
    });
  }
}

module.exports = new DisambiguatorAgent();
