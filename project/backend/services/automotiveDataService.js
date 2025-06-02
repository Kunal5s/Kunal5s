// automotiveDataService.js

// This service is responsible for fetching data from external automotive APIs.
// For now, it provides mocked implementations.

// require('dotenv').config(); // Uncomment if you run this file directly for testing.
// In the main app (app.js), dotenv should be configured once.

/**
 * ------------------------------------------------------------------------------------
 * API Documentation and Mocked Data Structure
 * ------------------------------------------------------------------------------------
 *
 * 1. NHTSA vPIC (Vehicle Product Information Catalog) API
 *    - URL: https://vpic.nhtsa.dot.gov/api/
 *    - Description: Provides detailed information about vehicle makes, models, specifications,
 *                   safety ratings, and recalls, primarily for the US market.
 *    - Authentication: Generally, no API key required for public GET requests. Rate limits apply.
 *    - Chosen for: Vehicle specifications.
 *    - Mocked Data Structure (for fetching model specs by make and model):
 *      {
 *        make: "Honda",
 *        model: "Civic",
 *        year: 2023,
 *        specs: {
 *          engine: "1.5L Turbocharged I4",
 *          horsepower: 180,
 *          torque_lb_ft: 177,
 *          transmission: "CVT",
 *          fuel_economy_mpg: "31 city / 40 highway",
 *          safety_rating_overall: "5 Stars (NHTSA)" // Example
 *        },
 *        source: "NHTSA vPIC API (Mocked)"
 *      }
 *
 * 2. API Ninjas - News API
 *    - URL: https://api-ninjas.com/api/news
 *    - Description: Provides access to news articles from various sources worldwide.
 *                   Can be filtered by keywords to get automotive-specific news.
 *    - Authentication: Requires an API key (X-Api-Key header). Free tier available with limits.
 *    - API Key Env Variable: API_NINJAS_KEY
 *    - Chosen for: Automotive industry news.
 *    - Mocked Data Structure (for fetching automotive news):
 *      [
 *        {
 *          title: "Major Carmaker Unveils New EV Lineup",
 *          source_name: "Automotive News Today (Mocked)",
 *          url: "https://example.com/news/new-ev-lineup",
 *          published_at: "2023-10-27T10:00:00Z",
 *          summary: "A leading automotive manufacturer has just announced its next generation of electric vehicles...",
 *          keywords: ["EV", "new model", "electric vehicle"]
 *        },
 *        {
 *          title: "Self-Driving Technology Reaches New Milestone",
 *          source_name: "Tech Auto Insights (Mocked)",
 *          url: "https://example.com/news/self-driving-milestone",
 *          published_at: "2023-10-26T14:30:00Z",
 *          summary: "Recent advancements in autonomous driving technology are paving the way for safer roads...",
 *          keywords: ["self-driving", "autonomous", "technology"]
 *        }
 *      ]
 * ------------------------------------------------------------------------------------
 */

// const API_NINJAS_KEY = process.env.API_NINJAS_KEY;

/**
 * Fetches vehicle specifications for a given make and model.
 * (Mocked Implementation)
 * @param {string} make The vehicle make (e.g., "Toyota").
 * @param {string} model The vehicle model (e.g., "Camry").
 * @param {number} [year] Optional: The model year.
 * @returns {Promise<object|null>} A promise that resolves to vehicle specs or null if not found.
 */
const getVehicleSpecs = async (make, model, year) => {
    console.log(`[AutomotiveService] Mocking fetch for specs: ${year || ''} ${make} ${model}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Example mocked data - a real implementation would query the NHTSA API
    // e.g., using their "GetModelsForMake" and then "GetVehicleVariablesList" or similar
    if (make && model) {
        const currentYear = year || new Date().getFullYear();
        // Simple mock - return data for a few known models
        if (make.toLowerCase() === 'honda' && model.toLowerCase() === 'civic') {
            return {
                make: "Honda",
                model: "Civic",
                year: currentYear,
                specs: {
                    engine: "1.5L Turbocharged I4 / 2.0L I4",
                    horsepower: "158-180",
                    torque_lb_ft: "138-177",
                    transmission: "CVT or 6-Speed Manual",
                    fuel_economy_mpg: "Up to 33 city / 42 highway",
                    safety_rating_overall: "5 Stars (NHTSA Mock)"
                },
                source: "NHTSA vPIC API (Mocked)"
            };
        } else if (make.toLowerCase() === 'toyota' && model.toLowerCase() === 'corolla') {
             return {
                make: "Toyota",
                model: "Corolla",
                year: currentYear,
                specs: {
                    engine: "1.8L I4 / 2.0L I4",
                    horsepower: "139-169",
                    torque_lb_ft: "126-151",
                    transmission: "CVT",
                    fuel_economy_mpg: "Up to 32 city / 41 highway",
                    safety_rating_overall: "5 Stars (NHTSA Mock)"
                },
                source: "NHTSA vPIC API (Mocked)"
            };
        }
    }
    return null; // Not found
};

/**
 * Fetches recent automotive news.
 * (Mocked Implementation)
 * @param {object} options Optional parameters for fetching news (e.g., keywords, limit).
 * @param {string[]} [options.keywords=["automotive", "cars"]] Keywords to search for.
 * @param {number} [options.limit=5] Number of articles to return.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of news articles.
 */
const getAutomotiveNews = async (options = {}) => {
    const { keywords = ["automotive", "cars"], limit = 3 } = options;
    console.log(`[AutomotiveService] Mocking fetch for news with keywords: "${keywords.join(', ')}", limit: ${limit}`);
    
    // if (!API_NINJAS_KEY && process.env.NODE_ENV !== 'test') {
    //     console.warn("[AutomotiveService] API_NINJAS_KEY is not set. Returning empty news array.");
    //     // In a real scenario, you might throw an error or return a specific status
    //     // For mock, we can still return mock data, but log a warning.
    // }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Example mocked news data
    const allMockNews = [
        {
            title: "Revolutionary Battery Tech Promises 1000-Mile EV Range",
            source_name: "Future Auto News (Mocked)",
            url: "https://example.com/news/battery-tech-1000-mile",
            published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            summary: "A startup has unveiled a new battery technology that could significantly extend the range of electric vehicles.",
            keywords: ["EV", "battery", "technology"]
        },
        {
            title: "Global Chip Shortage Easing for Automakers",
            source_name: "Industry Times (Mocked)",
            url: "https://example.com/news/chip-shortage-easing",
            published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            summary: "The persistent global semiconductor shortage shows signs of improvement, offering relief to car manufacturers.",
            keywords: ["semiconductor", "manufacturing", "industry"]
        },
        {
            title: "The Rise of Subscription Features in Cars",
            source_name: "Consumer Auto Reports (Mocked)",
            url: "https://example.com/news/car-subscriptions",
            published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            summary: "More car companies are introducing subscription-based access to vehicle features like heated seats and performance upgrades.",
            keywords: ["subscription", "features", "consumer"]
        },
        {
            title: "Classic Car Market Sees Record Prices",
            source_name: "Vintage Wheels Weekly (Mocked)",
            url: "https://example.com/news/classic-car-prices",
            published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
            summary: "The market for classic and collector cars continues to boom, with several models fetching record auction prices.",
            keywords: ["classic cars", "auction", "market"]
        },
        {
            title: "New Autonomous Trucking Corridor Approved",
            source_name: "Logistics & Transport Journal (Mocked)",
            url: "https://example.com/news/autonomous-trucking",
            published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            summary: "Regulators have approved a new corridor for testing and deploying autonomous trucks, aiming to improve logistics.",
            keywords: ["autonomous", "trucking", "logistics"]
        }
    ];
    
    // Simple keyword filtering for the mock
    const filteredNews = allMockNews.filter(news => 
        keywords.some(kw => news.keywords.includes(kw) || news.title.toLowerCase().includes(kw) || news.summary.toLowerCase().includes(kw))
    );

    return filteredNews.slice(0, limit);
};

module.exports = {
    getVehicleSpecs,
    getAutomotiveNews,
};
