const axios = require('axios');

// Initialize Claude API (Sonnet 3.5)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;  // Ensure your Claude API key is loaded

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'], // This is the default and can be omitted
});

// Generate blog using Claude
exports.generateBlog = async (req, res) => {
    try {
        // Sample trip data (can be replaced with actual data from your plan model)
        const trip = {
            "user_id": "64a0c9f5d2e7890017a1e654",
            "destination": "Paris, France",
            "notable_events": [
                "Eiffel Tower visit",
                "Louvre Museum tour",
                "Seine River cruise",
                "Montmartre walk"
            ],
            "hotels": [
                "Hôtel Ritz Paris",
                "Hotel Le Meurice"
            ],
            "restaurants": [
                "Le Jules Verne",
                "L'Ambroisie"
            ],
            "meals": [
                "Dinner at Le Jules Verne",
                "Lunch at L'Ambroisie"
            ],
            "passengers": 2,
            "budget": 4500,
            "start_date": "2024-06-15",
            "end_date": "2024-06-21"
        };

        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        // Prepare the prompt for Claude Sonnet 3.5
        const prompt = `
            Write a travel blog for a trip to ${trip.destination} from ${trip.start_date} to ${trip.end_date}.
            The traveler stayed at ${trip.hotels.join(', ')} and visited ${trip.restaurants.join(', ')}.
            Notable events include ${trip.notable_events.join(', ')}. 
            The trip had ${trip.passengers} passengers and a budget of ${trip.budget}.
        `;

        const response = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
          });

        // Extract the blog content from the API response
        const blogContent = response.content;

        // Send response with generated blog content
        res.status(200).json({ message: 'Blog generated successfully', blogContent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};