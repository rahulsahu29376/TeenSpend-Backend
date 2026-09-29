import { InsightService } from '../services/insightService.js';
import { successResponse } from '../utils/apiResponse.js';

export const InsightController = {
  async getInsights(req, res, next) {
    try {
      const insights = await InsightService.generateInsights(req.user.id);
      return successResponse(res, { insights }, 'Insights generated successfully');
    } catch (err) {
      next(err);
    }
  }
};
