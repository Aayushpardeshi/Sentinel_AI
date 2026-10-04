const { AuthorizationService } = require("../services/authorization.service");
const { AuditService } = require("../services/audit.service");
const { PythonAiService } = require("../services/python-ai.service");
const { HttpError } = require("../utils/httpError");

async function chat(req, res, next) {
  try {
    const prompt = req.body.prompt;
    const documentId = req.body.document_id || null;

    if (!prompt) {
      throw new HttpError(422, "prompt is required");
    }

    if (documentId && !(await AuthorizationService.canAccessDocument(req.user.id, documentId))) {
      await AuditService.record({
        action: "ACCESS_DENIED",
        resource_type: "DOCUMENT",
        resource_id: documentId,
        status: "DENIED",
        user_id: req.user.id,
      });
      res.status(200).json({
        response: "I don't have enough information in the uploaded documents.",
        sources: [],
      });
      return;
    }

    const userTeams = await AuthorizationService.getUserTeams(req.user.id);
    const result = await PythonAiService.chat({
      prompt,
      document_id: documentId,
      user_id: req.user.id,
      user_teams: userTeams,
    });

    await AuditService.record({
      action: "DOCUMENT_QUERY",
      resource_type: "RAG_QUERY",
      resource_id: documentId,
      status: "SUCCESS",
      user_id: req.user.id,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { chat };
