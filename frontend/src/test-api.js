// Simple test script to verify API is working
const axios = require('axios');

// Use the test server port
const API_URL = 'http://localhost:5001/api';

async function testHistoricalWeather() {
  console.log('Testing historical weather API...');
  try {
    // Use fixed coordinates for testing
    const lat = 40.7128;
    const lon = -74.0060;
    console.log(`Requesting data for lat=${lat}, lon=${lon}`);
    
    const response = await axios.get(`${API_URL}/historical-weather`, {
      params: { lat, lon }
    });
    
    console.log('API response status:', response.status);
    console.log('API response data:', JSON.stringify(response.data, null, 2));
    console.log('Test successful!');
  } catch (error) {
    console.error('API Test Failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  }
}

// Run the test
testHistoricalWeather(); 