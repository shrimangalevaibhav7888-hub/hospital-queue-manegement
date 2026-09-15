import { Request, Response } from 'express';
import { doctorRepository } from '../services';
import { sendSuccess, sendError } from '../utils/response';

export class DoctorController {
  static async listAll(req: Request, res: Response) {
    try {
      const { departmentId } = req.query;
      const doctors = await doctorRepository.listAll(departmentId as string);
      return sendSuccess(res, doctors);
    } catch (error: any) {
      return sendError(res, 'FETCH_DOCTORS_FAILED', error.message, 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await doctorRepository.findById(id);
      if (!doctor) return sendError(res, 'DOCTOR_NOT_FOUND', 'Doctor not found', 404);
      return sendSuccess(res, doctor);
    } catch (error: any) {
      return sendError(res, 'FETCH_DOCTOR_FAILED', error.message, 500);
    }
  }

  static async listDepartments(req: Request, res: Response) {
    try {
      const departments = await doctorRepository.listDepartments();
      return sendSuccess(res, departments);
    } catch (error: any) {
      return sendError(res, 'FETCH_DEPARTMENTS_FAILED', error.message, 500);
    }
  }
}
