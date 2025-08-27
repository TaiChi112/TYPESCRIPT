import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

const router = Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
