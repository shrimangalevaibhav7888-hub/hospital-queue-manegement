import { Request, Response } from 'express';
import { auditService } from '../services';
import { sendSuccess, sendError } from '../utils/response';

export class AuditController {
  static async listLogs(req: Request, res: Response) {
    try {
      const { action, actorRole, actorId, entity, entityId, startDate, endDate, limit, offset } = req.query;

      const result = await auditService.getLogs({
        action: action as string,
        actorRole: actorRole as string,
        actorId: actorId as string,
        entity: entity as string,
        entityId: entityId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, 'FETCH_AUDIT_LOGS_FAILED', error.message, 500);
    }
  }
}
