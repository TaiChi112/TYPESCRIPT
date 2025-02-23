import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup PostgreSQL connection
const pool = new Pool({
  user: 'taichi',
  host: '127.0.0.1',
  database: 'taichi',
  password: 'taichi',
  port: 5432 // PostgreSQL default port
});

// Middleware for parsing JSON bodies
app.use(express.json());

// Create a new record
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { user_id, name, email } = req.body;
    const query = 'INSERT INTO users (user_id,name, email) VALUES ($1,$2, $3) RETURNING *';
    const values = [user_id, name, email];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      message: "Server error",
    }).end()
  }
});

// Read all records
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      message: "Server error!",
    }
    ).end();
  }
});

// Update a record
app.put('/api/users/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { name, email } = req.body;
    const query = 'UPDATE users SET name = $1, email = $2 WHERE user_id = $3 RETURNING *';
    const values = [name, email, user_id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Server Error');
  }
});

// Delete a record
app.delete('/api/users/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const query = 'DELETE FROM users WHERE user_id = $1';
    await pool.query(query, [user_id]);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
