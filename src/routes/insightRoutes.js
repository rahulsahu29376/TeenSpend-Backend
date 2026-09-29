import { Router } from 'express';
import { InsightController } from '../controllers/insightController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', InsightController.getInsights);

export default router;
