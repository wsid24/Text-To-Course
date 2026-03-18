const { GoogleGenerativeAI } = require("@google/generative-ai");

// You might need to adjust env variable imports based on your structure
const env = require("../config/env") || {};
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // or gemini-2.0-flash

/**
 * Utility to reliably extract and parse JSON from Gemini's response.
 */
function parseGeminiJSON(text) {
  try {
    // Attempt parsing directly first
    return JSON.parse(text);
  } catch (error) {
    // If that fails, try extracting from markdown blocks if Gemini ignored the instruction
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
      // Try to find the first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
      throw new Error("Could not extract JSON from response");
    } catch (innerError) {
      throw new Error(`JSON parsing failed: ${innerError.message}. Response was: ${text}`);
    }
  }
}

/**
 * Generates a course outline based on a topic.
 * @param {string} topic 
 */
const generateCourse = async (topic) => {
  const prompt = `
You are an expert curriculum designer. Create a comprehensive course outline for the topic: "${topic}".
Return ONLY a JSON object (no markdown, no code blocks, no backticks, no conversational text).

Requirements:
- Create 3-5 modules.
- Each module must have 3-4 lessons.
- The course must progress logically from foundational concepts to advanced topics.

The output MUST exactly match this JSON shape:
{
  "title": "String",
  "description": "String",
  "tags": ["String"],
  "modules": [
    {
      "title": "String",
      "lessons": [
        {
          "title": "String"
        }
      ]
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseGeminiJSON(text);
  } catch (error) {
    throw new Error(`Failed to generate course: ${error.message}`);
  }
};

/**
 * Generates detailed lesson content.
 * @param {string} courseTitle 
 * @param {string} moduleTitle 
 * @param {string} lessonTitle 
 */
const generateLesson = async (courseTitle, moduleTitle, lessonTitle) => {
  const prompt = `
You are an expert educator. Create detailed lesson content for a lesson titled "${lessonTitle}".
This lesson is part of the module "${moduleTitle}" in the course "${courseTitle}".
Return ONLY a JSON object (no markdown, no code blocks, no backticks, no conversational text).

Requirements:
- Provide clear objectives.
- Create engaging content blocks.
- Generate exactly 4 Multiple Choice Questions (MCQs) at the end of the lesson to test understanding.

Supported content block types:
1. {"type": "heading", "text": "String"}
2. {"type": "paragraph", "text": "String"}
3. {"type": "code", "language": "String", "text": "String"}
4. {"type": "video", "query": "String"} (a search query to find a relevant educational video)
5. {"type": "mcq", "question": "String", "options": ["String"], "answer": "String", "explanation": "String"}

The output MUST exactly match this JSON shape:
{
  "title": "${lessonTitle}",
  "objectives": ["String"],
  "content": [
    // Include heading, paragraph, code, and video blocks here
    // Include EXACTLY 4 mcq blocks here
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseGeminiJSON(text);
  } catch (error) {
    throw new Error(`Failed to generate lesson: ${error.message}`);
  }
};

module.exports = {
  generateCourse,
  generateLesson
};
