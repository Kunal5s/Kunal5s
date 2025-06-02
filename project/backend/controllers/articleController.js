const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Mock database pool (replace with actual database connection)
const pool = {
    query: async (text, params) => {
        console.log('Executing query:', text, params);
        if (text.startsWith('INSERT INTO articles')) {
            // Simulate inserting an article and returning it
            return { rows: [{ id: Math.floor(Math.random() * 1000) + 1, ...params[0] }], rowCount: 1 };
        }
        // Add other mock queries if needed for articles
        return { rows: [], rowCount: 0 };
    },
    // Simulate a more complex query for fetching articles with joins
    getArticles: async (filters = {}) => {
        console.log('Simulating getArticles with filters:', filters);
        const { limit = 10, offset = 0, category_id } = filters;

        // Sample data - in a real DB, this would be a SELECT query with JOINs and WHERE clauses
        const allArticles = [
            { id: 1, title: 'Understanding AI', content: 'Long content...', category_id: 1, image_id: 1, author: 'Jane Doe', published_at: new Date(), category_name: 'Tech', image_url: 'https://cdn.example.com/images/ai.jpg', image_alt_text: 'AI concept' },
            { id: 2, title: 'Healthy Eating Habits', content: 'Long content...', category_id: 2, image_id: 2, author: 'John Smith', published_at: new Date(), category_name: 'Health', image_url: 'https://cdn.example.com/images/food.jpg', image_alt_text: 'Healthy food' },
            { id: 3, title: 'Advanced JavaScript', content: 'Long content...', category_id: 1, image_id: null, author: 'Jane Doe', published_at: new Date(), category_name: 'Tech', image_url: null, image_alt_text: null },
            { id: 4, title: 'Mindfulness and Meditation', content: 'Long content...', category_id: 2, image_id: 3, author: 'Alice Brown', published_at: new Date(), category_name: 'Health', image_url: 'https://cdn.example.com/images/meditation.jpg', image_alt_text: 'Person meditating' },
            { id: 5, title: 'The Future of Space Travel', content: 'Long content...', category_id: 3, image_id: 4, author: 'Chris Green', published_at: new Date(), category_name: 'Science', image_url: 'https://cdn.example.com/images/space.jpg', image_alt_text: 'Spaceship' },
            // Add more articles to test pagination and filtering (20 total for this mock)
            ...Array.from({ length: 15 }, (_, i) => ({
                id: 6 + i,
                title: `Sample Article ${i + 1}`,
                content: 'Sample content...',
                category_id: (i % 3) + 1, // Distribute among 3 categories
                image_id: i % 2 === 0 ? 100 + i : null, // Some have images, some not
                author: 'Mock Author',
                published_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Published over last 15 days
                category_name: ['Tech', 'Health', 'Science'][(i % 3)],
                image_url: i % 2 === 0 ? `https://cdn.example.com/images/sample${i}.jpg` : null,
                image_alt_text: i % 2 === 0 ? `Sample image ${i}` : null,
            }))
        ];

        let filteredArticles = allArticles;
        if (category_id) {
            filteredArticles = allArticles.filter(article => article.category_id === parseInt(category_id));
        }

        const paginatedArticles = filteredArticles.slice(offset, offset + limit);
        
        return {
            rows: paginatedArticles,
            rowCount: paginatedArticles.length, // This is count of items on current page
            totalCount: filteredArticles.length // This is total count after filtering
        };
    },
    getArticleById: async (articleId) => {
        console.log('Simulating getArticleById with ID:', articleId);
        // Find article in the sample data used by getArticles mock
        const allArticles = [ // This should be the same base data as in getArticles
            { id: 1, title: 'Understanding AI', content: 'Full content for Understanding AI...', category_id: 1, image_id: 1, author: 'Jane Doe', published_at: new Date(), category_name: 'Tech', image_url: 'https://cdn.example.com/images/ai.jpg', image_alt_text: 'AI concept', summary: "A brief summary of AI." },
            { id: 2, title: 'Healthy Eating Habits', content: 'Full content for Healthy Eating...', category_id: 2, image_id: 2, author: 'John Smith', published_at: new Date(), category_name: 'Health', image_url: 'https://cdn.example.com/images/food.jpg', image_alt_text: 'Healthy food', summary: "A brief summary of healthy eating." },
            { id: 3, title: 'Advanced JavaScript', content: 'Full content for Advanced JS...', category_id: 1, image_id: null, author: 'Jane Doe', published_at: new Date(), category_name: 'Tech', image_url: null, image_alt_text: null, summary: "A brief summary of JS." },
            // ... (ensure this list is consistent with the one in getArticles or use a shared mock data source)
            ...Array.from({ length: 15 }, (_, i) => ({
                id: 6 + i,
                title: `Sample Article ${i + 1}`,
                content: `Full content for Sample Article ${i + 1}. `.repeat(50),
                summary: `Summary for Sample Article ${i + 1}.`,
                category_id: (i % 3) + 1, 
                image_id: i % 2 === 0 ? 100 + i : null, 
                author: 'Mock Author',
                published_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                category_name: ['Tech', 'Health', 'Science'][(i % 3)],
                image_url: i % 2 === 0 ? `https://cdn.example.com/images/sample${i}.jpg` : null,
                image_alt_text: i % 2 === 0 ? `Sample image ${i}` : null,
            }))
        ];
        const article = allArticles.find(art => art.id === parseInt(articleId));
        if (article) {
            return { rows: [article], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }
};

// Mock Google Gemini API client setup (replace with actual client)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI;
let geminiModel;

if (GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro model
        console.log("Google Gemini AI SDK initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize Google Gemini AI SDK:", error.message);
        console.warn("Article generation will use mocked implementation due to SDK initialization error.");
        genAI = null; // Ensure genAI is null if initialization fails
    }
} else {
    console.warn("GEMINI_API_KEY not found in environment variables. Article generation will use mocked implementation.");
}


/**
 * Mock function to simulate calling the Google Gemini API.
 * Kept as a fallback or for environments without an API key.
 * @param {string} topic The topic or keywords for article generation.
 * @returns {Promise<object>} A promise that resolves to an object with headline, summary, and content.
 */
const mockGenerateArticleWithGemini = async (topic) => {
    console.log(`[MOCK] Gemini API call for topic: ${topic}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

    if (!topic || topic.trim() === "") {
        return {
            error: "Topic is required",
            headline: "Error: Topic is required",
            summary: "Cannot generate an article without a topic.",
            content: "Please provide a valid topic to generate an article."
        };
    }
    
    const headline = `The Ultimate Guide to ${topic} (Mocked)`;
    const summary = `This is a mocked summary for an article about ${topic}. It provides a comprehensive overview, covering all essential aspects.`;
    let content = `This is mocked content for an article about ${topic}.\n\nIntroduction to ${topic}...\n\nSection 1: Exploring ${topic} in depth...\n\nSection 2: Advanced concepts related to ${topic}...\n\nConclusion: ${topic} is a fascinating subject. This content is approximately 800-1000 words to simulate a real article length.`;
    content += `\n${"This is additional filler text to reach the target word count. ".repeat(50)}`;
    content += `\n${"More placeholder sentences to ensure the mock article is sufficiently long. ".repeat(50)}`;
    content += `\n${"Finalizing the mock content with some more padding. ".repeat(30)}`;


    return {
        headline,
        summary,
        content,
    };
};

/**
 * Generates an article using the Google Gemini API.
 * @param {string} topic The topic or keywords for article generation.
 * @param {object} [externalData] Optional: Data from automotiveDataService to enrich the prompt.
 * @returns {Promise<object>} A promise that resolves to an object with headline, summary, and content, or an error object.
 */
const generateArticleWithGemini = async (topic, externalData = null) => {
    if (!genAI || !geminiModel) {
        console.warn("Gemini API key not configured or SDK failed to initialize. Falling back to mock generation.");
        return mockGenerateArticleWithGemini(topic);
    }

    console.log(`[REAL] Attempting Gemini API call for topic: ${topic}`);

    // Construct a more detailed prompt
    // TODO: Incorporate externalData (from automotiveDataService) more meaningfully into the prompt.
    // For example, if externalData contains specs for a car, the prompt could be:
    // "Write a blog post about the ${externalData.make} ${externalData.model} (${externalData.year}).
    // Highlight its key features: ${externalData.specs.engine}, ${externalData.specs.horsepower}hp.
    // Discuss its fuel economy: ${externalData.specs.fuel_economy_mpg}.
    // Include a compelling headline, a brief summary (around 100 words),
    // and a main article body of 800-1000 words in a blog-style, engaging tone."

    const prompt = `
Generate a blog post about the following topic: "${topic}".

The blog post should include:
1.  A compelling and SEO-friendly headline.
2.  A concise summary or introduction (approximately 50-100 words).
3.  The main article content, which should be engaging, informative, well-structured, and approximately 800-1000 words long. 
    Use paragraphs, and consider using subheadings (using Markdown format like ## Subheading) if it makes sense for the topic.

Please structure the output as a JSON object with the following exact keys: "headline", "summary", "content".
Example:
{
  "headline": "Your Generated Headline Here",
  "summary": "Your generated summary here...",
  "content": "Your generated main article content here..."
}
`;

    try {
        const generationConfig = {
            temperature: 0.7, // Controls randomness. Lower is more deterministic.
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048, // Gemini Pro's default is 2048. Longer articles might need chaining or different models.
        };
        
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await geminiModel.generateContent(prompt, generationConfig, safetySettings);
        const response = result.response;
        const text = response.text();
        
        // Attempt to parse the JSON string from Gemini
        let parsedText = JSON.parse(text);
        
        // Basic validation of the parsed structure
        if (!parsedText.headline || !parsedText.summary || !parsedText.content) {
            console.error("Gemini API response is missing expected fields (headline, summary, content). Raw text:", text);
            return { error: "Failed to parse article structure from Gemini response.", details: "Missing expected fields." };
        }
        
        console.log(`[REAL] Gemini API call successful for topic: ${topic}`);
        return parsedText;

    } catch (error) {
        console.error(`[REAL] Gemini API call failed for topic "${topic}":`, error);
        // Check for specific error types, e.g., blocked content due to safety settings
        if (error.message.includes("SAFETY")) {
             return { error: "Content generation blocked due to safety settings.", details: error.message };
        }
        if (error.message.includes("API key not valid")) {
            console.warn("Gemini API key is invalid. Future attempts may be blocked. Falling back to mock for this request.");
            return mockGenerateArticleWithGemini(topic); // Fallback for this specific request
        }
        // For other errors, return a generic error message
        return { error: "Failed to generate article using Gemini API.", details: error.message };
    }
};

// GET /articles - Get all articles with pagination and filtering
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, category_id, author, sort_by = 'published_at', order = 'DESC' } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    if (isNaN(pageInt) || pageInt < 1) {
        return res.status(400).json({ error: 'Invalid page number. Must be a positive integer.' });
    }
    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) { // Max limit 100
        return res.status(400).json({ error: 'Invalid limit. Must be an integer between 1 and 100.' });
    }
    if (category_id && isNaN(parseInt(category_id))) {
        return res.status(400).json({ error: 'Invalid category_id. Must be an integer.' });
    }
    // TODO: Add validation for author, sort_by, order if needed

    const offset = (pageInt - 1) * limitInt;

    try {
        // In a real application, the SQL query would handle joins, filtering, sorting, and pagination.
        // Example pseudo-SQL:
        // SELECT a.*, c.name as category_name, i.url as image_url, i.alt_text as image_alt_text
        // FROM articles a
        // LEFT JOIN categories c ON a.category_id = c.id
        // LEFT JOIN images i ON a.image_id = i.id
        // WHERE (?category_id IS NULL OR a.category_id = ?category_id)
        // AND (?author IS NULL OR a.author = ?author)
        // ORDER BY ?sort_by ?order
        // LIMIT ?limit OFFSET ?offset;
        //
        // SELECT COUNT(*) FROM articles WHERE (?category_id IS NULL OR category_id = ?category_id) ... ;
        
        const filters = { limit: limitInt, offset };
        if (category_id) filters.category_id = category_id;
        if (author) filters.author = author; // Placeholder for author filtering
        // Pass sort_by and order to the mock/DB layer if implementing sorting

        const result = await pool.getArticles(filters); // Using the new mock method

        const totalArticles = result.totalCount;
        const totalPages = Math.ceil(totalArticles / limitInt);

        res.status(200).json({
            data: result.rows,
            pagination: {
                currentPage: pageInt,
                totalPages,
                totalItems: totalArticles,
                itemsPerPage: limitInt,
                hasNextPage: pageInt < totalPages,
                hasPreviousPage: pageInt > 1,
            }
        });
    } catch (err) {
        console.error('Error fetching articles:', err);
        res.status(500).json({ error: 'Internal server error while fetching articles.' });
    }
});

// GET /articles/:id - Get a single article by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid article ID.' });
    }

    try {
        // In a real application, this would be a SQL query like:
        // SELECT a.*, c.name as category_name, i.url as image_url, i.alt_text as image_alt_text
        // FROM articles a
        // LEFT JOIN categories c ON a.category_id = c.id
        // LEFT JOIN images i ON a.image_id = i.id
        // WHERE a.id = $1;
        const result = await pool.getArticleById(id); // Using new mock method

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Article not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error fetching article with ID ${id}:`, err);
        res.status(500).json({ error: 'Internal server error while fetching the article.' });
    }
});


// POST /articles/generate - Generate a new article
router.post('/generate', async (req, res) => {
    const { topic, category_id, author, use_mock } = req.body; // Added use_mock for explicit mock usage

    if (!topic) {
        return res.status(400).json({ error: 'Topic or keywords are required for article generation.' });
    }
    if (!category_id) { // Assuming category_id is required to associate the article
        return res.status(400).json({ error: 'Category ID is required to save the article.' });
    }

    try {
        let generatedArticle;
        // Determine whether to use real API or mock
        // Fallback to mock if API key is not set or if use_mock is true
        if (use_mock || !GEMINI_API_KEY || !genAI) {
            if (!GEMINI_API_KEY && !use_mock) {
                console.warn("Attempting to use real Gemini API, but key is not configured. Using mock instead.");
            }
            generatedArticle = await mockGenerateArticleWithGemini(topic);
        } else {
            // TODO: Optionally, fetch data from automotiveDataService here
            // const vehicleData = await automotiveDataService.getVehicleSpecs("Toyota", "Camry");
            // generatedArticle = await generateArticleWithGemini(topic, vehicleData);
            generatedArticle = await generateArticleWithGemini(topic);
        }

        // Check if generation (real or mock) produced an error object
        if (generatedArticle.error) {
            // If it's a simple "topic is required" from mock, it's a 400
            if (generatedArticle.error === "Topic is required") {
                 return res.status(400).json({ error: generatedArticle.summary || generatedArticle.error });
            }
            // For other errors (e.g., API call failure, safety blocking), it's a 500 or specific error
            console.error("Article generation failed:", generatedArticle.details || generatedArticle.error);
            return res.status(500).json({ 
                error: 'Failed to generate article.', 
                details: generatedArticle.error, // Provide the error message from Gemini function
                suggestion: "If using the real API, check server logs. If the API key is missing or invalid, generation will be mocked or fail."
            });
        }

        // 2. Save the generated article to the (mocked) database
        const queryText = 'INSERT INTO articles (title, content, category_id, author, published_at) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        // For now, let's assume it's published immediately. `image_id` is omitted as it's not part of generation here.
        const queryParams = [
            generatedArticle.headline,
            generatedArticle.content, // Full content
            category_id,
            author || 'AI Assistant',
            new Date() // published_at
        ];
        
        const dbResult = await pool.query(queryText, queryParams);

        if (dbResult.rowCount === 0) {
            return res.status(500).json({ error: 'Failed to save the generated article to the database.' });
        }

        // Include summary in the response, though it's not typically stored in the 'articles' table as per current schema.
        // The 'content' field would store the full article.
        // If summary needs to be stored, schema should be updated or it should be part of 'content'.
        const responseArticle = {
            ...dbResult.rows[0],
            summary: generatedArticle.summary // Add summary to the response for client convenience
        };
        
        res.status(201).json(responseArticle);

    } catch (err) {
        console.error('Error generating or saving article:', err);
        // Add more specific error handling if the Gemini API client throws specific errors
        res.status(500).json({ error: 'Internal server error during article generation or saving.' });
    }
});

module.exports = router;
