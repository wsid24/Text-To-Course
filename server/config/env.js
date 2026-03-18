const dotenv = require("dotenv");
dotenv.config();

const requiredVars = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY"];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.warn(`⚠️  Warning: ${varName} is not set in environment variables`);
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  AUTH0_ISSUER: process.env.AUTH0_ISSUER,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  NODE_ENV: process.env.NODE_ENV || "development",
};
