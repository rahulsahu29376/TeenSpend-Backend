import bcrypt from 'bcryptjs';
import { UserModel } from '../models/userModel.js';
import { signToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { ENV } from '../config/env.js';

export const AuthController = {
  /**
   * Register a new teen account
   */
  async register(req, res, next) {
    try {
      const { name, email, password, age, currency } = req.body;

      // 1. Check if email already registered
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return errorResponse(
          res,
          'An account with this email address already exists. Please log in instead.',
          null,
          HTTP_STATUS.CONFLICT
        );
      }

      // 2. Hash password with bcrypt (12 rounds)
      const hashedPassword = await bcrypt.hash(password, ENV.BCRYPT_SALT_ROUNDS);

      // 3. Create user record
      const newUser = await UserModel.create({
        name,
        email,
        password_hash: hashedPassword,
        age,
        currency: currency || 'USD'
      });

      // 4. Generate JWT token
      const token = signToken(newUser);

      return successResponse(
        res,
        {
          user: newUser,
          token
        },
        'Welcome to TeenSpend! Your account was created successfully.',
        HTTP_STATUS.CREATED
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login existing user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Find user by email (including password_hash for comparison)
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return errorResponse(
          res,
          'Invalid email or password. Please check your credentials.',
          null,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // 2. Compare password securely with bcrypt
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return errorResponse(
          res,
          'Invalid email or password. Please check your credentials.',
          null,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // 3. Remove password_hash from response payload
      const safeUser = { ...user };
      delete safeUser.password_hash;

      // 4. Generate JWT
      const token = signToken(safeUser);

      return successResponse(
        res,
        {
          user: safeUser,
          token
        },
        `Welcome back, ${safeUser.name}!`,
        HTTP_STATUS.OK
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current authenticated user session
   */
  async getMe(req, res, next) {
    try {
      return successResponse(res, { user: req.user }, 'User session retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update profile information
   */
  async updateProfile(req, res, next) {
    try {
      const updatedUser = await UserModel.update(req.user.id, req.body);
      if (!updatedUser) {
        return errorResponse(res, 'User not found', null, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      return successResponse(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }
};
