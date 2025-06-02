const express = require('express');
const categoryRoutes = require('./controllers/categoryController');
const articleRoutes = require('./controllers/articleController'); // Import article routes
const imageRoutes = require('./controllers/imageController'); // Import image routes
const { startSchedulers } = require('./scheduler'); // Import scheduler

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the category routes
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes); // Mount article routes
app.use('/api/images', imageRoutes); // Mount image routes

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        startSchedulers(); // Start the scheduler
    });
}

module.exports = app; // Export for potential testing
