import { Router } from 'express';
import { GoalController } from '../controllers/goalController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createGoalSchema, updateGoalSchema } from '../validators/goalValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', GoalController.getGoals);
router.post('/', validate(createGoalSchema), GoalController.createGoal);
router.put('/:id', validate(updateGoalSchema), GoalController.updateGoal);
router.delete('/:id', GoalController.deleteGoal);

export default router;
