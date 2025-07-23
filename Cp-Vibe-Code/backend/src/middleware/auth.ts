import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppError, HTTP_STATUS, JWTPayload } from '@cp-vibe-code/shared';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', HTTP_STATUS.UNAUTHORIZED, 'NO_TOKEN');
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    next(error);
  }
};
