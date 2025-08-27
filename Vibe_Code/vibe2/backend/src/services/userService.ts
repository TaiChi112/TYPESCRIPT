// User-related database operations
import { pool } from "../database";
import type { User, CreateUserRequest } from "../types";

export class UserService {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Create a new user
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const { username, email } = userData;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username, email, created_at',
        [username, email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Update user
  static async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User | null> {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (userData.username !== undefined) {
        fields.push(`username = $${paramCount++}`);
        values.push(userData.username);
      }

      if (userData.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }

      if (fields.length === 0) {
        return null;
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, username, email, created_at
      `;

      const result = await client.query(query, values);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Delete user
  static async deleteUser(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }
}
