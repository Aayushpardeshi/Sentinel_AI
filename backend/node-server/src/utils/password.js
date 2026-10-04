const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
