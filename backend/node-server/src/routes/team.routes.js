const express = require("express");
const teamController = require("../controllers/team.controller");
const { authenticateUser } = require("../middleware/auth.middleware");
const { requireBodyFields } = require("../middleware/validation.middleware");

const router = express.Router();

router.post("/teams", authenticateUser, requireBodyFields(["name"]), teamController.createTeam);
router.get("/teams", authenticateUser, teamController.listTeams);
router.get("/teams/:teamId", authenticateUser, teamController.getTeam);
router.post("/teams/:teamId/members", authenticateUser, requireBodyFields(["user_id", "role"]), teamController.addMember);
router.delete("/teams/:teamId/members/:userId", authenticateUser, teamController.removeMember);

module.exports = router;
