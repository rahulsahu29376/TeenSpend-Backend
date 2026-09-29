import { Router } from 'express';
import authRoutes from './authRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import incomeRoutes from './incomeRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import goalRoutes from './goalRoutes.js';
import recurringRoutes from './recurringRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import insightRoutes from './insightRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TeenSpend Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount resource routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/income', incomeRoutes);
apiRouter.use('/budgets', budgetRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/recurring', recurringRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/insights', insightRoutes);
apiRouter.use('/categories', categoryRoutes);

export default apiRouter;
