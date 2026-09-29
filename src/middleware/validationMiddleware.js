import { HTTP_STATUS } from '../utils/constants.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Higher-order middleware factory for validating request parts with Zod schemas
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'query' | 'params'} source - Request attribute to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      // Assign parsed/coerced values back
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));

        return errorResponse(
          res,
          'Validation failed. Please verify the submitted information.',
          formattedErrors,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      return errorResponse(
        res,
        'Invalid request data format',
        err.message,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  };
};
