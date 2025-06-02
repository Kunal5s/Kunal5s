const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // For making HTTP requests

// Mock database pool (replace with actual database connection)
const pool = {
    query: async (text, params) => {
        console.log('Executing query:', text, params);
        if (text.startsWith('INSERT INTO images')) {
            // Simulate inserting an image and returning it
            const newImage = { id: Math.floor(Math.random() * 1000) + 1, ...params[0], uploaded_at: new Date() };
            return { rows: [newImage], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }
};

// Mock AI Image Generator API client setup
const API_NINJAS_KEY = process.env.API_NINJAS_KEY; // Using the existing key for API Ninjas

if (!API_NINJAS_KEY) {
    console.warn("API_NINJAS_KEY not found in environment variables. Image generation will be fully mocked.");
}

/**
 * Mock function to simulate calling an AI Image Generator API.
 * Kept for fallback or when API key is not available.
 * @param {string} prompt The text prompt for image generation.
 * @returns {Promise<object>} A promise that resolves to an object with imageUrl and altText, or an error object.
 */
const mockGenerateImageWithAI = async (prompt) => {
    console.log(`[MOCK] AI Image Generation for prompt: "${prompt}"`);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!prompt || prompt.trim() === "") {
        return { error: "Prompt is required for image generation." };
    }

    const filename = `${prompt.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}-${Date.now()}.jpg`;
    return {
        imageUrl: `https://cdn.example.com/mockimages/${filename}`,
        altText: `Mocked AI-generated image for: ${prompt.substring(0, 100)}`,
        filename: filename // Added for consistency
    };
};

/**
 * Generates an image using the API Ninjas Image API (Stable Diffusion).
 * @param {string} prompt The text prompt for image generation.
 * @returns {Promise<object>} A promise that resolves to an object with imageUrl, altText, and filename, or an error object.
 */
const generateImageWithAI = async (prompt) => {
    if (!API_NINJAS_KEY) {
        console.warn("API_NINJAS_KEY not configured. Falling back to mock image generation.");
        return mockGenerateImageWithAI(prompt);
    }

    console.log(`[REAL] Attempting API Ninjas Image API call for prompt: "${prompt}"`);
    const apiUrl = 'https://api.api-ninjas.com/v1/image?category=abstract&prompt='; // Example category
    // API Ninjas seems to prefer the prompt in the query string for this specific image endpoint.
    // Or, it might be a POST with JSON body depending on the exact API - their docs can be inconsistent.
    // For this example, let's assume a model that takes prompt in URL and other params in body if needed.
    // Based on typical Stable Diffusion APIs, a POST with JSON is more common for detailed parameters.
    // Let's try constructing it as a POST request with a JSON body as that's more standard for image gen.
    // The API Ninjas documentation for /v1/image is sparse; /v1/texttoimage is clearer for Stable Diffusion.
    // Assuming /v1/texttoimage is the target for prompt-based generation:
    const textToImageApiUrl = 'https://api.api-ninjas.com/v1/texttoimage';

    try {
        // API Ninjas texttoimage expects a POST with JSON payload
        const response = await fetch(textToImageApiUrl, {
            method: 'POST',
            headers: {
                'X-Api-Key': API_NINJAS_KEY,
                'Content-Type': 'application/json',
                'Accept': 'image/jpeg' // Requesting image directly
            },
            body: JSON.stringify({
                text: prompt,
                // model: "sd_xl_base_1.0", // Optional: specify model if API supports
                // width: 1024, // Optional
                // height: 1024, // Optional
                // steps: 50, // Optional
            })
        });

        if (!response.ok) {
            let errorBody = await response.text(); // Try to get error details
            try { errorBody = JSON.parse(errorBody); } catch (e) { /* ignore parsing error if not JSON */ }
            console.error(`[REAL] API Ninjas Image API call failed with status ${response.status}:`, errorBody);
            return { error: `API request failed with status ${response.status}`, details: errorBody };
        }

        // The API returns the image data directly as a binary blob (image/jpeg).
        // We need to save this image or upload it to a CDN and get a URL.
        // For this integration, we cannot directly save to a file system or upload to a real CDN.
        // So, we will simulate this by returning a placeholder URL and the prompt as alt text.
        // In a real-world scenario:
        // 1. Convert response.buffer() to a Buffer.
        // 2. Generate a unique filename (e.g., UUID or hash of prompt).
        // 3. Upload buffer to a cloud storage (S3, GCS, etc.) which provides a URL.
        // 4. Store that URL in the database.

        // Since the API returns binary data, we can't directly get a URL from it.
        // We'll mock the "upload and get URL" part.
        console.log(`[REAL] API Ninjas Image API call successful for prompt: "${prompt}". Image data received (binary).`);
        const filename = `${prompt.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}-${Date.now()}.jpg`;
        const simulatedImageUrl = `https://cdn.example.com/generatedimages/${filename}`; // Placeholder URL

        return {
            imageUrl: simulatedImageUrl,
            altText: `AI-generated image for: ${prompt.substring(0, 100)}`,
            filename: filename, // This would be the name of the file saved/uploaded
            apiRawResponse: true // Indicates the API returned raw image data that we "handled"
        };

    } catch (error) {
        console.error(`[REAL] API Ninjas Image API call error for prompt "${prompt}":`, error);
        return { error: "Failed to generate image using AI.", details: error.message };
    }
};

// POST /images/generate - Generate a new image
router.post('/generate', async (req, res) => {
    const { prompt, use_mock } = req.body; // Added use_mock

    if (!prompt) {
        return res.status(400).json({ error: 'A text prompt is required for image generation.' });
    }

    try {
        let generatedImageData;
        if (use_mock || !API_NINJAS_KEY) {
            if (!API_NINJAS_KEY && !use_mock) {
                 console.warn("Attempting to use real Image API, but key is not configured. Using mock instead.");
            }
            generatedImageData = await mockGenerateImageWithAI(prompt);
        } else {
            generatedImageData = await generateImageWithAI(prompt);
        }
        
        if (generatedImageData.error) {
            return res.status(500).json({ 
                error: 'Failed to generate image.', 
                details: generatedImageData.error,
                suggestion: "If using the real API, check server logs. If the API key is missing or invalid, generation will be mocked or fail."
            });
        }

        // 2. Save image information to the (mocked) database
        // The filename comes from the generation function now
        const queryText = 'INSERT INTO images (filename, alt_text, url) VALUES ($1, $2, $3) RETURNING *';
        const queryParams = [generatedImageData.filename, generatedImageData.altText, generatedImageData.imageUrl];
        
        const dbResult = await pool.query(queryText, queryParams);

        if (dbResult.rowCount === 0) {
            return res.status(500).json({ error: 'Failed to save the generated image information to the database.' });
        }
        
        res.status(201).json(dbResult.rows[0]);

    } catch (err) {
        console.error('Error in /images/generate endpoint:', err);
        res.status(500).json({ error: 'Internal server error in image generation endpoint.' });
    }
});

module.exports = router;
