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
from datetime import datetime, timedelta
import random
import sys

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

# Print startup message for debugging
print("Starting Flask application...")
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"PORT environment variable: {os.environ.get('PORT', 'Not set')}")

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Add a root endpoint for basic testing
@app.route('/', methods=['GET'])
def root():
    return jsonify({"status": "AgroIntel API is running"}), 200

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
        print(f"Error loading soil model: {message}")
        return jsonify({'error': message}), 500
    
    try:
        
        # Since we've already loaded the model and data, we can proceed directly
        if soil_classes is None or soil_characteristics is None:
            print("Error: soil_classes or soil_characteristics is None")
            return jsonify({'error': 'Model data not properly initialized'}), 500

        if 'image' not in request.files:
            print("Error: No image provided in request")
            return jsonify({'error': 'No image provided'}), 400

        # Load and preprocess image
        image_file = request.files['image']
        print(f"Received soil image: {image_file.filename}")
        
        # Validate file format
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        if not image_file.filename or '.' not in image_file.filename or \
           image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            print(f"Invalid image format: {image_file.filename}")
            return jsonify({'error': 'Invalid image format. Allowed formats: PNG, JPG, JPEG'}), 400
        
        img = Image.open(image_file.stream).convert('RGB')
        print(f"Opened image with size: {img.size}")
        
        # Validate image dimensions
        if img.size[0] < 50 or img.size[1] < 50:
            print(f"Image dimensions too small: {img.size}")
            return jsonify({'error': 'Image dimensions too small. Minimum size: 50x50 pixels'}), 400
        
        # Preprocess image
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        print(f"Preprocessed image shape: {img_array.shape}")

        # Make prediction
        print("Making soil prediction...")
        predictions = soil_model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        print(f"Raw prediction results: {predictions[0]}")
        print(f"Predicted class index: {predicted_class_idx}, confidence: {confidence}")
        
        # Get class name and characteristics
        class_name = next((k for k, v in soil_classes.items() if v == predicted_class_idx), None)
        if not class_name:
            print(f"Could not find class name for index {predicted_class_idx}")
            print(f"Available soil_classes: {soil_classes}")
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
    try:
        # Validate model loading
        success, message = load_model_if_needed()
        if not success:
            print(f"Error loading crop model: {message}")
            return jsonify({'error': 'Failed to initialize analysis model. Please try again later.'}), 500
            
        # Validate model and class indices are properly loaded
        if model is None or class_indices is None:
            print("Error: Model or class indices not properly initialized")
            return jsonify({'error': 'Analysis system not properly initialized'}), 500
        
        if 'image' not in request.files:
            print("Error: No image provided in request")
            return jsonify({'error': 'No image provided'}), 400

        # Load and preprocess image
        image_file = request.files['image']
        if not image_file or not image_file.filename:
            print("Error: Empty image file received")
            return jsonify({'error': 'Please select a valid image file'}), 400

        print(f"Received crop image: {image_file.filename}")
        
        # Validate file format
        allowed_extensions = {'png', 'jpg', 'jpeg'}
        file_ext = image_file.filename.rsplit('.', 1)[1].lower() if '.' in image_file.filename else ''
        if not file_ext or file_ext not in allowed_extensions:
            print(f"Invalid image format: {image_file.filename}")
            return jsonify({'error': 'Please upload a PNG, JPG, or JPEG image'}), 400
        
        img = Image.open(image_file.stream).convert('RGB')
        print(f"Opened image with size: {img.size}")
        
        # Validate image dimensions
        if img.size[0] < 50 or img.size[1] < 50:
            print(f"Image dimensions too small: {img.size}")
            return jsonify({'error': 'Image dimensions too small. Minimum size: 50x50 pixels'}), 400
        
        # Preprocess image
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        print(f"Preprocessed image shape: {img_array.shape}")

        # Make prediction
        print("Making crop health prediction...")
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        print(f"Raw prediction results: {predictions[0]}")
        print(f"Predicted class index: {predicted_class_idx}, confidence: {confidence}")
        
        # Get class name
        try:
            predicted_class = next(k for k, v in class_indices.items() if v == predicted_class_idx)
            print(f"Predicted class: {predicted_class}")
        except StopIteration:
            print(f"Could not find class name for index {predicted_class_idx}")
            print(f"Available class_indices: {class_indices}")
            return jsonify({'error': f'Could not find class name for index {predicted_class_idx}'}), 500
        
        # Determine health category
        health_category = None
        for category, classes in health_categories.items():
            if any(cls in predicted_class.lower() for cls in classes):
                health_category = category
                break
        
        if not health_category:
            health_category = 'unknown'
            print(f"Could not determine health category for class: {predicted_class}")
        else:
            print(f"Determined health category: {health_category}")
        
        # Get recommendations
        category_recommendations = recommendations.get(health_category, recommendations['healthy'])
        
        print(f"Crop analysis complete. Class: {predicted_class}, Health: {health_category}, Confidence: {confidence:.2f}")
        return jsonify({
            'class': predicted_class,
            'confidence': confidence,
            'health_category': health_category,
            'recommendations': category_recommendations
        })

    except Exception as e:
        print(f"Error in crop analysis: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    print(f"Weather API called with coordinates: lat={lat}, lon={lon}")
    
    if not lat or not lon:
        print("Error: Missing latitude or longitude parameters")
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    # Use the user's provided OpenWeatherMap API key
    api_key = "0ed298208193505d5deb394d1ab181bd"  # User's API key
    
    try:
        # Get current weather from OpenWeatherMap
        current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        print(f"Requesting current weather from: {current_url}")
        current_response = requests.get(current_url)
        print(f"Current weather API response status: {current_response.status_code}")
        current_data = current_response.json()
        
        if 'cod' in current_data and current_data['cod'] != 200:
            error_msg = current_data.get('message', 'Error fetching weather data')
            print(f"OpenWeatherMap current weather API error: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Get forecast from OpenWeatherMap
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        print(f"Requesting forecast from: {forecast_url}")
        forecast_response = requests.get(forecast_url)
        print(f"Forecast API response status: {forecast_response.status_code}")
        forecast_data = forecast_response.json()
        
        if 'cod' in forecast_data and forecast_data['cod'] != '200':
            error_msg = forecast_data.get('message', 'Error fetching forecast data')
            print(f"OpenWeatherMap forecast API error: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Convert OpenWeatherMap data to the format expected by our frontend
        # Extract city name, country code from response
        location_name = current_data.get('name', 'Unknown Location')
        country_code = current_data.get('sys', {}).get('country', '')
        
        # Create formatted response
        formatted_response = {
            "location": {
                "name": location_name,
                "country": country_code,
                "region": "",
                "lat": float(lat),
                "lon": float(lon),
                "localtime": datetime.now().strftime("%Y-%m-%d %H:%M")
            },
            "current": {
                "temp_c": current_data.get('main', {}).get('temp'),
                "condition": {
                    "text": current_data.get('weather', [{}])[0].get('description', 'Unknown'),
                    "icon": f"https://openweathermap.org/img/wn/{current_data.get('weather', [{}])[0].get('icon', '01d')}@2x.png",
                    "code": current_data.get('weather', [{}])[0].get('id', 800)
                },
                "wind_kph": current_data.get('wind', {}).get('speed', 0) * 3.6,  # Convert m/s to km/h
                "humidity": current_data.get('main', {}).get('humidity', 0),
                "feelslike_c": current_data.get('main', {}).get('feels_like'),
                "uv": 0,  # OpenWeatherMap doesn't provide UV in the basic API
            },
            "forecast": {
                "forecastday": []
            }
        }
        
        # Process forecast data - extract one forecast per day
        processed_dates = set()
        for item in forecast_data.get('list', []):
            # Get date from the forecast timestamp
            forecast_date = datetime.fromtimestamp(item.get('dt', 0)).strftime("%Y-%m-%d")
            
            # Skip if we already have this date
            if forecast_date in processed_dates:
                continue
            
            processed_dates.add(forecast_date)
            
            # Create a forecast day entry
            day_forecast = {
                "date": forecast_date,
                "day": {
                    "maxtemp_c": item.get('main', {}).get('temp_max'),
                    "mintemp_c": item.get('main', {}).get('temp_min'),
                    "condition": {
                        "text": item.get('weather', [{}])[0].get('description', 'Unknown'),
                        "icon": f"https://openweathermap.org/img/wn/{item.get('weather', [{}])[0].get('icon', '01d')}@2x.png",
                        "code": item.get('weather', [{}])[0].get('id', 800)
                    }
                }
            }
            
            formatted_response["forecast"]["forecastday"].append(day_forecast)
            
            # Limit to 3 days as in the frontend
            if len(formatted_response["forecast"]["forecastday"]) >= 3:
                break
        
        return jsonify(formatted_response)
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

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

@app.route('/api/historical-weather', methods=['GET'])
def get_historical_weather():
    """Get historical weather data for a location"""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    days = int(request.args.get('days', 90)) # Default to last 90 days

    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude required'}), 400

    print(f"*** Historical Weather API: Fetching data for lat={lat}, lon={lon}, days={days} ***")

    # --- Mock Implementation ---
    # In a real app, fetch data from a historical weather API
    # For now, generate plausible mock data for the last 'days' days
    historical_data = []
    end_date = datetime.now()
    for i in range(days):
        date = (end_date - timedelta(days=i)).strftime("%Y-%m-%d")
        # Simulate daily temperature range and precipitation
        temp_max = round(random.uniform(20, 35) - (i / days * 10), 1) # Cooler further back
        temp_min = round(temp_max - random.uniform(5, 10), 1)
        precipitation = round(random.uniform(0, 15) if random.random() < 0.2 else 0, 1) # 20% chance of rain
        historical_data.append({
            "date": date,
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "precipitation_mm": precipitation
        })
    
    # Simple summary (e.g., average max temp, total precipitation)
    avg_max_temp = round(sum(d['temp_max_c'] for d in historical_data) / days, 1) if days > 0 else 0
    total_precip = round(sum(d['precipitation_mm'] for d in historical_data), 1)

    summary = {
        "period_days": days,
        "avg_max_temp_c": avg_max_temp,
        "total_precipitation_mm": total_precip,
        "data_points": len(historical_data) 
        # Avoid sending all points for now, just summary
    }
    # --- End Mock Implementation ---
    
    print(f"*** Historical Weather API: Returning data: {summary} ***")
    return jsonify(summary)

@app.route('/api/yield-prediction', methods=['POST'])
def predict_yield():
    data = request.get_json()
    crop_type = data.get('crop_type')
    location = data.get('location') # Example: {'lat': ..., 'lon': ...}
    health_status = data.get('health_status', 'good') # Example: 'good', 'average', 'poor'
    weather_summary = data.get('weather_summary') # From /api/historical-weather

    if not all([crop_type, location, weather_summary]):
        return jsonify({'error': 'Missing required data: crop_type, location, weather_summary'}), 400

    print(f"Predicting yield for: Crop={crop_type}, Loc={location}, Health={health_status}, Weather={weather_summary}")

    # --- Mock ML Model & Logic ---
    # Base yield estimate (example values in tons/hectare)
    base_yields = {'wheat': 4.5, 'corn': 11.0, 'rice': 6.0, 'soybean': 3.0}
    base_yield = base_yields.get(crop_type.lower(), 5.0) # Default if crop unknown

    # Adjust based on weather (simple example)
    # Ideal temp ~25C, ideal precip ~300mm for 90 days
    temp_factor = 1.0 - abs(weather_summary.get('avg_max_temp_c', 25) - 25) / 15 # Penalty for deviation from 25C
    precip_factor = 1.0 + (weather_summary.get('total_precipitation_mm', 300) - 300) / 500 # Bonus/penalty based on precip
    
    weather_adjustment = max(0.5, min(1.5, temp_factor * precip_factor)) # Clamp adjustment

    # Adjust based on health
    health_factors = {'good': 1.0, 'average': 0.85, 'poor': 0.6}
    health_adjustment = health_factors.get(health_status, 0.8)

    predicted_yield = round(base_yield * weather_adjustment * health_adjustment, 2)

    # Estimate harvest window (example logic)
    harvest_start_offset = random.randint(70, 90) # Days from now
    harvest_window_days = random.randint(10, 20)
    harvest_start_date = datetime.now() + timedelta(days=harvest_start_offset)
    harvest_end_date = harvest_start_date + timedelta(days=harvest_window_days)

    # Storage recommendations (example logic)
    storage_recommendation = f"Requires cool, dry storage. Allocate space for approximately {predicted_yield} tons/hectare."
    if predicted_yield > base_yields.get(crop_type.lower(), 5.0) * 1.1: # High yield
        storage_recommendation += " Consider renting additional storage due to high predicted yield."
    elif predicted_yield < base_yields.get(crop_type.lower(), 5.0) * 0.8: # Low yield
         storage_recommendation += " Less storage space may be needed than initially planned."
         
    # --- End Mock Logic ---

    result = {
        "predicted_yield_tons_per_hectare": predicted_yield,
        "optimal_harvest_window": {
            "start_date": harvest_start_date.strftime("%Y-%m-%d"),
            "end_date": harvest_end_date.strftime("%Y-%m-%d")
        },
        "storage_recommendation": storage_recommendation,
        "factors_considered": {
            "crop_type": crop_type,
            "health_status": health_status,
            "weather_adjustment_factor": round(weather_adjustment, 2),
            "health_adjustment_factor": round(health_adjustment, 2)
        }
    }
    print(f"Yield prediction result: {result}")
    return jsonify(result)

@app.route('/api/disease-prediction', methods=['POST'])
def predict_disease():
    """
    Predict crop diseases and provide treatment timelines.
    Expected JSON input:
    {
        "crop_type": "tomato",
        "image_url": "url_to_image_or_base64",
        "severity": "low/medium/high" (optional)
    }
    """
    try:
        data = request.get_json()
        crop_type = data.get('crop_type', '').lower()
        severity = data.get('severity', 'medium').lower()
        
        print(f"Disease prediction request: crop={crop_type}, severity={severity}")
        
        if not crop_type:
            return jsonify({"error": "Crop type is required"}), 400
            
        # Load crop knowledge
        with open(os.path.join(os.path.dirname(__file__), "crop_knowledge.json"), 'r') as f:
            crop_knowledge = json.load(f)
        
        if crop_type not in crop_knowledge.get('crops', {}):
            return jsonify({"error": f"Unknown crop type: {crop_type}"}), 400
        
        # Mock disease detection - in production, would use image analysis
        # Get possible diseases for this crop
        possible_diseases = crop_knowledge['crops'][crop_type].get('diseases', [])
        if not possible_diseases:
            return jsonify({"error": f"No known diseases for crop: {crop_type}"}), 400
        
        # Randomly select 1-2 diseases (mock detection)
        num_diseases = min(len(possible_diseases), random.randint(1, 2))
        detected_diseases = random.sample(possible_diseases, num_diseases)
        
        # Generate confidence scores
        confidence_scores = [round(random.uniform(0.65, 0.95), 2) for _ in range(num_diseases)]
        
        # Treatment durations based on severity
        duration_map = {"low": (3, 7), "medium": (7, 14), "high": (14, 28)}
        treatment_duration_days = random.randint(*duration_map.get(severity, (7, 14)))
        
        # Generate timeline
        today = datetime.now()
        treatments = []
        
        # Common treatments indexed by disease
        treatment_by_disease = {
            "early blight": ["Apply copper-based fungicide", "Remove affected leaves", "Improve air circulation"],
            "late blight": ["Apply fungicide with chlorothalonil", "Remove infected plants", "Increase plant spacing"],
            "leaf mold": ["Apply sulfur fungicide", "Reduce humidity", "Increase ventilation"],
            "septoria leaf spot": ["Apply copper fungicide", "Remove infected leaves", "Mulch around plants"],
            "powdery mildew": ["Apply neem oil", "Use potassium bicarbonate spray", "Increase air circulation"],
            "downy mildew": ["Apply copper-based fungicide", "Avoid overhead watering", "Thin out plants"],
            "rust": ["Apply sulfur fungicide", "Remove infected plant parts", "Increase spacing"],
            "bacterial spot": ["Apply copper spray", "Rotate crops", "Avoid overhead irrigation"],
            "common rust": ["Apply fungicide", "Remove infected leaves", "Plant resistant varieties"],
            "gray leaf spot": ["Apply fungicide", "Rotate crops", "Improve drainage"],
            "northern corn leaf blight": ["Apply fungicide", "Rotate crops", "Plant resistant varieties"],
            "apple scab": ["Apply fungicide", "Remove fallen leaves", "Prune for air circulation"],
            "fire blight": ["Prune infected branches", "Apply copper spray", "Avoid high-nitrogen fertilizers"],
            "cedar apple rust": ["Apply fungicide", "Remove galls from cedars", "Plant resistant varieties"],
            "rice blast": ["Apply fungicide", "Drain fields", "Use resistant varieties"],
            "bacterial leaf blight": ["Apply copper bactericide", "Drain fields", "Use disease-free seeds"],
            "sheath blight": ["Apply fungicide", "Reduce nitrogen", "Lower seeding rate"],
            "anthracnose": ["Apply copper fungicide", "Avoid overhead watering", "Remove infected plants"],
            "phytophthora blight": ["Improve drainage", "Apply fungicide", "Rotate crops"],
            "angular leaf spot": ["Apply copper fungicide", "Avoid overhead watering", "Rotate crops"],
            "fusarium head blight": ["Apply fungicide at flowering", "Plant resistant varieties", "Rotate crops"],
            "blackleg": ["Use certified seed", "Rotate crops", "Apply fungicide treatment"],
            "common scab": ["Maintain soil pH below 5.5", "Avoid fresh manure", "Plant resistant varieties"]
        }
        
        # Default treatment actions if disease not found in mapping
        default_treatments = ["Apply appropriate fungicide", "Remove affected plant parts", "Improve growing conditions"]
        
        results = []
        for i, disease in enumerate(detected_diseases):
            disease_treatments = treatment_by_disease.get(disease, default_treatments)
            
            # Create a day-by-day treatment plan
            timeline = []
            for day in range(treatment_duration_days):
                current_date = today + timedelta(days=day)
                
                # Assign appropriate actions for different stages
                if day == 0:
                    # First day always diagnose and start treatment
                    action = "Diagnose and " + disease_treatments[0]
                elif day < treatment_duration_days // 3:
                    # First third of treatment period
                    action = disease_treatments[min(0, len(disease_treatments)-1)]
                elif day < treatment_duration_days * 2 // 3:
                    # Middle third of treatment
                    action = disease_treatments[min(1, len(disease_treatments)-1)]
                else:
                    # Final third of treatment
                    action = disease_treatments[min(2, len(disease_treatments)-1)]
                
                timeline.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "day": day + 1,
                    "action": action,
                    "completed": False
                })
            
            results.append({
                "disease": disease,
                "confidence": confidence_scores[i],
                "duration_days": treatment_duration_days,
                "treatment_timeline": timeline,
                "prevention": [
                    f"Practice crop rotation (avoid planting {crop_type} in the same location for 2-3 years)",
                    "Ensure good air circulation between plants",
                    "Use disease-resistant varieties when available",
                    "Water at the base of plants to keep foliage dry"
                ]
            })
        
        response = {
            "crop_type": crop_type,
            "analysis_date": today.strftime("%Y-%m-%d"),
            "detected_diseases": results,
            "care_instructions": crop_knowledge['crops'][crop_type].get('care', "Provide proper water and nutrients.")
        }
        
        print(f"Disease prediction complete: {len(results)} diseases detected")
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in disease prediction: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500

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
    
    # Get port from environment variable (for Render compatibility)
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)