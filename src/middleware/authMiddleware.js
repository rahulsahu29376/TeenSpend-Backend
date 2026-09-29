import { verifyJwtToken } from '../utils/jwt.js';
import { UserModel } from '../models/userModel.js';
import { errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches authenticated user profile to req.user
 * Enforces zero-trust: never relies on client-provided user_id
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(
        res,
        'Authentication required. Please provide a valid Bearer token.',
        null,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwtToken(token);

    if (!decoded || !decoded.id) {
      return errorResponse(
        res,
        'Invalid or expired session. Please log in again.',
        null,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Lookup user in database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(
        res,
        'User account associated with this session no longer exists.',
        null,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (err) {
    return errorResponse(
      res,
      'Authentication error occurred.',
      err.message,
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};
