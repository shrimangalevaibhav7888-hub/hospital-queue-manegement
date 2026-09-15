import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/kpis', authenticate, authorize('ADMIN', 'RECEPTIONIST', 'DOCTOR'), AnalyticsController.getKPIs);
router.get('/charts', authenticate, authorize('ADMIN', 'RECEPTIONIST'), AnalyticsController.getCharts);

export default router;
