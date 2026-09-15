import { Router } from 'express';
import { QueueController } from '../controllers/QueueController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import {
  checkInSchema,
  emergencyInsertSchema,
  reportDelaySchema,
  pauseQueueSchema,
  reassignPatientSchema,
  reassignQueueSchema,
  completeConsultationSchema,
  cancelVisitSchema,
} from '../validators/schemas';

const router = Router();

// Public / Patient accessible endpoints
router.get('/public-overview', QueueController.getPublicOverview);
router.get('/doctor/:doctorId', QueueController.getDoctorQueue);
router.get('/patient-view/:visitId', QueueController.getPatientQueueView);
router.get('/patient-active/:patientId', QueueController.getActiveVisitByPatient);
router.get('/emergency-preview/:doctorId', QueueController.previewEmergencyImpact);

// Authenticated check-in (Patient self check-in, Receptionist walk-in)
router.post('/check-in', authenticate, validate(checkInSchema), QueueController.checkIn);

// Doctor actions
router.post('/doctor/:doctorId/call-next', authenticate, authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), QueueController.callNext);
router.post('/visit/:visitId/start', authenticate, authorize('DOCTOR', 'ADMIN'), QueueController.startConsultation);
router.post(
  '/visit/:visitId/complete',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  validate(completeConsultationSchema),
  QueueController.completeConsultation
);
router.post('/visit/:visitId/no-show', authenticate, authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), QueueController.markNoShow);
router.post(
  '/visit/:visitId/cancel',
  authenticate,
  authorize('PATIENT', 'RECEPTIONIST', 'ADMIN', 'DOCTOR'),
  validate(cancelVisitSchema),
  QueueController.cancelVisit
);

// Delay & Pause
router.post('/doctor/delay', authenticate, authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), validate(reportDelaySchema), QueueController.reportDelay);
router.post('/doctor/pause', authenticate, authorize('DOCTOR', 'ADMIN'), validate(pauseQueueSchema), QueueController.pauseQueue);
router.post('/doctor/:doctorId/resume', authenticate, authorize('DOCTOR', 'ADMIN'), QueueController.resumeQueue);

// Emergency & Reassignment
router.post(
  '/emergency-insert',
  authenticate,
  authorize('RECEPTIONIST', 'ADMIN', 'DOCTOR'),
  validate(emergencyInsertSchema),
  QueueController.insertEmergency
);
router.post(
  '/reassign-patient',
  authenticate,
  authorize('RECEPTIONIST', 'ADMIN'),
  validate(reassignPatientSchema),
  QueueController.reassignPatient
);
router.post(
  '/reassign-queue',
  authenticate,
  authorize('RECEPTIONIST', 'ADMIN'),
  validate(reassignQueueSchema),
  QueueController.reassignQueue
);

export default router;
