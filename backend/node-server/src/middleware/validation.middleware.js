const { HttpError } = require("../utils/httpError");

function requireBodyFields(fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        next(new HttpError(422, `${field} is required`));
        return;
      }
    }
    next();
  };
}

module.exports = { requireBodyFields };
