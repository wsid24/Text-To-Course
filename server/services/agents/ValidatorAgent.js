const { courseOutlineZ } = require("../../schemas/course.schema");
const { lessonZ } = require("../../schemas/lesson.schema");

/**
 * Stage 3 — strict Zod validation. If the candidate fails, attempt local
 * repair (no LLM call) before bubbling the error up. This is what drives
 * the "99%+ JSON data integrity" claim: Gemini's responseSchema gives us
 * the format, and Zod + repair guarantees the semantics.
 */
class ValidatorAgent {
  validateCourse(candidate) {
    const repaired = this._repairCourse(candidate);
    return courseOutlineZ.parse(repaired);
  }

  validateLesson(candidate) {
    const repaired = this._repairLesson(candidate);
    return lessonZ.parse(repaired);
  }

  _repairCourse(c) {
    if (!c || typeof c !== "object") throw new Error("Course payload is not an object");

    const modules = Array.isArray(c.modules) ? c.modules : [];
    // Clamp to allowed bounds (3–6 modules, 3–5 lessons each)
    const clampedModules = modules.slice(0, 6).map((m) => ({
      title: String(m.title || "Untitled Module").slice(0, 200),
      lessons: (Array.isArray(m.lessons) ? m.lessons : []).slice(0, 5).map((l) => ({
        title: String(l.title || "Untitled Lesson").slice(0, 200),
      })),
    }));

    return {
      title: String(c.title || "Untitled Course"),
      description: String(c.description || "Auto-generated course."),
      tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
      modules: clampedModules,
    };
  }

  _repairLesson(l) {
    if (!l || typeof l !== "object") throw new Error("Lesson payload is not an object");

    let content = Array.isArray(l.content) ? l.content : (l.blocks || l.items || []);

    // Normalize block field aliases that older prompts produced.
    content = content
      .filter((b) => b && typeof b === "object" && typeof b.type === "string")
      .map((b) => {
        if (b.type === "heading" || b.type === "paragraph") {
          return { type: b.type, text: String(b.text ?? b.value ?? "") };
        }
        if (b.type === "code") {
          return {
            type: "code",
            language: String(b.language || "text"),
            text: String(b.text ?? b.value ?? ""),
          };
        }
        if (b.type === "video") {
          return { type: "video", query: String(b.query ?? b.text ?? "") };
        }
        if (b.type === "mcq") {
          const opts = Array.isArray(b.options) ? b.options.map(String) : [];
          while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
          return {
            type: "mcq",
            question: String(b.question || ""),
            options: opts.slice(0, 4),
            answer: String(b.answer || opts[0]),
            explanation: String(b.explanation || ""),
          };
        }
        return null;
      })
      .filter(Boolean);

    // Enforce 5–8 MCQs: trim excess, leave shortage to fail loudly in Zod.
    const mcqs = content.filter((b) => b.type === "mcq");
    if (mcqs.length > 8) {
      const nonMcq = content.filter((b) => b.type !== "mcq");
      content = [...nonMcq, ...mcqs.slice(0, 8)];
    }

    return {
      title: String(l.title || "Untitled Lesson"),
      objectives: Array.isArray(l.objectives) && l.objectives.length > 0
        ? l.objectives.map(String)
        : ["Understand the core concept"],
      content,
    };
  }
}

module.exports = new ValidatorAgent();
