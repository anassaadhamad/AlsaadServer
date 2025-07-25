const AppError = require(`${__dirname}/../utils/appError`);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const duplicatedValue = Object.keys(err.keyValue);
  const message = `This ${duplicatedValue[0]} is already exist.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((error) => error.message)
    .join(". ");

  const message = `Invalid Input Data: ${errors}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError("Invalid token. Please log in again!", 401);

const handleExpiredJWTError = (err) =>
  new AppError("Your token has expired. Please log in again!", 401);

const handlePayloadLargeError = (err) =>
  new AppError("Request entity is too large", 413);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("Error 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = {
      ...err,
      name: err.name,
      message: err.message,
    };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error.name === "TokenExpiredError")
      error = handleExpiredJWTError(error);
    if (error.statusCode === 413) error = handlePayloadLargeError(error);

    sendErrorProd(error, res);
  }
};
