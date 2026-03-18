const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Middleware to check express-validator results.
 * Place after your validation rules in the route chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    throw new ApiError(400, message);
  }
  next();
};

module.exports = validate;
