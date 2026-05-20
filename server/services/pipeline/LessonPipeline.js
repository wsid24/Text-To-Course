const WriterAgent = require("../agents/WriterAgent");
const ValidatorAgent = require("../agents/ValidatorAgent");
const FormatterAgent = require("../agents/FormatterAgent");
const CacheService = require("../cache/CacheService");

/**
 * Lesson generation pipeline: Write → Validate → Format.
 *
 * One retry is allowed if validation fails (the most common cause is
 * Gemini producing <4 MCQs). The retry uses the same cheap-tier model
 * to keep the cost predictable.
 */
class LessonPipeline {
  async run({ courseTitle, courseDescription, moduleTitle, lessonTitle, provider }) {
    const cacheKey = CacheService.keyFor("lesson", [courseTitle, moduleTitle, lessonTitle, provider || "auto"]);

    const { value, hit } = await CacheService.getOrSet(cacheKey, 86400 * 7, async () => {
      console.log(`✍️  Pipeline: writing lesson "${lessonTitle}" (provider=${provider || "auto"})`);
      let lastErr;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const raw = await WriterAgent.run({ courseTitle, courseDescription, moduleTitle, lessonTitle, provider });
          const validated = ValidatorAgent.validateLesson(raw);
          return await FormatterAgent.formatLesson(validated);
        } catch (err) {
          lastErr = err;
          console.warn(`Lesson pipeline attempt ${attempt + 1} failed: ${err.message}`);
        }
      }
      throw lastErr;
    });

    if (hit) console.log(`⚡ Lesson cache hit for "${lessonTitle}"`);
    return value;
  }
}

module.exports = new LessonPipeline();
