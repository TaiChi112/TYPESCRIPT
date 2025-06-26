-- Initialize products table schema
-- This script runs automatically when the PostgreSQL container starts

-- Create a products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category_id INTEGER,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Insert sample products (for development only)
INSERT INTO products (name, description, price, sku, category_id, stock_quantity) 
VALUES 
    ('Sample Product 1', 'This is a sample product for testing', 29.99, 'PROD-001', 1, 100),
    ('Sample Product 2', 'Another sample product for development', 49.99, 'PROD-002', 1, 50),
    ('Sample Product 3', 'Third sample product with different category', 19.99, 'PROD-003', 2, 75)
ON CONFLICT (sku) DO NOTHING;
