const { env } = require("../config/env");
const { logError } = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  let detail = err.detail || err.message || "Internal server error";

  if (status >= 500) {
    logError("Unhandled application error");
    if (env.nodeEnv === "production") {
      detail = "Internal server error";
    }
  }

  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(status).json({ detail });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({ detail: "Not found" });
}

module.exports = { errorMiddleware, notFoundMiddleware };
