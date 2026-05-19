const LLMRouter = require("../llm/LLMRouter");
const RAGService = require("../rag/RAGService");
const { lessonJSONSchema } = require("../../schemas/lesson.schema");

/**
 * Stage 2 — generates the body of a single lesson: objectives, content
 * blocks, and 4–5 MCQs. Schema-bound output, RAG-grounded prompt.
 */
class WriterAgent {
  async run({ courseTitle, moduleTitle, lessonTitle, provider }) {
    const context = await RAGService.retrieveContext(`${lessonTitle} in ${courseTitle}`);

    const system = `You are an expert educator. Write lesson content that is engaging,
accurate, and grounded in the supplied context. Avoid hallucinations.

<context>
${context}
</context>

Hard requirements:
- Provide 2–4 clear learning objectives.
- 4 to 7 paragraph/heading/code/video blocks BEFORE the MCQs.
- End with 5 to 8 MCQ blocks. Use more questions for broader/harder topics, fewer for narrow ones — but never less than 5.
- For every MCQ: "answer" MUST appear verbatim in "options" (which has exactly 4 strings).
- Mix difficulty: some recall, some application, some edge-case reasoning.

Respond with ONLY valid JSON in this exact shape (no prose, no markdown fences):
{
  "title": "string",
  "objectives": ["string"],
  "content": [
    { "type": "heading", "text": "string" },
    { "type": "paragraph", "text": "string" },
    { "type": "code", "language": "string", "text": "string" },
    { "type": "video", "query": "string" },
    { "type": "mcq", "question": "string", "options": ["a","b","c","d"], "answer": "string", "explanation": "string" }
  ]
}
The "content" array must mix the block types listed above. Do not invent new "type" values.`;

    const user = `Write the lesson "${lessonTitle}" in module "${moduleTitle}" of course "${courseTitle}".`;

    return LLMRouter.generateJSON({
      system,
      user,
      schema: lessonJSONSchema,
      tier: "writer",
      provider,
    });
  }
}

module.exports = new WriterAgent();
