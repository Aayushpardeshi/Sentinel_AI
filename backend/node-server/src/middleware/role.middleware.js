const { AuthorizationService } = require("../services/authorization.service");
const { AuditService } = require("../services/audit.service");
const { HttpError } = require("../utils/httpError");

function requireTeamRoles(roles) {
  return async (req, res, next) => {
    try {
      const teamId = Number(req.params.teamId);
      const allowed = await AuthorizationService.hasTeamRole(req.user.id, teamId, roles);
      if (!allowed) {
        await AuditService.record({
          action: "ACCESS_DENIED",
          resource_type: "TEAM_MEMBER",
          resource_id: String(req.params.userId || req.body?.user_id || teamId),
          team_id: teamId,
          status: "DENIED",
          user_id: req.user.id,
        });
        throw new HttpError(403, "Not authorized to manage members");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { requireTeamRoles };
