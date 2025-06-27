import express from 'express';
import type { Item } from './types';
import {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
} from './services/itemService';

const app = express();
const port = process.env.PORT ?? 8080;

app.use(express.json());

app.post('/items', async (req, res) => {
    const { name, description } = req.body as Partial<Item>;

    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    try {
        const newItem = await createItem(name, description);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/items', async (req, res) => {
    try {
        const items = await getAllItems();
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/items/:id', async (req, res) => {
    const { id } = req.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item ID' });
        return;
    }

    try {
        const item = await getItemById(itemId);
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(200).json(item);
    } catch (error) {
        console.error('Error fetching item by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item ID' });
        return;
    }

    const { name, description } = req.body as Partial<Item>;

    if (name === undefined && description === undefined) {
        res.status(400).json({ error: 'At least one field (name or description) is required for update.' });
        return;
    }

    try {
        const updatedItem = await updateItem(itemId, { name, description });
        if (!updatedItem) {
            res.status(404).json({ error: 'Item not found or no fields to update.' });
            return;
        }
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/items/:id', async (req, res) => {
    const { id } = req.params;
    const itemId = parseInt(id);
    if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item ID' });
        return;
    }

    try {
        const deletedItem = await deleteItem(itemId);
        if (!deletedItem) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/', (req, res) => {
    res.send('Bun Express PostgreSQL CRUD API is running!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Connected to database via itemService.`);
});