import { Request, Response } from "express";

// Comprehensive validation rules and utilities
export class ValidationUtils {
  // Regex patterns for validation
  private static readonly TITLE_PATTERN = /^[a-zA-Z0-9\s\-_.,!?()[\]{}'"]+$/;
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /<iframe/gi, // Iframe tags
    /<object/gi, // Object tags
    /<embed/gi, // Embed tags
    /data:text\/html/gi, // Data URLs
    /vbscript:/gi, // VBScript protocol
  ];

  // Whitespace patterns
  private static readonly EXCESSIVE_WHITESPACE = /\s{10,}/g; // 10+ consecutive spaces
  private static readonly ONLY_WHITESPACE = /^\s*$/;

  // Check for potentially dangerous content
  static containsDangerousContent(input: string): boolean {
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
  }

  // Validate string content
  static isValidStringContent(input: string): boolean {
    // Allow most printable characters but block obvious script injections
    if (this.containsDangerousContent(input)) return false;
    
    // Check for excessive whitespace patterns that might indicate spam
    if (this.EXCESSIVE_WHITESPACE.test(input)) return false;
    
    return true;
  }

  // Sanitize string input
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
  }

  // Validate title specifically
  static validateTitle(title: any): { isValid: boolean; error?: string } {
    // Type check
    if (typeof title !== 'string') {
      return { isValid: false, error: 'Title must be a string' };
    }

    // Empty check after trimming
    const trimmedTitle = title.trim();
    if (trimmedTitle === '') {
      return { isValid: false, error: 'Title cannot be empty' };
    }

    // Length check
    if (trimmedTitle.length < 1) {
      return { isValid: false, error: 'Title must contain at least 1 character' };
    }

    if (trimmedTitle.length > 255) {
      return { isValid: false, error: 'Title must be less than 255 characters' };
    }

    // Content validation
    if (!this.isValidStringContent(trimmedTitle)) {
      return { isValid: false, error: 'Title contains invalid or potentially dangerous content' };
    }

    // Check for only whitespace variations
    if (this.ONLY_WHITESPACE.test(title)) {
      return { isValid: false, error: 'Title cannot contain only whitespace' };
    }

    return { isValid: true };
  }

  // Validate description specifically
  static validateDescription(description: any): { isValid: boolean; error?: string } {
    // Allow null/undefined for optional field
    if (description === null || description === undefined) {
      return { isValid: true };
    }

    // Type check
    if (typeof description !== 'string') {
      return { isValid: false, error: 'Description must be a string or null' };
    }

    // Length check (even for empty strings)
    if (description.length > 1000) {
      return { isValid: false, error: 'Description must be less than 1000 characters' };
    }

    // Content validation for non-empty descriptions
    if (description.trim() !== '' && !this.isValidStringContent(description)) {
      return { isValid: false, error: 'Description contains invalid or potentially dangerous content' };
    }

    return { isValid: true };
  }

  // Validate completed field
  static validateCompleted(completed: any): { isValid: boolean; error?: string } {
    // Allow undefined for optional updates
    if (completed === undefined) {
      return { isValid: true };
    }

    // Strict boolean validation - no string coercion
    if (typeof completed !== 'boolean') {
      return { isValid: false, error: 'Completed must be a boolean value (true or false)' };
    }

    return { isValid: true };
  }

  // Validate request body structure
  static validateRequestBody(body: any, allowedFields: string[]): { isValid: boolean; error?: string } {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { isValid: false, error: 'Request body must be a valid JSON object' };
    }

    // Check for unexpected fields
    const bodyKeys = Object.keys(body);
    const unexpectedFields = bodyKeys.filter(key => !allowedFields.includes(key));
    
    if (unexpectedFields.length > 0) {
      return { 
        isValid: false, 
        error: `Unexpected fields: ${unexpectedFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}` 
      };
    }

    // Check for empty object when fields are required
    if (bodyKeys.length === 0) {
      return { isValid: false, error: 'Request body cannot be empty' };
    }

    return { isValid: true };
  }

  // Validate todo ID
  static validateTodoId(id: string): { isValid: boolean; error?: string; parsedId?: number } {
    const parsedId = parseInt(id, 10);
    
    if (isNaN(parsedId)) {
      return { isValid: false, error: 'Todo ID must be a valid number' };
    }

    if (parsedId <= 0) {
      return { isValid: false, error: 'Todo ID must be a positive integer' };
    }

    if (parsedId > Number.MAX_SAFE_INTEGER) {
      return { isValid: false, error: 'Todo ID is too large' };
    }

    return { isValid: true, parsedId };
  }

  // Comprehensive validation for create operation
  static validateCreateTodo(body: any): { isValid: boolean; errors: string[]; sanitizedData?: any } {
    const errors: string[] = [];
    
    // Validate request body structure
    const bodyValidation = this.validateRequestBody(body, ['title', 'description']);
    if (!bodyValidation.isValid) {
      return { isValid: false, errors: [bodyValidation.error!] };
    }

    const { title, description } = body;

    // Title is required for creation
    if (title === undefined || title === null) {
      errors.push('Title is required');
    } else {
      const titleValidation = this.validateTitle(title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.error!);
      }
    }

    // Description is optional
    const descriptionValidation = this.validateDescription(description);
    if (!descriptionValidation.isValid) {
      errors.push(descriptionValidation.error!);
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Return sanitized data
    const sanitizedData = {
      title: this.sanitizeString(title),
      description: description ? this.sanitizeString(description) : undefined
    };

    return { isValid: true, errors: [], sanitizedData };
  }

  // Comprehensive validation for update operation
  static validateUpdateTodo(body: any): { isValid: boolean; errors: string[]; sanitizedData?: any } {
    const errors: string[] = [];
    
    // Validate request body structure
    const bodyValidation = this.validateRequestBody(body, ['title', 'description', 'completed']);
    if (!bodyValidation.isValid) {
      return { isValid: false, errors: [bodyValidation.error!] };
    }

    const { title, description, completed } = body;
    const sanitizedData: any = {};

    // Validate title if provided
    if (title !== undefined) {
      const titleValidation = this.validateTitle(title);
      if (!titleValidation.isValid) {
        errors.push(titleValidation.error!);
      } else {
        sanitizedData.title = this.sanitizeString(title);
      }
    }

    // Validate description if provided
    if (description !== undefined) {
      const descriptionValidation = this.validateDescription(description);
      if (!descriptionValidation.isValid) {
        errors.push(descriptionValidation.error!);
      } else {
        sanitizedData.description = description ? this.sanitizeString(description) : null;
      }
    }

    // Validate completed if provided
    if (completed !== undefined) {
      const completedValidation = this.validateCompleted(completed);
      if (!completedValidation.isValid) {
        errors.push(completedValidation.error!);
      } else {
        sanitizedData.completed = completed;
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [], sanitizedData };
  }
}
