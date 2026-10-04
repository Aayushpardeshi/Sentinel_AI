const crypto = require("crypto");
const fs = require("fs");
const { DocumentService } = require("../services/document.service");
const { AuthorizationService } = require("../services/authorization.service");
const { AuditService } = require("../services/audit.service");
const { PythonAiService } = require("../services/python-ai.service");
const { HttpError } = require("../utils/httpError");

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      throw new HttpError(400, "File is required");
    }

    let scope = String(req.body.scope || "PERSONAL").toUpperCase();
    if (!["PERSONAL", "TEAM"].includes(scope)) {
      throw new HttpError(400, "Invalid scope");
    }

    let teamId = req.body.team_id ? Number(req.body.team_id) : null;
    if (scope === "TEAM") {
      if (!teamId) {
        throw new HttpError(400, "team_id is required for TEAM scope");
      }
      if (!(await AuthorizationService.isTeamMember(req.user.id, teamId))) {
        await AuditService.record({
          action: "ACCESS_DENIED",
          resource_type: "TEAM",
          resource_id: String(teamId),
          team_id: teamId,
          status: "DENIED",
          user_id: req.user.id,
        });
        throw new HttpError(403, "Not authorized for this team");
      }
    } else {
      teamId = null;
    }

    const documentId = crypto.randomUUID();
    const uploadedAt = new Date().toISOString();
    const originalFilename = req.file.originalname;

    await DocumentService.createDocument({
      id: documentId,
      filename: originalFilename,
      ownerUserId: req.user.id,
      scope,
      teamId,
      status: "PROCESSING",
    });

    try {
      const aiResult = await PythonAiService.processDocument({
        filePath: req.file.path,
        originalFilename,
        documentId,
        uploadedAt,
        scope,
        ownerUserId: req.user.id,
        teamId,
      });

      await DocumentService.updateDocumentStatus(documentId, "COMPLETED");
      await AuditService.record({
        action: "DOCUMENT_UPLOAD",
        resource_type: "DOCUMENT",
        resource_id: documentId,
        team_id: teamId,
        status: "SUCCESS",
        user_id: req.user.id,
      });

      res.status(200).json({
        message: "Uploaded Successfully",
        document_id: documentId,
        filename: originalFilename,
        characters: aiResult.characters,
        chunks: aiResult.chunks,
        scope,
        team_id: teamId,
      });
    } catch (error) {
      await DocumentService.updateDocumentStatus(documentId, "FAILED");
      throw error;
    } finally {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
}

async function search(req, res, next) {
  try {
    const query = Array.isArray(req.query.query) ? req.query.query[0] : req.query.query;
    const documentId = Array.isArray(req.query.document_id) ? req.query.document_id[0] : req.query.document_id || null;

    if (!query) {
      throw new HttpError(422, "query is required");
    }

    if (documentId && !(await AuthorizationService.canAccessDocument(req.user.id, documentId))) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "DOCUMENT",
        resource_id: documentId,
        status: "DENIED",
        user_id: req.user.id,
      });
      throw new HttpError(404, "Document not found");
    }

    const userTeams = await AuthorizationService.getUserTeams(req.user.id);
    const result = await PythonAiService.search({
      query,
      document_id: documentId,
      user_id: req.user.id,
      user_teams: userTeams,
      limit: 3,
    });

    await AuditService.record({
      action: "DOCUMENT_QUERY",
      resource_type: "DOCUMENT",
      resource_id: documentId,
      status: "SUCCESS",
      user_id: req.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadDocument, search };
