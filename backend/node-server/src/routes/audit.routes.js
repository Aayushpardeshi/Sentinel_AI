const express = require("express");
const auditController = require("../controllers/audit.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/audit-logs", authenticateUser, auditController.listAuditLogs);

module.exports = router;
