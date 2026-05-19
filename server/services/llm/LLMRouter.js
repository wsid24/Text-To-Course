const GeminiProvider = require("./GeminiProvider");
const GroqProvider = require("./GroqProvider");
const MockProvider = require("./MockProvider");

/**
 * LLMRouter is the single choke-point for every LLM call in the system.
 *
 * NEW: Provider fallback chain.
 *   LLM_PROVIDERS=groq,gemini,mock     (comma-separated, in priority order)
 *
 * Behaviour per request:
 *   - Try provider 1 with exponential-backoff retry on transient errors.
 *   - If provider 1 hits its quota breaker (3 consecutive quota errors),
 *     skip to provider 2 for THIS request and future requests until the
 *     cooldown expires.
 *   - Provider 2 follows the same retry/breaker rules.
 *   - If ALL providers fail, throw the last error.
 *
 * Each provider keeps its own breaker state, so Gemini being dead never
 * stops Groq, and vice versa. This is what makes the free-tier setup
 * survive Gemini's brutal daily limits.
 *
 * Concurrency: global cap of LLM_MAX_CONCURRENCY (default 3) across all
 * providers — matches the "3 concurrent user sessions" claim.
 */
class LLMRouter {
  constructor() {
    this._active = 0;
    this._waiting = [];
    this.providers = null; // lazy: built on first call so dotenv has time to load
  }

  _ensureInit() {
    if (this.providers) return;
    this.maxConcurrency = parseInt(process.env.LLM_MAX_CONCURRENCY || "3", 10);
    this.maxRetries = parseInt(process.env.LLM_MAX_RETRIES || "4", 10);
    this.cooldownMs = parseInt(process.env.LLM_COOLDOWN_MS || "60000", 10);
    this.providers = this._buildChain();
    console.log(
      `🧠 LLMRouter ready (chain=${this.providers.map((p) => p.provider.name).join("→") || "<empty>"}, maxConcurrency=${this.maxConcurrency})`
    );
  }

  _buildChain() {
    // Back-compat: if LLM_PROVIDER is set (legacy single-provider form), honor it.
    const legacy = (process.env.LLM_PROVIDER || "").toLowerCase();
    const raw = process.env.LLM_PROVIDERS || legacy || "groq,gemini,mock";
    const names = raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    return names
      .map((name) => this._instantiate(name))
      .filter(Boolean)
      .map((provider) => ({
        provider,
        breakerUntil: 0,
        consecutiveQuotaErrors: 0,
      }));
  }

  _instantiate(name) {
    try {
      if (name === "groq") {
        if (!process.env.GROQ_API_KEY) {
          console.log("⏭️  Skipping groq provider (GROQ_API_KEY not set)");
          return null;
        }
        return new GroqProvider();
      }
      if (name === "gemini") {
        if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
          console.log("⏭️  Skipping gemini provider (GEMINI_API_KEY not set)");
          return null;
        }
        return new GeminiProvider();
      }
      if (name === "mock") return new MockProvider();
      console.warn(`Unknown LLM provider: ${name}`);
      return null;
    } catch (err) {
      console.warn(`Failed to instantiate ${name}: ${err.message}`);
      return null;
    }
  }

  async generateJSON(opts) {
    this._ensureInit();
    if (this.providers.length === 0) {
      throw new Error("No LLM providers available. Set GROQ_API_KEY or GEMINI_API_KEY.");
    }

    // Per-request provider override: reorder the chain so the chosen
    // provider is tried first, but keep the others as automatic fallback.
    // The breaker state on each slot is preserved (it's tracked on the
    // slot object, not the position).
    const chain = this._chainForRequest(opts.provider);

    await this._acquireSlot();
    try {
      let lastErr;
      for (const slot of chain) {
        if (Date.now() < slot.breakerUntil) continue;
        try {
          return await this._callWithRetries(slot, opts);
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error("All LLM providers failed");
    } finally {
      this._releaseSlot();
    }
  }

  _chainForRequest(preferred) {
    if (!preferred) return this.providers;
    const chosen = this.providers.find((s) => s.provider.name === preferred);
    if (!chosen) return this.providers; // fall back to default chain if unknown
    const rest = this.providers.filter((s) => s.provider.name !== preferred);
    return [chosen, ...rest];
  }

  async _callWithRetries(slot, opts) {
    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const out = await slot.provider.generateJSON(opts);
        slot.consecutiveQuotaErrors = 0;
        return out;
      } catch (err) {
        lastErr = err;
        const isQuota = slot.provider.isQuotaError(err);

        if (isQuota) {
          slot.consecutiveQuotaErrors += 1;
          if (slot.consecutiveQuotaErrors >= 3) {
            slot.breakerUntil = Date.now() + this.cooldownMs;
            console.warn(
              `🛑 ${slot.provider.name} quota breaker tripped. Cooling for ${this.cooldownMs}ms — falling back to next provider.`
            );
            throw err;
          }
        } else if (this._isNonRetryable(err)) {
          // 4xx client errors (bad request, auth, unsupported model) won't
          // succeed on retry. Bail immediately so the next provider gets a turn.
          console.warn(
            `⏭️  ${slot.provider.name} non-retryable error (${err.message.slice(0, 140)}). Skipping to next provider.`
          );
          throw err;
        }

        if (attempt === this.maxRetries) break;
        const base = isQuota ? 4000 : 800;
        const delay = base * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
        console.warn(
          `⚠️  ${slot.provider.name} attempt ${attempt + 1} failed (${err.message.slice(0, 120)}). Retrying in ${delay}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }

  _isNonRetryable(err) {
    const status = err && (err.status || err.statusCode);
    if (status && status >= 400 && status < 500 && status !== 429) return true;
    // Extract status from error message text as a fallback (some SDKs swallow .status).
    const m = (err && err.message) || "";
    if (/\b4(0\d|1\d|2[0-8])\b/.test(m) && !/429/.test(m)) return true;
    return false;
  }

  _acquireSlot() {
    return new Promise((resolve) => {
      const tryAcquire = () => {
        if (this._active < this.maxConcurrency) {
          this._active += 1;
          resolve();
        } else {
          this._waiting.push(tryAcquire);
        }
      };
      tryAcquire();
    });
  }

  _releaseSlot() {
    this._active -= 1;
    const next = this._waiting.shift();
    if (next) next();
  }
}

module.exports = new LLMRouter();
