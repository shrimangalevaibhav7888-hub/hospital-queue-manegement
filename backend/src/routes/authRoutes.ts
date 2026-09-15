import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema } from '../validators/schemas';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticate, AuthController.getMe);

export default router;
