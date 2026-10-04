const fs = require("fs");
const path = require("path");
const { env } = require("../config/env");
const { HttpError } = require("../utils/httpError");
const { logError } = require("../utils/logger");

function internalHeaders(extra = {}) {
  return {
    "X-Internal-Service-Key": env.internalServiceKey,
    ...extra,
  };
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function requestJson(pathname, { method = "POST", body, timeoutMs = 120000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.pythonAiServiceUrl}${pathname}`, {
      method,
      headers: internalHeaders({ "Content-Type": "application/json" }),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const detail = data.detail || "AI service request failed";
      throw new HttpError(response.status === 401 ? 502 : response.status >= 500 ? 502 : response.status, detail);
    }
    return data;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logError("Python AI service request failed");
    throw new HttpError(502, "AI service unavailable");
  } finally {
    clearTimeout(timer);
  }
}

async function processDocument({
  filePath,
  originalFilename,
  documentId,
  uploadedAt,
  scope,
  ownerUserId,
  teamId,
}) {
  const buffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "application/pdf" }), originalFilename);
  form.append("document_id", documentId);
  form.append("filename", originalFilename);
  form.append("uploaded_at", uploadedAt);
  form.append("scope", scope);
  form.append("owner_user_id", String(ownerUserId));
  if (teamId != null) {
    form.append("team_id", String(teamId));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch(`${env.pythonAiServiceUrl}/internal/process-document`, {
      method: "POST",
      headers: internalHeaders(),
      body: form,
      signal: controller.signal,
    });
    const data = await parseJsonSafe(response);
    if (!response.ok) {
      throw new HttpError(502, data.detail || "Document processing failed");
    }
    return data;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logError("Python document processing failed");
    throw new HttpError(502, "AI service unavailable");
  } finally {
    clearTimeout(timer);
  }
}

async function chat(payload) {
  return requestJson("/internal/chat", { body: payload, timeoutMs: 180000 });
}

async function search(payload) {
  return requestJson("/internal/search", { body: payload });
}

async function deleteDocumentVectors(documentId) {
  return requestJson("/internal/delete-document", { body: { document_id: documentId } });
}

async function health() {
  try {
    const response = await fetch(`${env.pythonAiServiceUrl}/health`, {
      headers: internalHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return "unavailable";
    return "available";
  } catch {
    return "unavailable";
  }
}

function resolveUploadPath(filename) {
  return path.join(env.uploadDir, filename);
}

module.exports = {
  PythonAiService: {
    processDocument,
    chat,
    search,
    deleteDocumentVectors,
    health,
    resolveUploadPath,
  },
};
