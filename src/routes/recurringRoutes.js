import { Router } from 'express';
import { RecurringController } from '../controllers/recurringController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createRecurringSchema, updateRecurringSchema } from '../validators/recurringValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', RecurringController.getRecurring);
router.post('/', validate(createRecurringSchema), RecurringController.createRecurring);
router.put('/:id', validate(updateRecurringSchema), RecurringController.updateRecurring);
router.delete('/:id', RecurringController.deleteRecurring);

export default router;
