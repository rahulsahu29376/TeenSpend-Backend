import { HTTP_STATUS } from './constants.js';

/**
 * Standardized success response handler
 * @param {object} res - Express response object
 * @param {any} data - Payload data
 * @param {string} message - Human-friendly message
 * @param {number} statusCode - HTTP status code (default 200)
 */
export const successResponse = (res, data = {}, message = 'Operation successful', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Standardized error response handler
 * @param {object} res - Express response object
 * @param {string} message - High-level error summary
 * @param {any} error - Detailed error or validation array
 * @param {number} statusCode - HTTP status code (default 500)
 */
export const errorResponse = (res, message = 'An error occurred', error = null, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  const responseBody = {
    success: false,
    message
  };

  if (error !== null) {
    responseBody.error = error;
  }

  return res.status(statusCode).json(responseBody);
};
