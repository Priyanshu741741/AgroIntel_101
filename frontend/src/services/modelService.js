import * as tf from '@tensorflow/tfjs';

class ModelService {
  constructor() {
    this.model = null;
    this.classIndices = null;
    this.healthCategories = null;
  }

  async loadModel() {
    try {
      // Load the model
      this.model = await tf.loadLayersModel('/models/crop_health_model/model.json');
      
      // Load class indices and health categories
      const classIndicesResponse = await fetch('/models/crop_health_model/class_indices.json');
      const healthCategoriesResponse = await fetch('/models/crop_health_model/health_categories.json');
      
      this.classIndices = await classIndicesResponse.json();
      this.healthCategories = await healthCategoriesResponse.json();
      
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  async preprocessImage(imageElement) {
    // Convert the image to a tensor and preprocess it
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224]) // Resize to model's expected size
      .toFloat()
      .expandDims();
    
    // Normalize the image
    return tensor.div(255.0);
  }

  async predictDisease(imageElement) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      // Preprocess the image
      const tensor = await this.preprocessImage(imageElement);
      
      // Get prediction
      const predictions = await this.model.predict(tensor).data();
      
      // Get the index with highest probability
      const maxProbability = Math.max(...predictions);
      const predictedIndex = predictions.indexOf(maxProbability);
      
      // Get the predicted class name
      const predictedClass = Object.keys(this.classIndices)
        .find(key => this.classIndices[key] === predictedIndex);
      
      // Determine health category
      const healthCategory = Object.keys(this.healthCategories)
        .find(category => this.healthCategories[category].includes(predictedClass));
      
      // Clean up tensor
      tensor.dispose();
      
      return {
        class: predictedClass,
        probability: maxProbability,
        healthCategory,
        type: predictedClass.toLowerCase().replace(' ', '_')
      };
    } catch (error) {
      console.error('Error during prediction:', error);
      throw error;
    }
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
  }
}

// Create a singleton instance
const modelService = new ModelService();
export default modelService;