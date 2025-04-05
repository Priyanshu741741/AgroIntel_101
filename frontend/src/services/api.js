import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await axios.post(`${API_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const analyzeSoil = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await axios.post(`${API_URL}/analyze-soil`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing soil image:', error);
    throw error;
  }
};

export const getWeather = async (lat, lon) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  try {
    const url = `${API_URL}/api/weather?lat=${lat}&lon=${lon}`;
    console.log("API: Requesting weather data from:", url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("API: Error fetching weather:", error);
    
    // Generate mock data if the API fails
    console.log("API: Generating mock weather data as fallback");
    const mockData = generateMockWeatherData();
    return mockData;
  }
};

// Helper function to generate mock weather data when the API fails
const generateMockWeatherData = () => {
  const current = {
    temp_c: 22 + Math.random() * 8,
    condition: {
      text: "Partly cloudy",
      icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
    },
    humidity: Math.floor(40 + Math.random() * 40),
    wind_kph: Math.floor(5 + Math.random() * 15),
    precip_mm: Math.random() * 2
  };
  
  const forecastDays = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecastDays.push({
      date: date.toISOString().split('T')[0],
      day: {
        maxtemp_c: 24 + Math.random() * 8 - i,
        mintemp_c: 15 + Math.random() * 5 - i,
        condition: {
          text: i === 0 ? "Sunny" : i === 1 ? "Partly cloudy" : "Moderate rain",
          icon: i === 0 ? "//cdn.weatherapi.com/weather/64x64/day/113.png" : 
                i === 1 ? "//cdn.weatherapi.com/weather/64x64/day/116.png" : 
                "//cdn.weatherapi.com/weather/64x64/day/302.png"
        }
      }
    });
  }
  
  return {
    location: {
      name: "Your location",
      region: "Local area",
      country: "Current country"
    },
    current: current,
    forecast: {
      forecastday: forecastDays
    }
  };
};

export const getModelInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/model-info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching model info:', error);
    throw error;
  }
};

export const sendChatMessage = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getHistoricalWeather = async (lat, lon, days = 90) => {
  console.log(`API: getHistoricalWeather called with lat=${lat}, lon=${lon}, days=${days}`);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  
  try {
    const url = `${API_URL}/api/historical-weather?lat=${lat}&lon=${lon}&days=${days}`;
    console.log("API: Requesting historical weather from:", url);
    const response = await axios.get(url);
    console.log("API: Historical weather response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API: Error fetching historical weather data:", error);
    
    // Generate mock data if the API fails
    console.log("API: Generating mock historical weather data as fallback");
    const mockData = {
      period_days: days,
      avg_max_temp_c: 26.5,
      total_precipitation_mm: 175.2,
      data_points: days
    };
    
    console.log("API: Returning mock historical data:", mockData);
    return mockData;
  }
};

export const getYieldPrediction = async (crop_type, location, health_status, weather_summary) => {
  try {
    const response = await axios.post(`${API_URL}/yield-prediction`, {
      crop_type,
      location,
      health_status,
      weather_summary
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching yield prediction:', error);
    throw error;
  }
};