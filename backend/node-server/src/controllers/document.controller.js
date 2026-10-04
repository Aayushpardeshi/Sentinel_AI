const { DocumentService } = require("../services/document.service");
const { AuthorizationService } = require("../services/authorization.service");
const { AuditService } = require("../services/audit.service");
const { PythonAiService } = require("../services/python-ai.service");
const { HttpError } = require("../utils/httpError");

async function listDocuments(req, res, next) {
  try {
    const documents = await DocumentService.getDocumentsForUser(req.user.id);
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
}

async function getDocument(req, res, next) {
  try {
    const documentId = req.params.documentId;
    const allowed = await AuthorizationService.canAccessDocument(req.user.id, documentId);
    const doc = await AuthorizationService.getDocument(documentId);

    if (!allowed || !doc) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "DOCUMENT",
        resource_id: documentId,
        team_id: doc ? doc.team_id : null,
        status: "DENIED",
        user_id: req.user.id,
      });
      throw new HttpError(404, "Document not found");
    }

    await AuditService.record({
      action: "DOCUMENT_VIEW",
      resource_type: "DOCUMENT",
      resource_id: documentId,
      team_id: doc.team_id,
      status: "SUCCESS",
      user_id: req.user.id,
    });
    res.status(200).json(doc);
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const documentId = req.params.documentId;
    const allowed = await AuthorizationService.canDeleteDocument(req.user.id, documentId);

    if (!allowed) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "DOCUMENT",
        resource_id: documentId,
        status: "DENIED",
        user_id: req.user.id,
      });
      throw new HttpError(403, "Not authorized to delete this document");
    }

    const filenameResult = await PythonAiService.deleteDocumentVectors(documentId);
    const deleted = await DocumentService.deleteDocument(documentId);

    await AuditService.record({
      action: "DOCUMENT_DELETE",
      resource_type: "DOCUMENT",
      resource_id: documentId,
      team_id: deleted ? deleted.team_id : null,
      status: "SUCCESS",
      user_id: req.user.id,
    });

    res.status(200).json({
      message: "Document deleted successfully",
      document_id: documentId,
      filename: filenameResult.filename || (deleted && deleted.filename),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { listDocuments, getDocument, deleteDocument };
