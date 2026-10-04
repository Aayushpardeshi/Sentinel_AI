const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/auth.middleware");
const { requireBodyFields } = require("../middleware/validation.middleware");

const router = express.Router();

router.post("/register", requireBodyFields(["email", "password"]), authController.register);
router.post("/login", requireBodyFields(["email", "password"]), authController.login);
router.get("/me", authenticateUser, authController.me);

module.exports = router;
