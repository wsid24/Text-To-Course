const PlannerAgent = require("../agents/PlannerAgent");
const ValidatorAgent = require("../agents/ValidatorAgent");
const FormatterAgent = require("../agents/FormatterAgent");
const CacheService = require("../cache/CacheService");

/**
 * Course generation pipeline: Plan → Validate → Format.
 *
 * The whole pipeline is gated by `CacheService.getOrSet`, which means:
 *   - Repeat topics hit Redis instead of Gemini.
 *   - Simultaneous identical requests collapse to a single Gemini call
 *     (in-process coalescing).
 */
class CoursePipeline {
  async run(topic, { provider } = {}) {
    const normalized = topic.trim().toLowerCase();
    // Include provider in cache key so different LLMs don't share each other's output.
    const cacheKey = CacheService.keyFor("course", [normalized, provider || "auto"]);

    const { value, hit } = await CacheService.getOrSet(cacheKey, 86400, async () => {
      console.log(`🎯 Pipeline: planning course for "${topic}" (provider=${provider || "auto"})`);
      let lastErr;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const raw = await PlannerAgent.run(topic, { provider });
          const validated = ValidatorAgent.validateCourse(raw);
          return FormatterAgent.formatCourse(validated);
        } catch (err) {
          lastErr = err;
          console.warn(`Course pipeline attempt ${attempt + 1} failed: ${err.message.slice(0, 160)}`);
        }
      }
      throw lastErr;
    });

    if (hit) console.log(`⚡ Course cache hit for "${topic}"`);
    return value;
  }
}

module.exports = new CoursePipeline();
