const express = require("express");
const documentController = require("../controllers/document.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/documents", authenticateUser, documentController.listDocuments);
router.get("/documents/:documentId", authenticateUser, documentController.getDocument);
router.delete("/documents/:documentId", authenticateUser, documentController.deleteDocument);

module.exports = router;
