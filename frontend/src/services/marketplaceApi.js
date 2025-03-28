import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const marketplaceApi = {
  // Get all suppliers
  getSuppliers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/marketplace/suppliers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  // Get suppliers by location
  getSuppliersByLocation: async (lat, lng, radius = 50) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/marketplace/suppliers/nearby`,
        {
          params: { lat, lng, radius }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby suppliers:', error);
      throw error;
    }
  },

  // Get supplier details
  getSupplierDetails: async (supplierId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/marketplace/suppliers/${supplierId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      throw error;
    }
  },

  // Submit supplier rating
  submitRating: async (supplierId, rating, review) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/marketplace/ratings`,
        {
          supplierId,
          rating,
          review
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  },

  // Mock payment processing
  processPayment: async (orderId, paymentDetails) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/marketplace/payment/process`,
        {
          orderId,
          ...paymentDetails
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
};