/**
 * Build the prompt for Gemini to generate a full course structure.
 */
const buildCoursePrompt = (topic, difficulty = "beginner", moduleCount = 5) => {
  return `You are an expert curriculum designer and educator. Generate a comprehensive, well-structured online course on the following topic.

TOPIC: "${topic}"
DIFFICULTY LEVEL: ${difficulty}
NUMBER OF MODULES: ${moduleCount}

Each module should contain 3-5 lessons. Each lesson must have detailed, educational content written in Markdown format (at least 200 words per lesson).

IMPORTANT: You MUST respond with valid JSON only. No extra text, no markdown fences, just pure JSON in this exact structure:

{
  "title": "Course Title",
  "description": "A 2-3 sentence course description",
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "Brief module description",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson Title",
          "content": "Full lesson content in Markdown (detailed, educational, at least 200 words)",
          "order": 1
        }
      ]
    }
  ]
}

Make sure the content is:
- Accurate and educational
- Progressive (builds upon previous lessons)
- Practical with real-world examples
- Engaging and easy to understand for a ${difficulty} level learner`;
};

module.exports = { buildCoursePrompt };
