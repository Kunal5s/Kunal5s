const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config(); // To access environment variables

const INTERNAL_API_BASE_URL = process.env.INTERNAL_API_BASE_URL || 'http://localhost:3000';

// Predefined list of topics and corresponding category IDs
// In a real scenario, topics could be fetched from a database, service, or automotiveDataService.js
const topicsToGenerate = [
    { topic: "The Future of Electric Trucks", category_id: 1 }, // Assuming category 1 is 'Tech' or 'EVs'
    { topic: "Comparing the Latest Sedan Models", category_id: 4 }, // Assuming category 4 is 'Comparisons' or 'Sedans'
    { topic: "Advancements in Autonomous Driving Safety", category_id: 1 },
    { topic: "Maintenance Tips for High Mileage Cars", category_id: 5 }, // Assuming category 5 is 'Maintenance'
    { topic: "The Rise of Hydrogen Fuel Cell Vehicles", category_id: 1 },
    { topic: "Impact of New Emission Standards on Car Manufacturers", category_id: 6 } // Assuming category 6 is 'Industry News'
];
let currentTopicIndex = 0;

// --- Scheduled Task: Generate Article ---
// Runs every 10 minutes.
const articleGenerationJob = cron.schedule('*/10 * * * *', async () => {
    console.log(`[Scheduler] Running article generation job at ${new Date().toISOString()}`);

    if (!INTERNAL_API_BASE_URL) {
        console.error('[Scheduler] INTERNAL_API_BASE_URL is not defined. Skipping article generation.');
        return;
    }

    // Pick a topic from the predefined list sequentially
    const selectedTopicData = topicsToGenerate[currentTopicIndex];
    currentTopicIndex = (currentTopicIndex + 1) % topicsToGenerate.length; // Move to next topic, loop around

    const { topic, category_id } = selectedTopicData;
    const author = "Automated Content Bot"; // Or fetch dynamically if needed

    try {
        console.log(`[Scheduler] Requesting article generation for topic: "${topic}", category_id: ${category_id}`);
        
        // Call the internal API to generate an article
        // IMPORTANT: Ensure GEMINI_API_KEY is available in the environment where app.js runs,
        // otherwise this will use the mocked Gemini service.
        const articleResponse = await axios.post(`${INTERNAL_API_BASE_URL}/api/articles/generate`, {
            topic: topic,
            category_id: category_id,
            author: author,
            // use_mock: !process.env.GEMINI_API_KEY // Optionally force mock if Gemini key isn't there
        });

        if (articleResponse.status === 201 && articleResponse.data) {
            const generatedArticle = articleResponse.data;
            console.log(`[Scheduler] Successfully generated article: ID ${generatedArticle.id}, Title: "${generatedArticle.title}"`);

            // --- Optional: Trigger Image Generation ---
            // This part is optional and depends on whether an image is always desired.
            // It also assumes the image generator API key is available.
            if (process.env.API_NINJAS_KEY) { // Check if image generation capability might be present
                const imagePrompt = `A compelling visual for an article titled: "${generatedArticle.title.substring(0,150)}"`; // Create prompt from headline
                console.log(`[Scheduler] Requesting image generation for article ID ${generatedArticle.id} with prompt: "${imagePrompt}"`);
                try {
                    const imageResponse = await axios.post(`${INTERNAL_API_BASE_URL}/api/images/generate`, {
                        prompt: imagePrompt,
                        // use_mock: !process.env.API_NINJAS_KEY // Optionally force mock
                    });

                    if (imageResponse.status === 201 && imageResponse.data) {
                        const generatedImage = imageResponse.data;
                        console.log(`[Scheduler] Successfully generated image: ID ${generatedImage.id}, URL: ${generatedImage.url} for article ID ${generatedArticle.id}`);
                        // Here you might want to update the article with this image_id.
                        // This would require another API endpoint (e.g., PUT /api/articles/:id/update-image)
                        // For now, we just log it.
                        console.log(`[Scheduler] TODO: Update article ${generatedArticle.id} with image_id ${generatedImage.id}`);
                    } else {
                        console.warn(`[Scheduler] Image generation for article ID ${generatedArticle.id} returned status ${imageResponse.status}. Data:`, imageResponse.data);
                    }
                } catch (imgError) {
                    const errorMsg = imgError.response ? JSON.stringify(imgError.response.data) : imgError.message;
                    console.error(`[Scheduler] Error calling image generation API for article ID ${generatedArticle.id}: ${errorMsg}`);
                }
            } else {
                console.log(`[Scheduler] Skipping image generation as API_NINJAS_KEY is not set.`);
            }
            // --- End Optional Image Generation ---

        } else {
            console.warn(`[Scheduler] Article generation for topic "${topic}" returned status ${articleResponse.status}. Data:`, articleResponse.data);
        }
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`[Scheduler] Error calling article generation API for topic "${topic}": ${errorMsg}`);
    }
}, {
    scheduled: false, // Don't start automatically, will be started in app.js
    timezone: "Etc/UTC" // Use UTC for consistency
});

const startSchedulers = () => {
    console.log('[Scheduler] Starting scheduled tasks...');
    articleGenerationJob.start();
    // Add other jobs here if any: otherJob.start();
    console.log('[Scheduler] Article generation job scheduled to run every 10 minutes.');
};

module.exports = { startSchedulers };
