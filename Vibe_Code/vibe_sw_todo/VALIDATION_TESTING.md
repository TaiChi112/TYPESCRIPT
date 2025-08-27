# Input Validation Testing Guide

This document outlines test cases for the improved input validation in the Todo application.

## Testing the Enhanced Validation

### **Title Field Validation**

#### ✅ Valid Cases
```bash
# Valid title
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'

# Title with special characters
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Review project (urgent!)"}' 

# Maximum length title (255 characters)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "'$(python -c "print('a'*255)")'"}'
```

#### ❌ Invalid Cases
```bash
# Missing title
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 - "Title is required"

# Empty title
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
# Expected: 400 - "Title cannot be empty"

# Whitespace-only title
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "   "}'
# Expected: 400 - "Title cannot contain only whitespace"

# Non-string title
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": 123}'
# Expected: 400 - "Title must be a string"

# Title too long (256 characters)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "'$(python -c "print('a'*256)")'"}'
# Expected: 400 - "Title must be less than 255 characters"

# Title with script injection
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "<script>alert(\"xss\")</script>"}'
# Expected: 400 - "Title contains invalid or potentially dangerous content"

# Title with excessive whitespace
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task          with          spaces"}'
# Expected: 400 - "Title contains invalid or potentially dangerous content"
```

### **Description Field Validation**

#### ✅ Valid Cases
```bash
# Valid description
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": "Buy milk and bread"}'

# Empty description (allowed)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": ""}'

# Null description (allowed)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": null}'

# No description field (allowed)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task"}'

# Maximum length description (1000 characters)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": "'$(python -c "print('a'*1000)")'"}'
```

#### ❌ Invalid Cases
```bash
# Non-string description
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": 123}'
# Expected: 400 - "Description must be a string or null"

# Description too long (1001 characters)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": "'$(python -c "print('a'*1001)")'"}'
# Expected: 400 - "Description must be less than 1000 characters"

# Description with script injection
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "description": "<iframe src=\"javascript:alert(1)\"></iframe>"}'
# Expected: 400 - "Description contains invalid or potentially dangerous content"
```

### **Completed Field Validation (Update Only)**

#### ✅ Valid Cases
```bash
# Boolean true
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Boolean false
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": false}'

# Omitted completed field (allowed in updates)
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title"}'
```

#### ❌ Invalid Cases
```bash
# String "true" (no coercion)
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": "true"}'
# Expected: 400 - "Completed must be a boolean value (true or false)"

# Number 1
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": 1}'
# Expected: 400 - "Completed must be a boolean value (true or false)"

# String "false"
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": "false"}'
# Expected: 400 - "Completed must be a boolean value (true or false)"
```

### **ID Parameter Validation**

#### ✅ Valid Cases
```bash
# Valid positive integer
curl -X GET http://localhost:5000/api/todos/1
curl -X GET http://localhost:5000/api/todos/999999
```

#### ❌ Invalid Cases
```bash
# Non-numeric ID
curl -X GET http://localhost:5000/api/todos/abc
# Expected: 400 - "Todo ID must be a valid number"

# Zero ID
curl -X GET http://localhost:5000/api/todos/0
# Expected: 400 - "Todo ID must be a positive integer"

# Negative ID
curl -X GET http://localhost:5000/api/todos/-1
# Expected: 400 - "Todo ID must be a positive integer"

# Decimal ID
curl -X GET http://localhost:5000/api/todos/1.5
# Expected: 400 - "Todo ID must be a valid number"

# Very large number (beyond safe integer)
curl -X GET http://localhost:5000/api/todos/9999999999999999999
# Expected: 400 - "Todo ID is too large"
```

### **Request Body Structure Validation**

#### ✅ Valid Cases
```bash
# Valid JSON object
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task"}'

# Valid update with multiple fields
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated", "description": "New desc", "completed": true}'
```

#### ❌ Invalid Cases
```bash
# Invalid JSON syntax
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task"'
# Expected: 400 - "Request body contains invalid JSON"

# Array instead of object
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '[{"title": "Task"}]'
# Expected: 400 - "Request body must be a valid JSON object"

# Empty request body
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 - "Request body cannot be empty"

# Unexpected fields (CREATE)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "unexpected": "field"}'
# Expected: 400 - "Unexpected fields: unexpected. Allowed fields: title, description"

# Unexpected fields (UPDATE)
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Task", "invalid": "field"}'
# Expected: 400 - "Unexpected fields: invalid. Allowed fields: title, description, completed"
```

## Edge Cases Covered

### **String Sanitization**
- Multiple consecutive spaces → Single space
- Leading/trailing whitespace → Trimmed
- Control characters → Removed
- Unicode normalization

### **Security Prevention**
- Script tag injection
- JavaScript protocol URLs
- Event handler attributes
- Iframe/object/embed tags
- Data URLs with HTML
- VBScript protocol

### **Data Integrity**
- Type coercion prevention
- Null vs undefined distinction
- Empty vs whitespace-only strings
- Numeric overflow protection

### **Error Response Format**
All validation errors return consistent format:
```json
{
  "error": "Validation failed",
  "message": "Invalid input data", 
  "details": [
    "Title cannot be empty",
    "Description must be less than 1000 characters"
  ]
}
```

## Improvements Over Previous Validation

1. **Comprehensive Content Filtering** - Blocks XSS and injection attempts
2. **Strict Type Validation** - No automatic type coercion
3. **Detailed Error Messages** - Multiple validation errors in single response
4. **Field-Specific Validation** - Different rules for different contexts
5. **Input Sanitization** - Automatic cleaning of valid inputs
6. **Enhanced Security** - Protection against common web vulnerabilities
7. **Better User Experience** - Clear, actionable error messages

This validation system provides enterprise-level security and user experience while maintaining performance and scalability.
