import { Request, Response } from 'express';
import { HTTP_STATUS } from '@cp-vibe-code/shared';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
};
