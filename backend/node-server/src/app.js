const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const { PythonAiService } = require("./services/python-ai.service");
const { errorMiddleware, notFoundMiddleware } = require("./middleware/error.middleware");
const { ensureUploadDir } = require("./middleware/upload.middleware");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const teamRoutes = require("./routes/team.routes");
const documentRoutes = require("./routes/document.routes");
const chatRoutes = require("./routes/chat.routes");
const auditRoutes = require("./routes/audit.routes");
const uploadRoutes = require("./routes/upload.routes");

function createApp() {
  ensureUploadDir();

  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin.split(",").map((origin) => origin.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/", (req, res) => {
    res.json({
      project: "Sentinel AI",
      version: "1.0.0",
      status: "Running",
    });
  });

  app.get("/health", async (req, res) => {
    const aiService = await PythonAiService.health();
    res.json({
      status: "Healthy",
      aiService,
    });
  });

  app.get("/api/health", async (req, res) => {
    const aiService = await PythonAiService.health();
    res.json({
      status: "ok",
      aiService,
    });
  });

  app.use(authRoutes);
  app.use(userRoutes);
  app.use(teamRoutes);
  app.use(documentRoutes);
  app.use(chatRoutes);
  app.use(auditRoutes);
  app.use(uploadRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
