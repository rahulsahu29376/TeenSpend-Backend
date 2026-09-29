import { AnalyticsService } from '../services/analyticsService.js';
import { InsightService } from '../services/insightService.js';
import { successResponse } from '../utils/apiResponse.js';

export const AnalyticsController = {
  /**
   * Consolidated single endpoint for complete dashboard data
   */
  async getDashboard(req, res, next) {
    try {
      const [dashboardData, insights] = await Promise.all([
        AnalyticsService.getDashboardData(req.user.id),
        InsightService.generateInsights(req.user.id)
      ]);

      return successResponse(
        res,
        {
          ...dashboardData,
          insights
        },
        'Dashboard analytics retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Summary numbers (balance, total income, total expenses, savings)
   */
  async getSummary(req, res, next) {
    try {
      const data = await AnalyticsService.getDashboardData(req.user.id);
      return successResponse(res, data.summary, 'Summary analytics retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Category breakdown
   */
  async getCategory(req, res, next) {
    try {
      const { month, year } = req.query;
      const breakdown = await AnalyticsService.getCategoryBreakdown(req.user.id, month, year);
      return successResponse(res, { breakdown }, 'Category analytics retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * Monthly trend
   */
  async getTrends(req, res, next) {
    try {
      const data = await AnalyticsService.getDashboardData(req.user.id);
      return successResponse(res, { trend: data.monthlyTrend }, 'Monthly trends retrieved');
    } catch (err) {
      next(err);
    }
  }
};
