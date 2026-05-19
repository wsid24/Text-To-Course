const { MemoryVectorStore } = require("@langchain/classic/vectorstores/memory");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Document } = require("@langchain/core/documents");

class RAGService {
  constructor() {
    // Lazy-init: embeddings are created on first use to avoid crash if API key is missing at startup
    this.embeddings = null;
    this.vectorStore = null;
    this.isInitialized = false;
  }

  /**
   * Lazily creates the embedding model on first use.
   */
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

  /**
   * Initializes the Vector Database.
   * In a production environment with Pinecone/ChromaDB, this would connect to the DB.
   * Here we use LangChain's MemoryVectorStore for demonstration.
   */
  async initialize(documents = []) {
    const docs = documents.length > 0 ? documents : [
      new Document({ 
        pageContent: "Text-to-Course platforms use Generative AI to structure hierarchical curriculums consisting of modules and lessons.", 
        metadata: { source: "system_default" } 
      })
    ];
    
    this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this._getEmbeddings());
    this.isInitialized = true;
    console.log("📚 RAG Pipeline Initialized (MemoryVectorStore)");
  }

  /**
   * Performs a similarity search to ground the LLM's response.
   */
  async retrieveContext(query, k = 3) {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (err) {
        console.warn("RAG initialization failed, returning empty context.", err.message);
        return "";
      }
    }
    try {
      const results = await this.vectorStore.similaritySearch(query, k);
      return results.map(r => r.pageContent).join("\n\n");
    } catch (err) {
      console.warn("RAG Retrieval failed, returning empty context.", err.message);
      return "";
    }
  }
}

// Export a singleton instance
module.exports = new RAGService();
