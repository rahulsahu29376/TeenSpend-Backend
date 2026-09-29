import { BudgetModel } from '../models/budgetModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const BudgetController = {
  async getBudgets(req, res, next) {
    try {
      const { month, year } = req.query;
      const budgets = await BudgetModel.findByUserIdAndPeriod(req.user.id, month, year);
      return successResponse(res, { budgets }, 'Budgets retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createOrUpdateBudget(req, res, next) {
    try {
      const budget = await BudgetModel.createOrUpdate({
        ...req.body,
        user_id: req.user.id
      });
      return successResponse(res, { budget }, 'Budget saved successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async updateBudget(req, res, next) {
    try {
      const updated = await BudgetModel.update(req.params.id, req.user.id, req.body);
      if (!updated) {
        return errorResponse(res, 'Budget not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { budget: updated }, 'Budget updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteBudget(req, res, next) {
    try {
      const deleted = await BudgetModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return errorResponse(res, 'Budget not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { id: req.params.id }, 'Budget deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
