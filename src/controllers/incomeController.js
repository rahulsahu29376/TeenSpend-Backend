import { IncomeModel } from '../models/incomeModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const IncomeController = {
  async getIncome(req, res, next) {
    try {
      const income = await IncomeModel.findByUserId(req.user.id);
      return successResponse(res, { income }, 'Income records retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getIncomeById(req, res, next) {
    try {
      const item = await IncomeModel.findByIdAndUserId(req.params.id, req.user.id);
      if (!item) {
        return errorResponse(res, 'Income record not found', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { income: item }, 'Income record retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createIncome(req, res, next) {
    try {
      const item = await IncomeModel.create({
        ...req.body,
        user_id: req.user.id
      });
      return successResponse(res, { income: item }, 'Income record added successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async updateIncome(req, res, next) {
    try {
      const updated = await IncomeModel.update(req.params.id, req.user.id, req.body);
      if (!updated) {
        return errorResponse(res, 'Income record not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { income: updated }, 'Income record updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteIncome(req, res, next) {
    try {
      const deleted = await IncomeModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return errorResponse(res, 'Income record not found or unauthorized', null, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { id: req.params.id }, 'Income record deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
