/**
 * AgroIntel Backend API - Firebase Cloud Functions
 * This file implements the backend API endpoints using Firebase Cloud Functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Initialize Express app
const app = express();

// Configure CORS - allow requests from our frontend domain
app.use(cors({
  origin: [
    "https://agrointel-5089b.web.app",
    "https://agrointel-5089b.firebaseapp.com",
    "http://localhost:3000" // For local development
  ]
}));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Health check endpoint
app.get("/health", (req, res) => {
  logger.info("Health check endpoint called");
  res.json({ status: "ok", message: "Server is running" });
});

// Weather API endpoint
app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;
  
  logger.info(`Weather API called with coordinates: lat=${lat}, lon=${lon}`);
  
  if (!lat || !lon) {
    logger.error("Missing latitude or longitude parameters");
    return res.status(400).json({ error: "Latitude and longitude required" });
  }
  
  // Use OpenWeatherMap API key
  const apiKey = "0ed298208193505d5deb394d1ab181bd";
  
  try {
    // Get current weather from OpenWeatherMap
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    logger.info(`Requesting current weather from: ${currentUrl}`);
    const currentResponse = await axios.get(currentUrl);
    logger.info(`Current weather API response status: ${currentResponse.status}`);
    const currentData = currentResponse.data;
    
    if ('cod' in currentData && currentData.cod !== 200) {
      const errorMsg = currentData.message || 'Error fetching weather data';
      logger.error(`OpenWeatherMap current weather API error: ${errorMsg}`);
      return res.status(400).json({ error: errorMsg });
    }
    
    // Get forecast from OpenWeatherMap
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    logger.info(`Requesting forecast from: ${forecastUrl}`);
    const forecastResponse = await axios.get(forecastUrl);
    logger.info(`Forecast API response status: ${forecastResponse.status}`);
    const forecastData = forecastResponse.data;
    
    if ('cod' in forecastData && forecastData.cod !== '200') {
      const errorMsg = forecastData.message || 'Error fetching forecast data';
      logger.error(`OpenWeatherMap forecast API error: ${errorMsg}`);
      return res.status(400).json({ error: errorMsg });
    }
    
    // Convert OpenWeatherMap data to the format expected by our frontend
    // Extract city name, country code from response
    const locationName = currentData.name || 'Unknown Location';
    const countryCode = currentData.sys?.country || '';
    
    // Create formatted response
    const formattedResponse = {
      "location": {
        "name": locationName,
        "country": countryCode,
        "region": "",
        "lat": parseFloat(lat),
        "lon": parseFloat(lon),
        "localtime": new Date().toISOString().replace('T', ' ').substring(0, 16)
      },
      "current": {
        "temp_c": currentData.main?.temp,
        "condition": {
          "text": currentData.weather?.[0]?.description || 'Unknown',
          "icon": `https://openweathermap.org/img/wn/${currentData.weather?.[0]?.icon || '01d'}@2x.png`,
          "code": currentData.weather?.[0]?.id || 800
        },
        "wind_kph": (currentData.wind?.speed || 0) * 3.6,  // Convert m/s to km/h
        "humidity": currentData.main?.humidity || 0,
        "feelslike_c": currentData.main?.feels_like,
        "uv": 0,  // OpenWeatherMap doesn't provide UV in the basic API
      },
      "forecast": {
        "forecastday": []
      }
    };
    
    // Process forecast data - extract one forecast per day
    const processedDates = new Set();
    for (const item of forecastData.list || []) {
      // Get date from the forecast timestamp
      const forecastDate = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      // Skip if we already have this date
      if (processedDates.has(forecastDate)) {
        continue;
      }
      
      processedDates.add(forecastDate);
      
      // Create a forecast day entry
      const dayForecast = {
        "date": forecastDate,
        "day": {
          "maxtemp_c": item.main?.temp_max,
          "mintemp_c": item.main?.temp_min,
          "condition": {
            "text": item.weather?.[0]?.description || 'Unknown',
            "icon": `https://openweathermap.org/img/wn/${item.weather?.[0]?.icon || '01d'}@2x.png`,
            "code": item.weather?.[0]?.id || 800
          }
        }
      };
      
      formattedResponse.forecast.forecastday.push(dayForecast);
      
      // Limit to 3 days as in the frontend
      if (formattedResponse.forecast.forecastday.length >= 3) {
        break;
      }
    }
    
    res.json(formattedResponse);
  } catch (error) {
    logger.error(`Error fetching weather data: ${error.message}`);
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Historical weather endpoint (mock implementation)
app.get("/historical-weather", (req, res) => {
  const { lat, lon } = req.query;
  const days = parseInt(req.query.days || 90); // Default to last 90 days

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  logger.info(`Historical Weather API: Fetching data for lat=${lat}, lon=${lon}, days=${days}`);

  // Generate plausible mock data for the last 'days' days
  const historicalData = [];
  const endDate = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulate daily temperature range and precipitation
    const tempMax = Math.round((22 + Math.random() * 8 - (i / days * 10)) * 10) / 10; // Cooler further back
    const tempMin = Math.round((tempMax - Math.random() * 5 - 5) * 10) / 10;
    const precipitation = Math.round((Math.random() < 0.2 ? Math.random() * 15 : 0) * 10) / 10; // 20% chance of rain
    
    historicalData.push({
      "date": dateStr,
      "temp_max_c": tempMax,
      "temp_min_c": tempMin,
      "precipitation_mm": precipitation
    });
  }
  
  // Simple summary (e.g., average max temp, total precipitation)
  const avgMaxTemp = days > 0 ? Math.round(historicalData.reduce((sum, d) => sum + d.temp_max_c, 0) / days * 10) / 10 : 0;
  const totalPrecipitation = Math.round(historicalData.reduce((sum, d) => sum + d.precipitation_mm, 0) * 10) / 10;
  
  res.json({
    period_days: days,
    avg_max_temp_c: avgMaxTemp,
    total_precipitation_mm: totalPrecipitation,
    data_points: historicalData.length,
    data: historicalData
  });
});

// Simple chat endpoint
app.post("/chat", (req, res) => {
  try {
    const message = req.body.message || '';
    
    // Simple rule-based responses
    const keywords = {
      "tomato": "Tomatoes need full sun and consistent watering. Common diseases include early blight and late blight. Water at the base to avoid leaf wetness.",
      "potato": "Potatoes need well-drained soil and consistent moisture. Watch for signs of late blight which appears as dark water-soaked spots on leaves.",
      "corn": "Corn requires full sun and consistent moisture. Plant in blocks rather than rows for better pollination.",
      "disease": "Common plant diseases include powdery mildew, leaf spot, and blight. Look for discoloration, spots, or unusual growths on leaves.",
      "water": "Most crops need 1-2 inches of water per week. Water deeply and less frequently to encourage deeper root growth.",
      "fertilize": "Use balanced fertilizer for most crops. Nitrogen promotes leaf growth, phosphorus supports root and fruit development, and potassium improves overall plant health.",
      "soil": "Good soil contains organic matter, has proper drainage, and the right pH for your crops. Most vegetables prefer slightly acidic soil with pH 6.0-6.8.",
      "pest": "Common garden pests include aphids, caterpillars, and beetles. Inspect plants regularly and consider companion planting to deter pests.",
      "care": "Basic plant care includes proper watering, adequate sunlight, appropriate fertilization, and regular monitoring for pests and diseases."
    };
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(keywords)) {
      if (message.toLowerCase().includes(keyword)) {
        return res.json({
          "response": response,
          "source": "fallback"
        });
      }
    }
    
    // Default response if no keywords match
    res.json({
      "response": "I can provide information about common crops like tomatoes, potatoes, and corn, as well as general advice about watering, fertilizing, soil care, and pest management. What would you like to know about?",
      "source": "fallback"
    });
  } catch (error) {
    logger.error(`Error in chat endpoint: ${error.message}`);
    console.error(error);
    res.status(500).json({
      "response": `I'm sorry, I encountered an error: ${error.message}`,
      "source": "error"
    });
  }
});

// Mount the Express app to the Firebase Function
exports.api = onRequest({
  cors: true,
  maxInstances: 10,
}, app);
