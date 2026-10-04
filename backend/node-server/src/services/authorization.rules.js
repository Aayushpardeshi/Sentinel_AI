function canAccessDocumentRecord(userId, document, userTeams) {
  if (!document) return false;
  if (document.scope === "PERSONAL") {
    return document.owner_user_id === userId;
  }
  if (document.scope === "TEAM") {
    return userTeams.includes(document.team_id);
  }
  return false;
}

function canDeleteDocumentRecord(userId, document, membershipRole) {
  if (!document) return false;
  if (document.scope === "PERSONAL") {
    return document.owner_user_id === userId;
  }
  if (document.scope === "TEAM") {
    return ["OWNER", "ADMIN"].includes(membershipRole);
  }
  return false;
}

module.exports = {
  canAccessDocumentRecord,
  canDeleteDocumentRecord,
};
