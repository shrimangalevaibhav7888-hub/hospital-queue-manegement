import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { QueueStateError } from '../services/queue/QueueStateMachine';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[Unhandled Error] ${req.method} ${req.url} - ${err.message}`, err.stack);

  if (err instanceof QueueStateError) {
    return sendError(res, err.code, err.message, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, code, message, statusCode);
};
