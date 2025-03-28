import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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

export const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_URL}/weather`, {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
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