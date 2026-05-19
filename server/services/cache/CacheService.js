const crypto = require("crypto");
const redis = require("redis");

/**
 * Redis-backed cache with two extras on top of plain get/set:
 *
 *   1. Content-addressed key helper — `keyFor(parts)` hashes any input
 *      tuple to a stable SHA-256 prefix, so callers don't need to worry
 *      about escaping topic strings, lesson titles, etc.
 *
 *   2. `getOrSet(key, fn)` — in-process request coalescing. If two
 *      requests for the same key arrive within the same generation
 *      window, only one runs `fn()`; the other awaits the same promise.
 *      This is the cheapest possible defense against duplicate Gemini
 *      calls under concurrent load.
 *
 * Gracefully degrades to a no-op cache if Redis isn't available, so
 * dev environments without Redis still work.
 */
class CacheService {
  constructor() {
    this.isConnected = false;
    this._errorLogged = false;
    this._inflight = new Map();

    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: { reconnectStrategy: false },
      });
      this.client.on("error", () => {
        if (!this._errorLogged) {
          console.warn("⚠️  Redis not available. Caching disabled.");
          this._errorLogged = true;
        }
      });
      this.connect().catch(() => {});
    } catch {
      console.warn("⚠️  Redis client creation failed. Caching disabled.");
      this.client = null;
    }
  }

  async connect() {
    if (!this.isConnected && this.client) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log("📦 Connected to Redis");
      } catch {
        console.warn("⚠️  Redis failed to connect. Caching will be disabled.");
      }
    }
  }

  keyFor(namespace, parts) {
    const input = Array.isArray(parts) ? parts.join("|") : String(parts);
    const hash = crypto.createHash("sha256").update(input).digest("hex").slice(0, 24);
    return `${namespace}:${hash}`;
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error("Redis GET error", err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      console.error("Redis SET error", err);
    }
  }

  async getOrSet(key, ttlSeconds, fn) {
    const cached = await this.get(key);
    if (cached) return { value: cached, hit: true };

    if (this._inflight.has(key)) {
      const value = await this._inflight.get(key);
      return { value, hit: true };
    }

    const promise = (async () => {
      try {
        const fresh = await fn();
        await this.set(key, fresh, ttlSeconds);
        return fresh;
      } finally {
        this._inflight.delete(key);
      }
    })();

    this._inflight.set(key, promise);
    const value = await promise;
    return { value, hit: false };
  }
}

module.exports = new CacheService();
