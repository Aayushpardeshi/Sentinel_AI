const { AuthService } = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const result = await AuthService.register({
      email: String(req.body.email || "").trim(),
      password: String(req.body.password || ""),
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await AuthService.login({
      email: String(req.body.email || "").trim(),
      password: String(req.body.password || ""),
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await AuthService.getMe(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
