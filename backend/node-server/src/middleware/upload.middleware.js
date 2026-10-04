const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { env } = require("../config/env");
const { HttpError } = require("../utils/httpError");

function ensureUploadDir() {
  const abs = path.resolve(env.uploadDir);
  fs.mkdirSync(abs, { recursive: true });
  return abs;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext === ".pdf" ? ".pdf" : "";
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();
  const mimeOk = mime === "application/pdf" || mime === "application/octet-stream" || mime === "";
  if (ext !== ".pdf" || !mimeOk) {
    cb(new HttpError(400, "Only PDF files are allowed"));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes },
  fileFilter,
});

function handleMulterErrors(err, req, res, next) {
  if (!err) {
    next();
    return;
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(new HttpError(400, "File too large"));
      return;
    }
    next(new HttpError(400, "Invalid upload"));
    return;
  }
  next(err);
}

module.exports = { upload, handleMulterErrors, ensureUploadDir };
