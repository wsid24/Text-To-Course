const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const RAGService = require("./RAGService");

class CurriculumAgent {
  constructor() {
    this._model = null;
  }

  /**
   * Lazily initialize LangChain's Gemini wrapper on first use.
   */
  _getModel() {
    if (!this._model) {
      this._model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash-lite",
        temperature: 0.2,
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        maxRetries: 2,
      });
    }
    return this._model;
  }

  /**
   * Utility to reliably extract JSON from the LLM's response.
   */
  parseJSON(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1].trim());
        }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          return JSON.parse(text.substring(firstBrace, lastBrace + 1));
        }
        throw new Error("Could not extract JSON from response");
      } catch (innerError) {
        throw new Error(`JSON parsing failed: ${innerError.message}`);
      }
    }
  }

  /**
   * Generates a course outline using CoT and RAG.
   */
  async generateCourse(topic) {
    console.log(`🤖 Agent: Generating course for topic: ${topic}`);
    
    // 1. Retrieve grounding context (RAG)
    const context = await RAGService.retrieveContext(`Curriculum design for ${topic}`);
    console.log(`📚 Agent: Retrieved grounding context from VectorDB`);

    // 2. Construct prompt (Removed CoT to vastly increase generation speed)
    const systemPrompt = `You are an expert curriculum designer agent.
Use the following verified context to ground your curriculum and reduce hallucinations:
<context>
${context}
</context>

Requirements:
- Create 3-5 modules.
- Each module must have 3-4 lessons.
- The output MUST be valid JSON matching the exact shape below. Do not wrap in markdown unless it's a code block.

Shape:
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

    // 3. Invoke LangChain Model
    const result = await this._getModel().invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Create a structured course outline for the topic: ${topic}`)
    ]);

    return this.parseJSON(result.content);
  }

  /**
   * Generates detailed lesson content using CoT and RAG.
   */
  async generateLesson(courseTitle, moduleTitle, lessonTitle) {
    console.log(`🤖 Agent: Generating lesson: ${lessonTitle}`);

    // 1. Retrieve grounding context (RAG)
    const context = await RAGService.retrieveContext(`${lessonTitle} in ${courseTitle}`);

    // 2. Construct prompt (Removed CoT to increase speed)
    const systemPrompt = `You are an expert educator agent.
Design engaging, highly educational lesson content.
Ground your content in this verified context to avoid hallucinations:
<context>
${context}
</context>

Requirements:
- Provide clear learning objectives.
- Create engaging content blocks. Supported types: 
  1. {"type": "heading", "text": "String"}
  2. {"type": "paragraph", "text": "String"}
  3. {"type": "code", "language": "String", "text": "String"}
  4. {"type": "video", "query": "String"}
  5. {"type": "mcq", "question": "String", "options": ["String"], "answer": "String", "explanation": "String"}
- Create EXACTLY 4 mcq blocks at the end.
- Output MUST be exactly this JSON shape:
{
  "title": "${lessonTitle}",
  "objectives": ["String"],
  "content": [
    // Include blocks here
  ]
}
`;

    // 3. Invoke LangChain Model
    const result = await this._getModel().invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Generate detailed lesson content for: "${lessonTitle}" which is part of the module "${moduleTitle}" in the course "${courseTitle}".`)
    ]);

    return this.parseJSON(result.content);
  }
}

// Export a singleton instance
module.exports = new CurriculumAgent();
