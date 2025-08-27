-- Initialize database schema
-- This script runs automatically when the PostgreSQL container starts

-- Create a sample users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert a sample user (for development only)
INSERT INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@example.com', '$2b$10$example_hash_here')
ON CONFLICT (username) DO NOTHING;
