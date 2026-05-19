const { z } = require("zod");

/**
 * Outline-stage schema. Lessons here are just titles — full content is
 * generated lazily on first view via LessonPipeline.
 */
const courseOutlineZ = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.array(z.string()).default([]),
  modules: z
    .array(
      z.object({
        title: z.string().min(2),
        lessons: z
          .array(z.object({ title: z.string().min(2) }))
          .min(3)
          .max(5),
      })
    )
    .min(3)
    .max(6),
});

/**
 * JSON Schema mirror, fed to Gemini's `responseSchema` so the model emits
 * conformant JSON natively. Kept hand-written (not zod-to-json-schema)
 * because Gemini supports only a strict OpenAPI subset.
 */
const courseOutlineJSONSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          lessons: {
            type: "array",
            items: {
              type: "object",
              properties: { title: { type: "string" } },
              required: ["title"],
            },
          },
        },
        required: ["title", "lessons"],
      },
    },
  },
  required: ["title", "description", "modules"],
};

module.exports = { courseOutlineZ, courseOutlineJSONSchema };
