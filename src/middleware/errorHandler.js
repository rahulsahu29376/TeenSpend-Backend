import { HTTP_STATUS } from '../utils/constants.js';
import { isProduction } from '../config/env.js';

/**
 * 404 Not Found Catch-All Middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Centralized Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  // Determine status code
  let statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Handle specific database/ORM conflict errors
  if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('already exists')) {
    statusCode = HTTP_STATUS.CONFLICT;
  } else if (err.name === 'ValidationError' || err.name === 'ZodError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
  }

  const message = err.message || 'An internal server error occurred';

  // Build response
  const response = {
    success: false,
    message
  };

  if (err.errors) {
    response.error = err.errors;
  } else if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  // Log in server console for tracing
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(response);
};
