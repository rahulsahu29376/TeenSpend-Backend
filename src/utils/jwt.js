import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Sign JWT token for authenticated user
 * Minimal claims only: id, email, name
 */
export const signToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
};

/**
 * Verify JWT token string
 */
export const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch (err) {
    return null;
  }
};
