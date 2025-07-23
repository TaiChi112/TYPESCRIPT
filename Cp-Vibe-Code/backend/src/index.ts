import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import profileRoutes from './routes/profile';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 CORS origin: ${env.CORS_ORIGIN}`);
});

export default app;
