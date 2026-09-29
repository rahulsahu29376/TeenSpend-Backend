import { ExpenseModel } from '../models/expenseModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const ExpenseController = {
  /**
   * Get paginated and filtered list of user's expenses
   */
  async getExpenses(req, res, next) {
    try {
      const result = await ExpenseModel.findByUserId(req.user.id, req.query);
      return successResponse(res, result, 'Expenses retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single expense by ID
   */
  async getExpenseById(req, res, next) {
    try {
      const expense = await ExpenseModel.findByIdAndUserId(req.params.id, req.user.id);
      if (!expense) {
        return errorResponse(res, 'Expense not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { expense }, 'Expense details retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create new expense
   */
  async createExpense(req, res, next) {
    try {
      const expenseData = {
        ...req.body,
        user_id: req.user.id // Always enforce authenticated user id
      };

      const newExpense = await ExpenseModel.create(expenseData);
      return successResponse(
        res,
        { expense: newExpense },
        'Expense added successfully',
        HTTP_STATUS.CREATED
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update existing expense
   */
  async updateExpense(req, res, next) {
    try {
      const updated = await ExpenseModel.update(req.params.id, req.user.id, req.body);
      if (!updated) {
        return errorResponse(res, 'Expense not found or unauthorized to update', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { expense: updated }, 'Expense updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete expense
   */
  async deleteExpense(req, res, next) {
    try {
      const deleted = await ExpenseModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return errorResponse(res, 'Expense not found or unauthorized to delete', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { id: req.params.id }, 'Expense deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
