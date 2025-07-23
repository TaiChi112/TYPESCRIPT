import { Pool } from 'pg';
import type { QueryResult } from 'pg';
import { type Item } from '../types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});


export async function createItem(name: string, description?: string | null): Promise<Item> {
  const result: QueryResult<Item> = await pool.query(
    'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );
  if (!result.rows[0]) {
    throw new Error('Failed to create item');
  }
  return result.rows[0];
}

export async function getAllItems(): Promise<Item[]> {
  const result: QueryResult<Item> = await pool.query('SELECT * FROM items ORDER BY id ASC');
  return result.rows;
}

export async function getItemById(id: number): Promise<Item | undefined> {
  const result: QueryResult<Item> = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0] : undefined;
}

export async function updateItem(id: number, updates: Partial<Item>): Promise<Item | undefined> {
  const queryParts: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    queryParts.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    queryParts.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }

  if (queryParts.length === 0) {
    return undefined;
  }

  values.push(id);

  const queryText = `
    UPDATE items
    SET ${queryParts.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *;
  `;

  const result: QueryResult<Item> = await pool.query(queryText, values);
  return result.rows.length > 0 ? result.rows[0] : undefined;
}

export async function deleteItem(id: number): Promise<Item | undefined> {
  const result: QueryResult<Item> = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
  return result.rows.length > 0 ? result.rows[0] : undefined;
}