const { createApp } = require("./app");
const { env } = require("./config/env");
const { connectDb } = require("./config/db");
const { logInfo, logError } = require("./utils/logger");

async function start() {
  try {
    await connectDb();
    const app = createApp();
    app.listen(env.port, () => {
      logInfo(`Sentinel AI Node API listening on port ${env.port}`);
    });
  } catch (error) {
    logError("Failed to start Node API");
    process.exit(1);
  }
}

start();
