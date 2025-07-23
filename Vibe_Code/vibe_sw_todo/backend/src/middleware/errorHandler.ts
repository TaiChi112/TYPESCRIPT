import { Request, Response, NextFunction } from 'express';

// Custom error class for application errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('Global Error Handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (err.isOperational) {
    // Operational errors: send error details to client
    res.status(err.statusCode).json({
      error: err.message,
      message: err.message,
      ...(isDevelopment && { stack: err.stack })
    });
  } else {
    // Programming errors: don't leak error details
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong on the server',
      ...(isDevelopment && { 
        originalError: err.message,
        stack: err.stack 
      })
    });
  }
};

// Middleware to handle async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware to handle 404 errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Middleware to validate JSON
export const validateJSON = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  next(err);
};

// Rate limiting error handler
export const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.round(60) // 1 minute
  });
};
