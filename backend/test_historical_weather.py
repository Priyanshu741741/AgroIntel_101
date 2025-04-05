from flask import Flask, jsonify, request
import random
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/api/historical-weather', methods=['GET'])
def get_historical_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    days = int(request.args.get('days', 90)) # Default to last 90 days

    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude required'}), 400

    print(f"Fetching historical weather for lat={lat}, lon={lon}, days={days}")

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
    }
    # --- End Mock Implementation ---
    
    print(f"Historical weather summary: {summary}")
    return jsonify(summary)

if __name__ == '__main__':
    print("Starting weather test server...")
    app.run(debug=True, port=5001) 