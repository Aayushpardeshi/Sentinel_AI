const express = require("express");
const userController = require("../controllers/user.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticateUser, userController.getMe);

module.exports = router;
