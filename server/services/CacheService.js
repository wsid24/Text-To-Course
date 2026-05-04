const redis = require("redis");

class CacheService {
  constructor() {
    this.isConnected = false;
    this._errorLogged = false;
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        socket: { reconnectStrategy: false }, // Don't spam reconnect attempts
      });
      this.client.on("error", () => {
        if (!this._errorLogged) {
          console.warn("⚠️ Redis not available. Caching disabled.");
          this._errorLogged = true;
        }
      });
      this.connect().catch(() => {});
    } catch {
      console.warn("⚠️ Redis client creation failed. Caching disabled.");
      this.client = null;
    }
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
