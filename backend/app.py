# Add this at the top of your app.py file before any other imports
import os
# Suppress gRPC shutdown warnings
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '0'
os.environ['GRPC_POLL_STRATEGY'] = 'epoll1'

import json
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from PIL import Image
import requests
from dotenv import load_dotenv
import traceback
from pathlib import Path

# Add these imports for the chatbot
try:
    from gemini_chatbot import chatbot as gemini_chatbot
    from simple_chatbot import simple_chatbot
    CHATBOT_ENABLED = True
except ImportError as e:
    print(f"Warning: Chatbot modules not available: {e}")
    CHATBOT_ENABLED = False

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Model paths
CROP_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "crop_health_model")
SOIL_MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "soil_classification_model")

# Check if model exists, if not, we'll load it on demand
model = None
class_indices = None
health_categories = {
    "healthy": ["healthy"],
    "diseased": ["diseased"],
    "nutrient_deficient": ["nutrient-deficient"]
}

# Basic recommendations based on plant health
recommendations = {
    "healthy": {
        "care": "Continue with regular watering and maintenance.",
        "watering": "Water as needed based on soil moisture.",
        "issues": "No issues detected."
    },
    "diseased": {
        "care": "Consider removing affected leaves and applying appropriate fungicide or treatment.",
        "watering": "Avoid overhead watering to prevent spread of disease.",
        "issues": "Disease detected. Monitor closely for spread."
    },
    "nutrient_deficient": {
        "care": "Apply balanced fertilizer appropriate for your crop type.",
        "watering": "Ensure proper watering to help nutrient absorption.",
        "issues": "Nutrient deficiency detected. Check soil pH and nutrient levels."
    }
}

def load_model_if_needed():
    """Load the TensorFlow model and class mappings if not already loaded"""
    global model, class_indices, health_categories
    
    if model is None:
        if not os.path.exists(CROP_MODEL_PATH):
            return False, "Model not found. Please train the model first."
        
        try:
            print(f"Loading model from {CROP_MODEL_PATH}")
            model = tf.keras.models.load_model(CROP_MODEL_PATH)
            
            # Load class indices
            class_indices_path = os.path.join(CROP_MODEL_PATH, "class_indices.json")
            if os.path.exists(class_indices_path):
                with open(class_indices_path, "r") as f:
                    class_indices = json.load(f)
            else:
                return False, "Class indices file not found."
            
            # Load health categories if available
            health_categories_path = os.path.join(CROP_MODEL_PATH, "health_categories.json")
            if os.path.exists(health_categories_path):
                with open(health_categories_path, "r") as f:
                    health_categories = json.load(f)
                
            return True, "Model loaded successfully"
        except Exception as e:
            return False, f"Error loading model: {str(e)}"
    
    return True, "Model already loaded"

# Global variables for soil model caching
soil_model = None
soil_classes = None
soil_characteristics = None

def load_soil_model_if_needed():
    """Load the soil classification model and related data if not already loaded"""
    global soil_model, soil_classes, soil_characteristics
    
    if soil_model is None:
        if not os.path.exists(SOIL_MODEL_PATH):
            return False, "Soil classification model not found. Please train the model first."
        
        try:
            print(f"Loading soil model from {SOIL_MODEL_PATH}")
            soil_model = tf.keras.models.load_model(SOIL_MODEL_PATH)
            
            # Load class indices and characteristics
            soil_classes_path = os.path.join(SOIL_MODEL_PATH, "soil_class_indices.json")
            soil_characteristics_path = os.path.join(SOIL_MODEL_PATH, "soil_characteristics.json")
            
            if not os.path.exists(soil_classes_path):
                return False, "Soil class indices file not found."
                
            if not os.path.exists(soil_characteristics_path):
                return False, "Soil characteristics file not found."
            
            with open(soil_classes_path) as f:
                soil_classes = json.load(f)
            
            with open(soil_characteristics_path) as f:
                soil_characteristics = json.load(f)
            
            return True, "Soil model and data loaded successfully"
        except Exception as e:
            return False, f"Error loading soil model: {str(e)}"
    
    return True, "Soil model already loaded"

@app.route('/api/analyze-soil', methods=['POST'])
def analyze_soil():
    # Load model if needed
    success, message = load_soil_model_if_needed()
    if not success:
        return jsonify({'error': message}), 500
    
    try:
        
        # Since we've already loaded the model and data, we can proceed directly
        if soil_classes is None or soil_characteristics is None:
            return jsonify({'error': 'Model data not properly initialized'}), 500

        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        # Load and preprocess image
        image_file = request.files['image']
        
        # Validate file format
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        if not image_file.filename or '.' not in image_file.filename or \
           image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'Invalid image format. Allowed formats: PNG, JPG, JPEG'}), 400
        
        img = Image.open(image_file.stream).convert('RGB')
        
        # Validate image dimensions
        if img.size[0] < 50 or img.size[1] < 50:
            return jsonify({'error': 'Image dimensions too small. Minimum size: 50x50 pixels'}), 400
        
        # Preprocess image
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Make prediction
        print("Making soil prediction...")
        predictions = soil_model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        # Get class name and characteristics
        class_name = next((k for k, v in soil_classes.items() if v == predicted_class_idx), None)
        if not class_name:
            return jsonify({'error': f'Could not find class name for index {predicted_class_idx}'}), 500
            
        # Get characteristics and recommendations from the soil_characteristics.json file
        soil_info = soil_characteristics.get(class_name, {})
        characteristics = soil_info.get('characteristics', [])
        recommendations = soil_info.get('recommendations', [
            f"Apply {class_name}-specific fertilizer",
            "Maintain proper irrigation schedule",
            "Monitor soil pH levels regularly"
        ])

        print(f"Soil analysis complete. Identified as {class_name} with {confidence:.2f} confidence")
        return jsonify({
            'class': class_name,
            'confidence': confidence,
            'characteristics': characteristics,
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Error in soil analysis: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_crop():
    success, message = load_model_if_needed()
    if not success:
        return jsonify({'error': message}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        # Load and preprocess image
        image_file = request.files['image']
        
        # Validate file format
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        if not image_file.filename or '.' not in image_file.filename or \
           image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'Invalid image format. Allowed formats: PNG, JPG, JPEG'}), 400
        
        img = Image.open(image_file.stream).convert('RGB')
        
        # Validate image dimensions
        if img.size[0] < 50 or img.size[1] < 50:
            return jsonify({'error': 'Image dimensions too small. Minimum size: 50x50 pixels'}), 400
        
        # Preprocess image
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Make prediction
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        # Get class name
        predicted_class = next(k for k, v in class_indices.items() if v == predicted_class_idx)
        
        # Determine health category
        health_category = None
        for category, classes in health_categories.items():
            if any(cls in predicted_class.lower() for cls in classes):
                health_category = category
                break
        
        if not health_category:
            health_category = 'unknown'
        
        # Get recommendations
        category_recommendations = recommendations.get(health_category, recommendations['healthy'])
        
        return jsonify({
            'class': predicted_class,
            'confidence': confidence,
            'health_category': health_category,
            'recommendations': category_recommendations
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    api_key = os.getenv('OPENWEATHERMAP_API_KEY')
    if not api_key:
        return jsonify({'error': 'Weather API key not configured'}), 500
    
    try:
        # Get current weather
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        current_weather = response.json()
        
        if 'cod' in current_weather and current_weather['cod'] != 200:
            return jsonify({'error': current_weather['message']}), 400
        
        # Get 5-day forecast
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        forecast_response = requests.get(forecast_url)
        forecast = forecast_response.json()
        
        if 'cod' in forecast and forecast['cod'] != '200':
            return jsonify({'error': forecast['message']}), 400
        
        # Process and simplify the forecast data
        simplified_forecast = []
        processed_dates = set()
        
        for item in forecast['list']:
            # Extract date without time
            date_only = item['dt_txt'].split(' ')[0]
            
            # Skip if we already have this date
            if date_only in processed_dates:
                continue
            
            # Add to processed dates
            processed_dates.add(date_only)
            
            # Format date to day name (e.g., "Monday")
            from datetime import datetime
            date_obj = datetime.strptime(item['dt_txt'], '%Y-%m-%d %H:%M:%S')
            day_name = date_obj.strftime('%A')
            
            simplified_forecast.append({
                'date': day_name,
                'temp': item['main']['temp'],
                'description': item['weather'][0]['description'],
                'humidity': item['main']['humidity'],
                'wind_speed': item['wind']['speed']
            })
            
            # Limit to 5 days
            if len(simplified_forecast) >= 5:
                break
        
        return jsonify({
            'current': {
                'temp': current_weather['main']['temp'],
                'humidity': current_weather['main']['humidity'],
                'description': current_weather['weather'][0]['description'],
                'wind_speed': current_weather['wind']['speed']
            },
            'forecast': simplified_forecast
        })
    
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'chatbot': 'enabled' if CHATBOT_ENABLED else 'disabled',
        'model': 'loaded' if model is not None else 'not loaded'
    })

@app.route('/api/model-info', methods=['GET'])
def model_info():
    success, message = load_model_if_needed()
    if not success:
        return jsonify({'error': message}), 500
    
    # Get information about the model and available classes
    return jsonify({
        'status': 'success',
        'num_classes': len(class_indices),
        'classes': list(class_indices.keys()),
        'health_categories': health_categories
    })

@app.route('/api/chat', methods=['POST'])
def chat_api():
    try:
        if not CHATBOT_ENABLED:
            simple_response = simple_chatbot.get_response(request.json.get('message', ''))
            return jsonify({
                'response': simple_response,
                'source': 'simple-chatbot'
            })
            
        # Try to use Gemini chatbot if available
        response_data = gemini_chatbot.get_response(request.json.get('message', ''))
        return jsonify(response_data)
        
    except Exception as e:
        traceback.print_exc()
        # Fallback to simple chatbot if Gemini fails
        try:
            simple_response = simple_chatbot.get_response(request.json.get('message', ''))
            return jsonify({
                'response': simple_response,
                'source': 'simple-chatbot'
            })
        except:
            return jsonify({
                'response': f"I'm sorry, I encountered an error: {str(e)}",
                'source': 'error'
            }), 500

if __name__ == '__main__':
    # Create model directory if it doesn't exist
    Path(CROP_MODEL_PATH).mkdir(parents=True, exist_ok=True)
    
    # Check if model is available
    model_available = os.path.exists(CROP_MODEL_PATH) and any(os.listdir(CROP_MODEL_PATH))
    if not model_available:
        print("Warning: Model not found. Please train the model before using the analyze endpoint.")
    
    # Check if chatbot is available
    if CHATBOT_ENABLED:
        print("Chatbot functionality is enabled.")
    else:
        print("Warning: Chatbot functionality is disabled due to missing modules.")
    
    print("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000)