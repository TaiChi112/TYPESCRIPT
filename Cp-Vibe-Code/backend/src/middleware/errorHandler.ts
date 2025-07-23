import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError, HTTP_STATUS } from '@cp-vibe-code/shared';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (isAppError(error)) {
    const appError = error as AppError;
    return res.status(appError.statusCode).json({
      success: false,
      error: appError.message,
      code: appError.code,
    });
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: 'A record with this information already exists',
        code: 'DUPLICATE_RECORD',
      });
    }
  }

  // Validation errors
  if (error.name === 'ZodError') {
    const zodError = error as any;
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Validation failed',
      details: zodError.errors,
      code: 'VALIDATION_ERROR',
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Default error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
