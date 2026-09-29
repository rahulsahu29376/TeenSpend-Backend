import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  queryExpenseSchema
} from '../validators/expenseValidator.js';

const router = Router();

// Enforce authentication across all expense routes
router.use(requireAuth);

router.get('/', validate(queryExpenseSchema, 'query'), ExpenseController.getExpenses);
router.get('/:id', ExpenseController.getExpenseById);
router.post('/', validate(createExpenseSchema, 'body'), ExpenseController.createExpense);
router.put('/:id', validate(updateExpenseSchema, 'body'), ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

export default router;
