import { Request, Response, NextFunction } from "express";

// ← Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ← Mongoose errors handle karo
const handleMongooseError = (error: any): AppError => {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return new AppError(
      `${field} already exists — please use another value`,
      400,
    );
  }

  // Validation error
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return new AppError(messages.join(", "), 400);
  }

  // Cast error — invalid ID
  if (error.name === "CastError") {
    return new AppError("Invalid ID format", 400);
  }

  return new AppError("Database error", 500);
};

// ← JWT errors handle karo
const handleJWTError = (error: any): AppError => {
  if (error.name === "TokenExpiredError") {
    return new AppError("Session are expire ! again login", 401);
  }
  return new AppError("Invalid token, please login again", 401);
};

// ← Global error handler — sab errors yahan aate hain
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
  }

  // ← Mongoose errors
  if (
    err.code === 11000 ||
    err.name === "ValidationError" ||
    err.name === "CastError"
  ) {
    error = handleMongooseError(err);
  }

  // ← JWT errors
  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    error = handleJWTError(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

// ← 404 handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Route ${req.originalUrl} are not found`, 404));
};
