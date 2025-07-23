import express, { type Request, type Response } from 'express';
import bodyParser from 'body-parser';
import pool from "../database/config";

const app = express();
const port = process.env.APP_PORT ?? 3000;  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Bun Express App is running!');
});


app.post('/users', async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).send('Name and email are required');
        return;
    }
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error('Error creating user:', err.message);
        res.status(500).send('Server Error');
    }
});

// READ All (ดึงผู้ใช้ทั้งหมด)
app.get('/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching users:', err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error('Error fetching user:', err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name && !email) {
        res.status(400).send('Name or email is required for update');
        return;
    }

    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];
    let paramCount = 1;

    if (name) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
    }
    if (email) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
    }

    query += updates.join(', ') + ` WHERE id = $${paramCount++} RETURNING *`;
    values.push(id);

    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error('Error updating user:', err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.status(204).send(); // No Content on successful deletion
    } catch (err: any) {
        console.error('Error deleting user:', err.message);
        res.status(500).send('Server Error');
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log('--- API Endpoints ---');
    console.log(`GET /`);
    console.log(`POST /users`);
    console.log(`GET /users`);
    console.log(`GET /users/:id`);
    console.log(`PUT /users/:id`);
    console.log(`DELETE /users/:id`);
});