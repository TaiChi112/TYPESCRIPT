import { Request, Response, NextFunction } from 'express'

interface ErrorWithStatus extends Error {
  status?: number
  statusCode?: number
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(err)
  }

  // Default to 500 server error
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log error for debugging
  console.error(`Error ${status}: ${message}`)
  console.error(err.stack)

  // Send error response
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  })
}
