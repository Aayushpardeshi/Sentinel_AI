const { AuditService } = require("../services/audit.service");

async function listAuditLogs(req, res, next) {
  try {
    const logs = await AuditService.listRecent(100);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
}

module.exports = { listAuditLogs };
