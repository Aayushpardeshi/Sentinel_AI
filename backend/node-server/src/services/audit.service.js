const { prisma } = require("../config/db");
const { logError } = require("../utils/logger");

async function record({
  action,
  resource_type,
  status,
  user_id = null,
  resource_id = null,
  team_id = null,
  metadata_info = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id,
        action,
        resource_type,
        resource_id,
        team_id,
        status,
        metadata_info,
      },
    });
  } catch (error) {
    logError("Failed to record audit log");
  }
}

async function listRecent(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}

module.exports = {
  AuditService: { record, listRecent },
};
