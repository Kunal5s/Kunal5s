const express = require('express');
const router = express.Router();

// Mock database pool (replace with actual database connection)
const pool = {
    query: async (text, params) => {
        console.log('Executing query:', text, params);
        // Simulate database interaction
        if (text.startsWith('INSERT INTO categories')) {
            return { rows: [{ id: Math.floor(Math.random() * 1000) + 1, ...params[0] }], rowCount: 1 };
        }
        if (text.startsWith('SELECT * FROM categories WHERE id =')) {
            const id = parseInt(params[0]);
            if (id === 9999) return { rows: [], rowCount: 0 }; // Simulate not found
            return { rows: [{ id, name: 'Sample Category', description: 'A sample category' }], rowCount: 1 };
        }
        if (text.startsWith('SELECT * FROM categories')) {
            return { rows: [{ id: 1, name: 'Tech', description: 'Technology articles' }, { id: 2, name: 'Health', description: 'Health and wellness' }], rowCount: 2 };
        }
        if (text.startsWith('UPDATE categories')) {
            const id = parseInt(params[1]);
            if (id === 9999) return { rowCount: 0 }; // Simulate not found
            return { rows: [{ id, ...params[0] }], rowCount: 1 };
        }
        if (text.startsWith('DELETE FROM categories')) {
            const id = parseInt(params[0]);
            if (id === 9999) return { rowCount: 0 }; // Simulate not found
            return { rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }
};

// POST /categories - Create a new category
router.post('/', async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    try {
        // In a real application, you would validate and sanitize input here
        const queryText = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
        const queryParams = [name, description || null];
        const result = await pool.query(queryText, queryParams);

        if (result.rowCount === 0) {
            return res.status(500).json({ error: 'Failed to create category.' });
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        // Check for unique constraint violation (example error code for PostgreSQL)
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Category name already exists.' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const queryText = 'SELECT * FROM categories ORDER BY name ASC';
        const result = await pool.query(queryText);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /categories/:id - Get a single category by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid category ID.' });
    }

    try {
        const queryText = 'SELECT * FROM categories WHERE id = $1';
        const queryParams = [id];
        const result = await pool.query(queryText, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error fetching category with ID ${id}:`, err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /categories/:id - Update an existing category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid category ID.' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Category name is required for update.' });
    }

    try {
        // In a real application, you would validate and sanitize input here
        const queryText = 'UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *';
        const queryParams = [name, description || null, id];
        const result = await pool.query(queryText, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found or no changes made.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error updating category with ID ${id}:`, err);
        // Check for unique constraint violation (example error code for PostgreSQL)
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Category name already exists.' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// DELETE /categories/:id - Delete a category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid category ID.' });
    }

    try {
        const queryText = 'DELETE FROM categories WHERE id = $1 RETURNING *';
        const queryParams = [id];
        const result = await pool.query(queryText, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        // Return the deleted category's data or just a success message
        res.status(200).json({ message: 'Category deleted successfully.', deletedCategory: result.rows[0] });
        // Or use res.status(204).send(); for no content response
    } catch (err) {
        console.error(`Error deleting category with ID ${id}:`, err);
        // Handle potential foreign key constraint errors if categories are linked
        // For example, if err.code === '23503' (foreign_key_violation for PostgreSQL)
        // return res.status(409).json({ error: 'Cannot delete category as it is referenced by other entities.' });
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
