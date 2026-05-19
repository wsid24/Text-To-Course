const { MemoryVectorStore } = require("@langchain/classic/vectorstores/memory");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Document } = require("@langchain/core/documents");

/**
 * RAGService provides grounding context for LLM calls.
 *
 * KEY-CONSERVATION NOTE
 * ---------------------
 * The embeddings backend calls Gemini under the hood — every retrieval
 * spends quota. To protect a free-tier key, RAG is OFF by default and
 * `retrieveContext` returns an empty string unless RAG_ENABLED=true.
 * The pipeline tolerates empty context, so disabling RAG has no
 * correctness impact, only a "less grounded" prompt.
 *
 * Flip RAG_ENABLED=true in .env when you have headroom on the key, or
 * once you swap the embeddings backend for a non-Gemini one (e.g. local
 * embeddings via @xenova/transformers).
 */
class RAGService {
  constructor() {
    this.embeddings = null;
    this.vectorStore = null;
    this.isInitialized = false;
    this.enabled = String(process.env.RAG_ENABLED || "false").toLowerCase() === "true";
  }

  _getEmbeddings() {
    if (!this.embeddings) {
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        maxRetries: 0,
      });
    }
    return this.embeddings;
  }

  async initialize(documents = []) {
    if (!this.enabled) {
      console.log("📚 RAG disabled (RAG_ENABLED=false). Grounding context will be empty.");
      this.isInitialized = true;
      return;
    }

    const docs = documents.length > 0 ? documents : [
      new Document({
        pageContent:
          "Text-to-Course platforms use Generative AI to structure hierarchical curriculums consisting of modules and lessons.",
        metadata: { source: "system_default" },
      }),
    ];

    this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this._getEmbeddings());
    this.isInitialized = true;
    console.log("📚 RAG Pipeline Initialized (MemoryVectorStore)");
  }

  async retrieveContext(query, k = 3) {
    if (!this.enabled) return "";

    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (err) {
        console.warn("RAG init failed, returning empty context.", err.message);
        return "";
      }
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);
      return results.map((r) => r.pageContent).join("\n\n");
    } catch (err) {
      console.warn("RAG retrieval failed, returning empty context.", err.message);
      return "";
    }
  }
}

module.exports = new RAGService();
