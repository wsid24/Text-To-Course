const { z } = require("zod");

const blockZ = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string() }),
  z.object({ type: z.literal("paragraph"), text: z.string() }),
  z.object({ type: z.literal("code"), language: z.string(), text: z.string() }),
  z.object({ type: z.literal("video"), query: z.string() }),
  z.object({
    type: z.literal("mcq"),
    question: z.string(),
    options: z.array(z.string()).length(4),
    answer: z.string(),
    explanation: z.string().optional().default(""),
  }),
]);

const lessonZ = z
  .object({
    title: z.string(),
    objectives: z.array(z.string()).min(1),
    content: z.array(blockZ).min(3),
  })
  .superRefine((val, ctx) => {
    const mcqCount = val.content.filter((b) => b.type === "mcq").length;
    if (mcqCount < 5 || mcqCount > 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Lesson must contain 5–8 MCQ blocks (got ${mcqCount})`,
      });
    }
  });

/**
 * Gemini responseSchema mirror. Note: Gemini's schema dialect does not
 * support oneOf/discriminator, so we use a union-shaped object where
 * unused fields are simply absent at generation time.
 */
const lessonJSONSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    objectives: { type: "array", items: { type: "string" } },
    content: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["heading", "paragraph", "code", "video", "mcq"],
          },
          text: { type: "string" },
          language: { type: "string" },
          query: { type: "string" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["type"],
      },
    },
  },
  required: ["title", "objectives", "content"],
};

module.exports = { lessonZ, blockZ, lessonJSONSchema };
