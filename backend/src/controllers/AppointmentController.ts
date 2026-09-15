import { Request, Response } from 'express';
import { appointmentRepository, patientRepository } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AppointmentController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { doctorId, departmentId, scheduledDate, scheduledTime, type, notes } = req.body;
      let patientId = req.body.patientId;

      if (!patientId && req.user?.patientId) {
        patientId = req.user.patientId;
      }

      if (!patientId) {
        return sendError(res, 'PATIENT_REQUIRED', 'Patient ID required to book appointment', 400);
      }

      const appointmentCode = `APT-${scheduledDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const apt = await appointmentRepository.create(
        {
          patientId,
          doctorId,
          departmentId,
          scheduledDate,
          scheduledTime,
          type: type || 'ONLINE',
          notes,
        },
        appointmentCode
      );

      return sendSuccess(res, apt, 201);
    } catch (error: any) {
      return sendError(res, 'CREATE_APPOINTMENT_FAILED', error.message, 400);
    }
  }

  static async listByPatient(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const apts = await appointmentRepository.findByPatientId(patientId);
      return sendSuccess(res, apts);
    } catch (error: any) {
      return sendError(res, 'FETCH_APPOINTMENTS_FAILED', error.message, 500);
    }
  }

  static async listByDoctorAndDate(req: Request, res: Response) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      const dateStr = (date as string) || new Date().toISOString().split('T')[0];
      const apts = await appointmentRepository.findByDoctorAndDate(doctorId, dateStr);
      return sendSuccess(res, apts);
    } catch (error: any) {
      return sendError(res, 'FETCH_APPOINTMENTS_FAILED', error.message, 500);
    }
  }

  static async listAll(req: Request, res: Response) {
    try {
      const { date, status, doctorId } = req.query;
      const apts = await appointmentRepository.findAll({
        date: date as string,
        status: status as string,
        doctorId: doctorId as string,
      });
      return sendSuccess(res, apts);
    } catch (error: any) {
      return sendError(res, 'FETCH_APPOINTMENTS_FAILED', error.message, 500);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await appointmentRepository.updateStatus(id, 'CANCELLED');
      return sendSuccess(res, updated);
    } catch (error: any) {
      return sendError(res, 'CANCEL_APPOINTMENT_FAILED', error.message, 400);
    }
  }
}
