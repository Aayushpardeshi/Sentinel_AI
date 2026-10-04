const express = require("express");
const chatController = require("../controllers/chat.controller");
const { authenticateUser } = require("../middleware/auth.middleware");
const { requireBodyFields } = require("../middleware/validation.middleware");

const router = express.Router();

router.post("/chat", authenticateUser, requireBodyFields(["prompt"]), chatController.chat);

module.exports = router;
