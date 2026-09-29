import { CategoryModel } from '../models/categoryModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const CategoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await CategoryModel.getAllForUser(req.user.id);
      return successResponse(res, { categories }, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await CategoryModel.create({
        ...req.body,
        user_id: req.user.id
      });
      return successResponse(res, { category }, 'Custom category created successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      if (err.message.includes('already exists')) {
        return errorResponse(res, err.message, null, HTTP_STATUS.CONFLICT);
      }
      next(err);
    }
  }
};
