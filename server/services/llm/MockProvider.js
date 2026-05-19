const LLMProvider = require("./LLMProvider");

/**
 * Returns canned but schema-shaped responses so the full pipeline can be
 * exercised end-to-end without burning a single Gemini token. Toggled via
 * LLM_PROVIDER=mock — use this for local dev, integration tests, and CI.
 */
class MockProvider extends LLMProvider {
  constructor() {
    super({ name: "mock" });
  }

  async generateJSON({ user, tier }) {
    if (tier === "planner") return this._mockCourse(user);
    if (tier === "writer") return this._mockLesson(user);
    return {};
  }

  _mockCourse(prompt) {
    const topic = (prompt.match(/topic:\s*"?([^"\n]+)"?/i) || [])[1] || "Sample Topic";
    return {
      title: `${topic}: A Complete Guide`,
      description: `A mock course on ${topic} for local development.`,
      tags: [topic.toLowerCase(), "mock"],
      modules: Array.from({ length: 4 }, (_, m) => ({
        title: `Module ${m + 1}: ${topic} Part ${m + 1}`,
        lessons: Array.from({ length: 4 }, (_, l) => ({
          title: `Lesson ${m + 1}.${l + 1}`,
        })),
      })),
    };
  }

  _mockLesson(prompt) {
    const title = (prompt.match(/"([^"]+)"/) || [])[1] || "Mock Lesson";
    return {
      title,
      objectives: ["Understand the basics", "Apply the concept", "Identify pitfalls"],
      content: [
        { type: "heading", text: title },
        { type: "paragraph", text: "This is mock lesson content for local development." },
        { type: "code", language: "javascript", text: "console.log('hello');" },
        { type: "video", query: title },
        ...Array.from({ length: 4 }, (_, i) => ({
          type: "mcq",
          question: `Mock question ${i + 1} about ${title}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A",
          explanation: "Mock explanation.",
        })),
      ],
    };
  }
}

module.exports = MockProvider;
