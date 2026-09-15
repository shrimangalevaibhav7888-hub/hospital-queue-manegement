import { Request, Response } from 'express';
import { authService, patientRepository, doctorRepository } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error: any) {
      return sendError(res, 'REGISTRATION_FAILED', error.message, 400);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, result, 200);
    } catch (error: any) {
      return sendError(res, 'LOGIN_FAILED', error.message, 401);
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return sendError(res, 'REFRESH_TOKEN_REQUIRED', 'Refresh token required', 400);
      }

      const payload = authService.verifyRefreshToken(refreshToken);
      const newAccessToken = authService.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name,
        doctorId: payload.doctorId,
        patientId: payload.patientId,
      });

      return sendSuccess(res, { accessToken: newAccessToken });
    } catch (error: any) {
      return sendError(res, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      }

      let extraData: any = {};
      if (req.user.role === 'PATIENT' && req.user.patientId) {
        extraData.patient = await patientRepository.findById(req.user.patientId);
      } else if (req.user.role === 'DOCTOR' && req.user.doctorId) {
        extraData.doctor = await doctorRepository.findById(req.user.doctorId);
      }

      return sendSuccess(res, {
        user: req.user,
        ...extraData,
      });
    } catch (error: any) {
      return sendError(res, 'FETCH_PROFILE_FAILED', error.message, 500);
    }
  }
}
