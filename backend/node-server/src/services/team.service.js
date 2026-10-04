const { prisma } = require("../config/db");
const { HttpError } = require("../utils/httpError");
const { AuthorizationService } = require("./authorization.service");

const ALLOWED_ROLES = ["OWNER", "ADMIN", "MEMBER"];

async function createTeam(name, currentUserId) {
  const team = await prisma.team.create({
    data: {
      name,
      created_by: currentUserId,
      members: {
        create: {
          user_id: currentUserId,
          role: "OWNER",
        },
      },
    },
  });
  return team;
}

async function getTeams(currentUserId) {
  const memberships = await prisma.teamMember.findMany({
    where: { user_id: currentUserId },
    include: { team: true },
  });

  return memberships.map((membership) => ({
    ...membership.team,
    role: membership.role,
  }));
}

async function getTeam(teamId, currentUserId) {
  const membership = await prisma.teamMember.findFirst({
    where: { team_id: teamId, user_id: currentUserId },
  });
  if (!membership) {
    throw new HttpError(403, "Access denied");
  }
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  return { ...team, role: membership.role };
}

async function addMember(teamId, userId, role) {
  const normalizedRole = String(role || "").toUpperCase();
  if (!ALLOWED_ROLES.includes(normalizedRole)) {
    throw new HttpError(400, "Invalid role");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const existing = await prisma.teamMember.findFirst({
    where: { team_id: teamId, user_id: userId },
  });
  if (existing) {
    throw new HttpError(400, "User is already a member");
  }

  return prisma.teamMember.create({
    data: {
      team_id: teamId,
      user_id: userId,
      role: normalizedRole,
    },
  });
}

async function removeMember(teamId, userId) {
  const member = await prisma.teamMember.findFirst({
    where: { team_id: teamId, user_id: userId },
  });
  if (!member) {
    throw new HttpError(404, "Member not found");
  }
  await prisma.teamMember.delete({ where: { id: member.id } });
}

module.exports = {
  TeamService: {
    createTeam,
    getTeams,
    getTeam,
    addMember,
    removeMember,
    ALLOWED_ROLES,
  },
  AuthorizationService,
};
