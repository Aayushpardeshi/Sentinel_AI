const { prisma } = require("../config/db");
const { canAccessDocumentRecord, canDeleteDocumentRecord } = require("./authorization.rules");

async function isTeamMember(userId, teamId) {
  const membership = await prisma.teamMember.findFirst({
    where: { user_id: userId, team_id: teamId },
  });
  return Boolean(membership);
}

async function hasTeamRole(userId, teamId, roles) {
  const membership = await prisma.teamMember.findFirst({
    where: { user_id: userId, team_id: teamId },
  });
  if (!membership) return false;
  return roles.includes(membership.role);
}

async function getUserTeams(userId) {
  const memberships = await prisma.teamMember.findMany({
    where: { user_id: userId },
    select: { team_id: true },
  });
  return memberships.map((m) => m.team_id);
}

async function getDocument(documentId) {
  return prisma.document.findUnique({ where: { id: documentId } });
}

async function canAccessDocument(userId, documentId) {
  const document = await getDocument(documentId);
  if (!document) return false;
  if (document.scope === "PERSONAL") {
    return canAccessDocumentRecord(userId, document, [document.team_id]);
  }
  const member = await isTeamMember(userId, document.team_id);
  return canAccessDocumentRecord(userId, document, member ? [document.team_id] : []);
}

async function canDeleteDocument(userId, documentId) {
  const document = await getDocument(documentId);
  if (!document) return false;
  if (document.scope === "PERSONAL") {
    return canDeleteDocumentRecord(userId, document, null);
  }
  const membership = await prisma.teamMember.findFirst({
    where: { user_id: userId, team_id: document.team_id },
  });
  return canDeleteDocumentRecord(userId, document, membership ? membership.role : null);
}

module.exports = {
  AuthorizationService: {
    isTeamMember,
    hasTeamRole,
    getUserTeams,
    getDocument,
    canAccessDocument,
    canDeleteDocument,
    canAccessDocumentRecord,
    canDeleteDocumentRecord,
  },
};
