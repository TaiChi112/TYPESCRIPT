import { Router } from 'express'
import { prisma } from '../index'

const router = Router()

// GET /api/health - Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'operational'
      }
    }
    
    res.json(healthData)
  } catch (error) {
    console.error('Health check failed:', error)
    
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'disconnected',
        api: 'operational'
      },
      error: 'Database connection failed'
    }
    
    res.status(503).json(healthData)
  }
})

// GET /api/health/readiness - Readiness probe
router.get('/readiness', async (req, res) => {
  try {
    // Check if all services are ready
    await prisma.$queryRaw`SELECT 1`
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database not ready'
    })
  }
})

// GET /api/health/liveness - Liveness probe
router.get('/liveness', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

export { router as healthRoutes }
