-- Sample initialization script
-- This file will be executed when the database container starts for the first time

-- Create any initial tables, users, or data here
-- Example:
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- You can add multiple .sql files in this directory
-- They will be executed in alphabetical order
