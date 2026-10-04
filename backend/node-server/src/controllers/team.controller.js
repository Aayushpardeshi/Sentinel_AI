const { TeamService } = require("../services/team.service");
const { AuditService } = require("../services/audit.service");
const { AuthorizationService } = require("../services/authorization.service");
const { HttpError } = require("../utils/httpError");

async function createTeam(req, res, next) {
  try {
    const team = await TeamService.createTeam(req.body.name, req.user.id);
    await AuditService.record({
      action: "TEAM_CREATE",
      resource_type: "TEAM",
      resource_id: String(team.id),
      team_id: team.id,
      status: "SUCCESS",
      user_id: req.user.id,
    });
    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
}

async function listTeams(req, res, next) {
  try {
    const teams = await TeamService.getTeams(req.user.id);
    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
}

async function getTeam(req, res, next) {
  const teamId = Number(req.params.teamId);
  try {
    const team = await TeamService.getTeam(teamId, req.user.id);
    await AuditService.record({
      action: "TEAM_VIEW",
      resource_type: "TEAM",
      resource_id: String(teamId),
      team_id: teamId,
      status: "SUCCESS",
      user_id: req.user.id,
    });
    res.status(200).json(team);
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "TEAM",
        resource_id: String(teamId),
        team_id: teamId,
        status: "DENIED",
        user_id: req.user.id,
      });
    }
    next(error);
  }
}

async function addMember(req, res, next) {
  const teamId = Number(req.params.teamId);
  try {
    if (!(await AuthorizationService.hasTeamRole(req.user.id, teamId, ["OWNER", "ADMIN"]))) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "TEAM_MEMBER",
        resource_id: String(req.body.user_id),
        team_id: teamId,
        status: "DENIED",
        user_id: req.user.id,
      });
      throw new HttpError(403, "Not authorized to manage members");
    }

    const member = await TeamService.addMember(teamId, Number(req.body.user_id), req.body.role);
    await AuditService.record({
      action: "TEAM_MEMBER_ADD",
      resource_type: "TEAM",
      resource_id: String(req.body.user_id),
      team_id: teamId,
      status: "SUCCESS",
      user_id: req.user.id,
    });
    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  const teamId = Number(req.params.teamId);
  const userId = Number(req.params.userId);
  try {
    if (!(await AuthorizationService.hasTeamRole(req.user.id, teamId, ["OWNER", "ADMIN"]))) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "TEAM_MEMBER",
        resource_id: String(userId),
        team_id: teamId,
        status: "DENIED",
        user_id: req.user.id,
      });
      throw new HttpError(403, "Not authorized to manage members");
    }

    await TeamService.removeMember(teamId, userId);
    await AuditService.record({
      action: "TEAM_MEMBER_REMOVE",
      resource_type: "TEAM",
      resource_id: String(userId),
      team_id: teamId,
      status: "SUCCESS",
      user_id: req.user.id,
    });
    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = { createTeam, listTeams, getTeam, addMember, removeMember };
