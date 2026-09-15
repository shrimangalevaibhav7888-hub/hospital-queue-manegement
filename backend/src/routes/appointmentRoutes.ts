import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticate } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { createAppointmentSchema } from '../validators/schemas';

const router = Router();

router.get('/', authenticate, AppointmentController.listAll);
router.post('/', authenticate, validate(createAppointmentSchema), AppointmentController.create);
router.get('/patient/:patientId', authenticate, AppointmentController.listByPatient);
router.get('/doctor/:doctorId', authenticate, AppointmentController.listByDoctorAndDate);
router.post('/:id/cancel', authenticate, AppointmentController.cancel);

export default router;
