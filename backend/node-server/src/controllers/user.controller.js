const { AuthService } = require("../services/auth.service");

async function getMe(req, res, next) {
  try {
    const result = await AuthService.getMe(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getMe };
