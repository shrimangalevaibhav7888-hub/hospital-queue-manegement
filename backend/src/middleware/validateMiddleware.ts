import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 'VALIDATION_ERROR', 'Invalid request parameters', 422, error.errors);
      }
      return sendError(res, 'BAD_REQUEST', 'Failed to validate request payload', 400);
    }
  };
};
