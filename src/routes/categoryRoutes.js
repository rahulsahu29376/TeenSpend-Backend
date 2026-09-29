import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createCategorySchema } from '../validators/recurringValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', CategoryController.getCategories);
router.post('/', validate(createCategorySchema), CategoryController.createCategory);

export default router;
