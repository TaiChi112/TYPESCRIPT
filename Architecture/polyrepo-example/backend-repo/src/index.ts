import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

import { userRoutes } from './routes/users'
import { healthRoutes } from './routes/health'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

// Load environment variables
dotenv.config()

// Initialize Prisma Client
export const prisma = new PrismaClient()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/users', userRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Polyrepo Backend API',
    version: '1.0.0',
    technology: {
      runtime: 'Bun',
      framework: 'Express.js',
      language: 'TypeScript',
      database: 'PostgreSQL',
      orm: 'Prisma'
    },
    endpoints: {
      health: '/api/health',
      users: '/api/users'
    }
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
  await prisma.$disconnect()
})

export default app
