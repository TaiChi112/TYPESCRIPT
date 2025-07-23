// Database configuration and utilities
import { Pool } from "pg";

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres";

// Create connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}
