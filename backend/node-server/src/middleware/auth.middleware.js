const { AuthService } = require("../services/auth.service");
const { HttpError } = require("../utils/httpError");

function authenticateUser(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Invalid or expired token");
    }

    const payload = AuthService.verifyAccessToken(token);
    const userId = Number(payload.sub);

    if (!payload.sub || Number.isNaN(userId)) {
      throw new HttpError(401, "Invalid token");
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    next(new HttpError(401, "Invalid or expired token"));
  }
}

module.exports = { authenticateUser };
