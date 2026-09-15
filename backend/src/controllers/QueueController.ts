import { Request, Response } from 'express';
import { queueEngineService, queueRepository, visitRepository, doctorRepository } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class QueueController {
  static async checkIn(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Reception Staff',
        role: req.user?.role || 'RECEPTIONIST',
      };

      const result = await queueEngineService.checkInPatient({
        ...req.body,
        actor,
      });

      return sendSuccess(res, result, 201);
    } catch (error: any) {
      return sendError(res, 'CHECK_IN_FAILED', error.message, 400);
    }
  }

  static async getDoctorQueue(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const summary = await queueEngineService.getQueueState(doctorId, date as string);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'GET_QUEUE_FAILED', error.message, 404);
    }
  }

  static async getPatientQueueView(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const view = await queueEngineService.getPatientQueueView(visitId);
      return sendSuccess(res, view);
    } catch (error: any) {
      return sendError(res, 'GET_PATIENT_QUEUE_FAILED', error.message, 404);
    }
  }

  static async getActiveVisitByPatient(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const today = new Date().toISOString().split('T')[0];
      const activeVisit = await visitRepository.findActiveVisitByPatient(patientId, today);
      if (!activeVisit) {
        return sendSuccess(res, null);
      }
      const view = await queueEngineService.getPatientQueueView(activeVisit.id);
      return sendSuccess(res, view);
    } catch (error: any) {
      return sendError(res, 'GET_ACTIVE_VISIT_FAILED', error.message, 500);
    }
  }

  static async callNext(req: AuthenticatedRequest, res: Response) {
    try {
      const { doctorId } = req.params;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const result = await queueEngineService.callNextPatient(doctorId, actor);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, 'CALL_NEXT_FAILED', error.message, 400);
    }
  }

  static async startConsultation(req: AuthenticatedRequest, res: Response) {
    try {
      const { visitId } = req.params;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const summary = await queueEngineService.startConsultation(visitId, actor);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'START_CONSULTATION_FAILED', error.message, 400);
    }
  }

  static async completeConsultation(req: AuthenticatedRequest, res: Response) {
    try {
      const { visitId } = req.params;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const result = await queueEngineService.completeConsultation(visitId, {
        ...req.body,
        actor,
      });

      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, 'COMPLETE_CONSULTATION_FAILED', error.message, 400);
    }
  }

  static async markNoShow(req: AuthenticatedRequest, res: Response) {
    try {
      const { visitId } = req.params;
      const { reason } = req.body;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const summary = await queueEngineService.markNoShow(visitId, reason, actor);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'MARK_NO_SHOW_FAILED', error.message, 400);
    }
  }

  static async cancelVisit(req: AuthenticatedRequest, res: Response) {
    try {
      const { visitId } = req.params;
      const { reason } = req.body;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Staff',
        role: req.user?.role || 'PATIENT',
      };

      const summary = await queueEngineService.cancelVisit(visitId, reason || 'Cancelled by user', actor);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'CANCEL_VISIT_FAILED', error.message, 400);
    }
  }

  static async insertEmergency(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Reception Staff',
        role: req.user?.role || 'RECEPTIONIST',
      };

      const result = await queueEngineService.insertPriorityPatient({
        ...req.body,
        actor,
      });

      return sendSuccess(res, result, 201);
    } catch (error: any) {
      return sendError(res, 'EMERGENCY_INSERT_FAILED', error.message, 400);
    }
  }

  static async previewEmergencyImpact(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const preview = await queueEngineService.previewEmergencyImpact(doctorId);
      return sendSuccess(res, preview);
    } catch (error: any) {
      return sendError(res, 'PREVIEW_FAILED', error.message, 400);
    }
  }

  static async reportDelay(req: AuthenticatedRequest, res: Response) {
    try {
      const { doctorId, delayMinutes, reason } = req.body;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const summary = await queueEngineService.applyDoctorDelay(doctorId, delayMinutes, reason, actor);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'REPORT_DELAY_FAILED', error.message, 400);
    }
  }

  static async pauseQueue(req: AuthenticatedRequest, res: Response) {
    try {
      const { doctorId, reason } = req.body;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const summary = await queueEngineService.pauseDoctorQueue(doctorId, reason || 'Doctor on break', actor);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'PAUSE_QUEUE_FAILED', error.message, 400);
    }
  }

  static async resumeQueue(req: AuthenticatedRequest, res: Response) {
    try {
      const { doctorId } = req.params;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Doctor',
        role: req.user?.role || 'DOCTOR',
      };

      const summary = await queueEngineService.resumeDoctorQueue(doctorId, actor);
      return sendSuccess(res, summary);
    } catch (error: any) {
      return sendError(res, 'RESUME_QUEUE_FAILED', error.message, 400);
    }
  }

  static async reassignPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const { visitId, targetDoctorId, reason } = req.body;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Staff',
        role: req.user?.role || 'RECEPTIONIST',
      };

      const result = await queueEngineService.reassignPatient(visitId, targetDoctorId, reason, actor);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, 'REASSIGN_PATIENT_FAILED', error.message, 400);
    }
  }

  static async reassignQueue(req: AuthenticatedRequest, res: Response) {
    try {
      const { fromDoctorId, toDoctorId, reason } = req.body;
      const actor = {
        id: req.user?.userId,
        name: req.user?.name || 'Staff',
        role: req.user?.role || 'RECEPTIONIST',
      };

      const result = await queueEngineService.reassignQueue(fromDoctorId, toDoctorId, reason, actor);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, 'REASSIGN_QUEUE_FAILED', error.message, 400);
    }
  }

  static async getPublicOverview(req: Request, res: Response) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const doctors = await doctorRepository.listAll();
      const overview = await Promise.all(
        doctors.map(async (doc) => {
          try {
            const summary = await queueEngineService.getQueueState(doc.id, today);
            return {
              doctorId: doc.id,
              doctorName: doc.name,
              doctorCode: doc.doctorCode,
              specialization: doc.specialization,
              roomNumber: doc.roomNumber,
              doctorStatus: doc.status,
              currentDelayMinutes: doc.currentDelayMinutes,
              currentCallingToken: summary.currentlyCalling?.tokenDisplay || null,
              inConsultationToken: summary.inConsultation?.tokenDisplay || null,
              waitingCount: summary.waitingCount,
              nextTokens: summary.items.slice(0, 4).map((i) => ({
                tokenDisplay: i.tokenDisplay,
                position: i.position,
                status: i.status,
                estimatedWaitMinutes: i.estimatedWaitMinutes,
              })),
            };
          } catch (e) {
            return null;
          }
        })
      );
      return sendSuccess(res, overview.filter(Boolean));
    } catch (error: any) {
      return sendError(res, 'PUBLIC_OVERVIEW_FAILED', error.message, 500);
    }
  }
}
