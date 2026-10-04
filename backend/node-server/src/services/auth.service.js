const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const { env } = require("../config/env");
const { hashPassword, verifyPassword } = require("../utils/password");
const { HttpError } = require("../utils/httpError");
const { AuditService } = require("./audit.service");

function createAccessToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    env.jwtSecret,
    {
      algorithm: env.jwtAlgorithm,
      expiresIn: env.jwtExpiresIn,
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: [env.jwtAlgorithm] });
}

async function register({ email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "Email already registered");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password_hash: hashPassword(password),
    },
  });

  await AuditService.record({
    action: "REGISTER_SUCCESS",
    resource_type: "AUTH",
    status: "SUCCESS",
    user_id: user.id,
  });

  return {
    message: "User registered successfully",
    user_id: user.id,
  };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.password_hash)) {
    await AuditService.record({
      action: "LOGIN_FAILED",
      resource_type: "AUTH",
      status: "FAILED",
      metadata_info: { email },
    });
    throw new HttpError(401, "Invalid email or password");
  }

  const accessToken = createAccessToken(user.id);

  await AuditService.record({
    action: "LOGIN_SUCCESS",
    resource_type: "AUTH",
    status: "SUCCESS",
    user_id: user.id,
  });

  return {
    message: "Login successful",
    access_token: accessToken,
    token_type: "bearer",
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new HttpError(401, "Invalid or expired token");
  }

  return {
    message: "Authenticated successfully",
    user_id: user.id,
    id: user.id,
    email: user.email,
  };
}

module.exports = {
  AuthService: {
    createAccessToken,
    verifyAccessToken,
    register,
    login,
    getMe,
  },
};
