import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Todo } from "../entity/Todo";
import { QueryFailedError } from "typeorm";
import { ValidationUtils } from "../utils/validation";

// Custom error types for better error handling
class TodoNotFoundError extends Error {
  constructor(id: number) {
    super(`Todo with id ${id} not found`);
    this.name = 'TodoNotFoundError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Helper function to handle database errors
const handleDatabaseError = (err: any, res: Response) => {
  console.error("Database error:", err);
  
  if (err instanceof QueryFailedError) {
    // Handle specific database constraint errors
    if (err.message.includes('duplicate key')) {
      return res.status(409).json({ 
        error: "Duplicate entry", 
        message: "A todo with this information already exists" 
      });
    }
    if (err.message.includes('connection')) {
      return res.status(503).json({ 
        error: "Database connection error", 
        message: "Unable to connect to database. Please try again later." 
      });
    }
    if (err.message.includes('timeout')) {
      return res.status(504).json({ 
        error: "Database timeout", 
        message: "Database operation timed out. Please try again." 
      });
    }
  }
  
  // Generic database error
  return res.status(500).json({ 
    error: "Database error", 
    message: "An unexpected database error occurred" 
  });
};

export class TodoController {
  static async getAll(req: Request, res: Response) {
    try {
      // Check if database connection is available
      if (!AppDataSource.isInitialized) {
        return res.status(503).json({ 
          error: "Service unavailable", 
          message: "Database connection not available" 
        });
      }

      const todoRepo = AppDataSource.getRepository(Todo);
      const todos = await todoRepo.find({ order: { createdAt: "DESC" } });
      res.json(todos);
    } catch (err: any) {
      if (err instanceof QueryFailedError) {
        return handleDatabaseError(err, res);
      }
      console.error("Error in getAll:", err);
      res.status(500).json({ 
        error: "Internal server error", 
        message: "An unexpected error occurred while fetching todos" 
      });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      // Validate todo ID
      const idValidation = ValidationUtils.validateTodoId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ 
          error: "Invalid input", 
          message: idValidation.error 
        });
      }

      if (!AppDataSource.isInitialized) {
        return res.status(503).json({ 
          error: "Service unavailable", 
          message: "Database connection not available" 
        });
      }

      const todoRepo = AppDataSource.getRepository(Todo);
      const todo = await todoRepo.findOneBy({ id: idValidation.parsedId });
      
      if (!todo) {
        return res.status(404).json({ 
          error: "Not found", 
          message: `Todo with ID ${idValidation.parsedId} does not exist` 
        });
      }
      
      res.json(todo);
    } catch (err: any) {
      if (err instanceof QueryFailedError) {
        return handleDatabaseError(err, res);
      }
      console.error("Error in getOne:", err);
      res.status(500).json({ 
        error: "Internal server error", 
        message: "An unexpected error occurred while fetching the todo" 
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      // Comprehensive validation using ValidationUtils
      const validation = ValidationUtils.validateCreateTodo(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: "Invalid input data",
          details: validation.errors
        });
      }

      if (!AppDataSource.isInitialized) {
        return res.status(503).json({ 
          error: "Service unavailable", 
          message: "Database connection not available" 
        });
      }

      // Use sanitized data from validation
      const { title, description } = validation.sanitizedData!;

      const todoRepo = AppDataSource.getRepository(Todo);
      const todo = todoRepo.create({ title, description });
      
      const savedTodo = await todoRepo.save(todo);
      res.status(201).json(savedTodo);
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ 
          error: "Validation error", 
          message: err.message 
        });
      }
      if (err instanceof QueryFailedError) {
        return handleDatabaseError(err, res);
      }
      console.error("Error in create:", err);
      res.status(500).json({ 
        error: "Internal server error", 
        message: "An unexpected error occurred while creating the todo" 
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      // Validate todo ID
      const idValidation = ValidationUtils.validateTodoId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ 
          error: "Invalid input", 
          message: idValidation.error 
        });
      }

      // Comprehensive validation using ValidationUtils
      const validation = ValidationUtils.validateUpdateTodo(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: "Invalid input data",
          details: validation.errors
        });
      }

      if (!AppDataSource.isInitialized) {
        return res.status(503).json({ 
          error: "Service unavailable", 
          message: "Database connection not available" 
        });
      }

      const todoRepo = AppDataSource.getRepository(Todo);
      const todo = await todoRepo.findOneBy({ id: idValidation.parsedId });
      
      if (!todo) {
        return res.status(404).json({ 
          error: "Not found", 
          message: `Todo with ID ${idValidation.parsedId} does not exist` 
        });
      }
      
      // Apply sanitized updates from validation
      const { sanitizedData } = validation;
      
      if (sanitizedData!.title !== undefined) {
        todo.title = sanitizedData!.title;
      }
      
      if (sanitizedData!.description !== undefined) {
        todo.description = sanitizedData!.description;
      }
      
      if (sanitizedData!.completed !== undefined) {
        todo.completed = sanitizedData!.completed;
      }
      
      const updatedTodo = await todoRepo.save(todo);
      res.json(updatedTodo);
    } catch (err: any) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ 
          error: "Validation error", 
          message: err.message 
        });
      }
      if (err instanceof QueryFailedError) {
        return handleDatabaseError(err, res);
      }
      console.error("Error in update:", err);
      res.status(500).json({ 
        error: "Internal server error", 
        message: "An unexpected error occurred while updating the todo" 
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Validate todo ID
      const idValidation = ValidationUtils.validateTodoId(req.params.id);
      if (!idValidation.isValid) {
        return res.status(400).json({ 
          error: "Invalid input", 
          message: idValidation.error 
        });
      }

      if (!AppDataSource.isInitialized) {
        return res.status(503).json({ 
          error: "Service unavailable", 
          message: "Database connection not available" 
        });
      }

      const todoRepo = AppDataSource.getRepository(Todo);
      const todo = await todoRepo.findOneBy({ id: idValidation.parsedId });
      
      if (!todo) {
        return res.status(404).json({ 
          error: "Not found", 
          message: `Todo with ID ${idValidation.parsedId} does not exist` 
        });
      }
      
      await todoRepo.remove(todo);
      res.status(204).send();
    } catch (err: any) {
      if (err instanceof QueryFailedError) {
        return handleDatabaseError(err, res);
      }
      console.error("Error in delete:", err);
      res.status(500).json({ 
        error: "Internal server error", 
        message: "An unexpected error occurred while deleting the todo" 
      });
    }
  }
}
