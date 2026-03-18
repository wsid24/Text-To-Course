const { NODE_ENV } = require("../config/env");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ [${statusCode}] ${message}`);
  if (NODE_ENV === "development" && !err.isOperational) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
