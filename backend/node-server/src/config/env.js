const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: required("DATABASE_URL", "file:./dev.db"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "60m",
  jwtAlgorithm: process.env.JWT_ALGORITHM || "HS256",
  pythonAiServiceUrl: (process.env.PYTHON_AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, ""),
  internalServiceKey: required("INTERNAL_SERVICE_KEY"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 25 * 1024 * 1024),
};

module.exports = { env };
