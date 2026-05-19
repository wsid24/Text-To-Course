const LLMRouter = require("../llm/LLMRouter");
const RAGService = require("../rag/RAGService");
const { courseOutlineJSONSchema } = require("../../schemas/course.schema");

/**
 * Stage 1 — produces the course outline (3–6 modules × 3–5 lesson titles).
 * Deliberately short on tokens: no lesson bodies here. That keeps the
 * outline call cheap and lets the Writer agent generate lesson content
 * lazily on demand.
 */
class PlannerAgent {
  async run(topic, { provider } = {}) {
    const context = await RAGService.retrieveContext(`Curriculum design for ${topic}`);

    const system = `You are an expert curriculum designer.
Use this verified context to ground the curriculum and reduce hallucinations:
<context>
${context}
</context>

Hard requirements (MUST be satisfied exactly):
- The "modules" array MUST have AT LEAST 3 and AT MOST 6 entries. 2 modules is INVALID.
- Each module's "lessons" array MUST have AT LEAST 3 and AT MOST 5 entries. 2 lessons is INVALID.
- Lessons in this stage contain ONLY titles — no body content.
- Before you respond, COUNT the modules and lessons to verify the bounds.

Respond with ONLY valid JSON in this exact shape (no prose, no markdown fences):
{
  "title": "string",
  "description": "string (1-2 sentences)",
  "tags": ["string"],
  "modules": [
    { "title": "string", "lessons": [{ "title": "string" }] }
  ]
}`;

    const user = `Design a structured course outline for topic: "${topic}".`;

    return LLMRouter.generateJSON({
      system,
      user,
      schema: courseOutlineJSONSchema,
      tier: "planner",
      provider,
    });
  }
}

module.exports = new PlannerAgent();
