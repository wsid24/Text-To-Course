const redis = require("redis");

class CacheService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    this.client.on("error", (err) => console.warn("Redis Client Error", err.message));
    this.isConnected = false;
    // Attempt connection immediately, but gracefully degrade if Redis is down
    this.connect().catch(() => {});
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
        console.log("📦 Connected to Redis");
      } catch (err) {
        console.warn("⚠️ Redis failed to connect. Caching will be disabled.");
      }
    }
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
      await this.client.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
      });
    } catch (err) {
      console.error("Redis SET error", err);
    }
  }
}

// Export a singleton instance
module.exports = new CacheService();
