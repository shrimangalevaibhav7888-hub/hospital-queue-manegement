import { Request, Response } from 'express';
import { patientRepository, travelPreferenceRepository, visitRepository } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class PatientController {
  static async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        const all = await patientRepository.listAll(30);
        return sendSuccess(res, all);
      }
      const patients = await patientRepository.search(q);
      return sendSuccess(res, patients);
    } catch (error: any) {
      return sendError(res, 'SEARCH_PATIENTS_FAILED', error.message, 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await patientRepository.findById(id);
      if (!patient) return sendError(res, 'PATIENT_NOT_FOUND', 'Patient not found', 404);

      const travelPref = await travelPreferenceRepository.findByPatientId(id);
      const visits = await visitRepository.findByPatientId(id);

      return sendSuccess(res, {
        ...patient,
        travelPreference: travelPref,
        recentVisits: visits.slice(0, 10),
      });
    } catch (error: any) {
      return sendError(res, 'FETCH_PATIENT_FAILED', error.message, 500);
    }
  }

  static async updateTravelSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const { patientId } = req.params;
      const { originAddress, travelTimeMinutes, safetyBufferMinutes, transportMode } = req.body;

      const updated = await travelPreferenceRepository.upsert(patientId, {
        originAddress,
        travelTimeMinutes,
        safetyBufferMinutes,
        transportMode,
      });

      return sendSuccess(res, updated);
    } catch (error: any) {
      return sendError(res, 'UPDATE_TRAVEL_SETTINGS_FAILED', error.message, 400);
    }
  }

  static async getVisitHistory(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const visits = await visitRepository.findByPatientId(patientId);
      return sendSuccess(res, visits);
    } catch (error: any) {
      return sendError(res, 'FETCH_VISIT_HISTORY_FAILED', error.message, 500);
    }
  }
}
