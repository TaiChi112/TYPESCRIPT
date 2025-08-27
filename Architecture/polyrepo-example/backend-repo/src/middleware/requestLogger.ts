import { Request, Response, NextFunction } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // Log the incoming request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
  
  // Override the res.end method to log the response
  const originalEnd = res.end
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    )
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding)
  }
  
  next()
}
