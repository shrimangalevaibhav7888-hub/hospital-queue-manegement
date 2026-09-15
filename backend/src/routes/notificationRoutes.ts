import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/my', authenticate, NotificationController.listMyNotifications);
router.patch('/:id/read', authenticate, NotificationController.markAsRead);
router.post('/read-all', authenticate, NotificationController.markAllAsRead);

export default router;
