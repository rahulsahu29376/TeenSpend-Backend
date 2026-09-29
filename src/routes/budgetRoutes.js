import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budgetValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', BudgetController.getBudgets);
router.post('/', validate(createBudgetSchema), BudgetController.createOrUpdateBudget);
router.put('/:id', validate(updateBudgetSchema), BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
