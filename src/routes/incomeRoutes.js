import { Router } from 'express';
import { IncomeController } from '../controllers/incomeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createIncomeSchema, updateIncomeSchema } from '../validators/incomeValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', IncomeController.getIncome);
router.get('/:id', IncomeController.getIncomeById);
router.post('/', validate(createIncomeSchema), IncomeController.createIncome);
router.put('/:id', validate(updateIncomeSchema), IncomeController.updateIncome);
router.delete('/:id', IncomeController.deleteIncome);

export default router;
