import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/summary', AnalyticsController.getSummary);
router.get('/category', AnalyticsController.getCategory);
router.get('/trends', AnalyticsController.getTrends);

export default router;
