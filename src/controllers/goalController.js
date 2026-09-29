import { GoalModel } from '../models/goalModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const GoalController = {
  async getGoals(req, res, next) {
    try {
      const goals = await GoalModel.findByUserId(req.user.id);
      return successResponse(res, { goals }, 'Savings goals retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createGoal(req, res, next) {
    try {
      const goal = await GoalModel.create({
        ...req.body,
        user_id: req.user.id
      });
      return successResponse(res, { goal }, 'Savings goal created successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async updateGoal(req, res, next) {
    try {
      const updated = await GoalModel.update(req.params.id, req.user.id, req.body);
      if (!updated) {
        return errorResponse(res, 'Savings goal not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { goal: updated }, 'Savings goal updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteGoal(req, res, next) {
    try {
      const deleted = await GoalModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return errorResponse(res, 'Savings goal not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { id: req.params.id }, 'Savings goal deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
