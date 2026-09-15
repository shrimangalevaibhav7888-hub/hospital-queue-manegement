import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'RECEPTIONIST'), AuditController.listLogs);

export default router;
