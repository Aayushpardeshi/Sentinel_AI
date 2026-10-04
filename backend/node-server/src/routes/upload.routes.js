const express = require("express");
const uploadController = require("../controllers/upload.controller");
const { authenticateUser } = require("../middleware/auth.middleware");
const { upload, handleMulterErrors } = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
  "/upload",
  authenticateUser,
  upload.single("file"),
  handleMulterErrors,
  uploadController.uploadDocument
);
router.get("/search", authenticateUser, uploadController.search);

module.exports = router;
