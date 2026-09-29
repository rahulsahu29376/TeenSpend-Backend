import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.put('/profile', requireAuth, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
