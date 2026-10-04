const { prisma } = require("../config/db");
const { AuthorizationService } = require("./authorization.service");

async function createDocument({ id, filename, ownerUserId, scope, teamId, status = "PROCESSING" }) {
  return prisma.document.create({
    data: {
      id,
      filename,
      owner_user_id: ownerUserId,
      scope: String(scope).toUpperCase(),
      team_id: teamId ?? null,
      status,
    },
  });
}

async function updateDocumentStatus(id, status) {
  return prisma.document.update({
    where: { id },
    data: { status },
  });
}

async function getDocumentsForUser(userId) {
  const userTeams = await AuthorizationService.getUserTeams(userId);

  const docs = await prisma.document.findMany({
    where: {
      OR: [
        { owner_user_id: userId },
        { team_id: { in: userTeams.length ? userTeams : [-1] } },
      ],
    },
    orderBy: { uploaded_at: "desc" },
  });

  return docs.filter((doc) => {
    if (doc.scope === "PERSONAL") return doc.owner_user_id === userId;
    if (doc.scope === "TEAM") return userTeams.includes(doc.team_id);
    return false;
  });
}

async function deleteDocument(documentId) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (doc) {
    await prisma.document.delete({ where: { id: documentId } });
  }
  return doc;
}

module.exports = {
  DocumentService: {
    createDocument,
    updateDocumentStatus,
    getDocumentsForUser,
    deleteDocument,
  },
};
