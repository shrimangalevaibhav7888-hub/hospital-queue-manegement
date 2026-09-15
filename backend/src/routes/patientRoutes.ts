import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { updateTravelPreferenceSchema } from '../validators/schemas';

const router = Router();

router.get('/search', authenticate, PatientController.search);
router.get('/:id', authenticate, PatientController.getById);
router.get('/:patientId/visits', authenticate, PatientController.getVisitHistory);
router.put(
  '/:patientId/travel-settings',
  authenticate,
  validate(updateTravelPreferenceSchema),
  PatientController.updateTravelSettings
);

export default router;
