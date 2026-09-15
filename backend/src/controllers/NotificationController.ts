import { Request, Response } from 'express';
import { notificationService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class NotificationController {
  static async listMyNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);

      let notifs: any[] = [];
      if (req.user.patientId) {
        notifs = await notificationService.getPatientNotifications(req.user.patientId);
      } else {
        notifs = await notificationService.getUserNotifications(req.user.userId);
      }

      return sendSuccess(res, notifs);
    } catch (error: any) {
      return sendError(res, 'FETCH_NOTIFICATIONS_FAILED', error.message, 500);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const notif = await notificationService.markAsRead(id);
      return sendSuccess(res, notif);
    } catch (error: any) {
      return sendError(res, 'MARK_READ_FAILED', error.message, 400);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      const count = await notificationService.markAllAsRead(req.user.userId, req.user.patientId);
      return sendSuccess(res, { count });
    } catch (error: any) {
      return sendError(res, 'MARK_ALL_READ_FAILED', error.message, 400);
    }
  }
}
