import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes";
import { AppDataSource } from "./data-source";
import { globalErrorHandler, notFoundHandler, validateJSON } from "./middleware/errorHandler";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// JSON parsing with error handling
app.use(express.json({ limit: '10mb' }));
app.use(validateJSON);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
  });
});

// API routes
app.use("/api", todoRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
    process.exit(1);
  });
