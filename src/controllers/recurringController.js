import { RecurringModel } from '../models/recurringModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const RecurringController = {
  async getRecurring(req, res, next) {
    try {
      const recurring = await RecurringModel.findByUserId(req.user.id);
      return successResponse(res, { recurring }, 'Recurring expenses retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createRecurring(req, res, next) {
    try {
      const recurring = await RecurringModel.create({
        ...req.body,
        user_id: req.user.id
      });
      return successResponse(res, { recurring }, 'Recurring expense created successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async updateRecurring(req, res, next) {
    try {
      const updated = await RecurringModel.update(req.params.id, req.user.id, req.body);
      if (!updated) {
        return errorResponse(res, 'Recurring expense not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { recurring: updated }, 'Recurring expense updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteRecurring(req, res, next) {
    try {
      const deleted = await RecurringModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return errorResponse(res, 'Recurring expense not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { id: req.params.id }, 'Recurring expense deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
