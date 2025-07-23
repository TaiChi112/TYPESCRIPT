#!/bin/bash

# Simple test script for the Vibe Backend API

API_URL="http://localhost:3001"

echo "🧪 Testing Vibe Backend API"
echo "=========================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$API_URL/health" | jq '.' || echo "Health check failed"
echo ""

# Test root endpoint  
echo "2. Testing root endpoint..."
curl -s "$API_URL/" | jq '.' || echo "Root endpoint failed"
echo ""

# Test get users (might fail if no users exist)
echo "3. Testing get users..."
curl -s "$API_URL/api/users" | jq '.' || echo "Get users failed"
echo ""

# Test create user
echo "4. Testing create user..."
curl -s -X POST "$API_URL/api/users/create" \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user", "email": "test@example.com"}' | jq '.' || echo "Create user failed"
echo ""

# Test get users again (should show the created user)
echo "5. Testing get users again..."
curl -s "$API_URL/api/users" | jq '.' || echo "Get users failed"
echo ""

echo "🎉 API testing complete!"
