import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getWeather } from '../services/api';
import './WeatherPage.css';

const WeatherPage = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [error, setError] = useState(false);
  const [unit, setUnit] = useState('celsius'); // celsius or fahrenheit
  const [weatherAnimation, setWeatherAnimation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          // Default location (New York)
          setLocation({ lat: 40.7128, lon: -74.0060 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeatherData();
    }
  }, [location]);

  useEffect(() => {
    if (weather?.current?.condition) {
      const condition = weather.current.condition.text.toLowerCase();
      
      // Set weather animation based on condition
      if (condition.includes('rain') || condition.includes('drizzle')) {
        setWeatherAnimation('rainy');
      } else if (condition.includes('cloud')) {
        setWeatherAnimation('cloudy');
      } else if (condition.includes('clear') || condition.includes('sunny')) {
        setWeatherAnimation('sunny');
      } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
        setWeatherAnimation('snowy');
      } else if (condition.includes('fog') || condition.includes('mist')) {
        setWeatherAnimation('foggy');
      } else if (condition.includes('thunder') || condition.includes('storm')) {
        setWeatherAnimation('stormy');
      } else {
        setWeatherAnimation('default');
      }
    }
  }, [weather]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(false);
      setRefreshing(true);
      console.log("Fetching weather data for coordinates:", location);
      const data = await getWeather(location.lat, location.lon);
      console.log("Weather data received:", data);
      
      // Validate that we have all required data properties using optional chaining
      if (!data?.location || !data?.current || !data?.forecast?.forecastday) {
        console.error("Incomplete weather data received:", data);
        setError(true);
        return;
      }
      
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Convert Celsius to Fahrenheit
  const toFahrenheit = (celsius) => {
    return (celsius * 9/5) + 32;
  };

  // Get the temperature in the currently selected unit
  const getTemperature = (celsius) => {
    if (!celsius && celsius !== 0) return 'N/A';
    if (unit === 'celsius') return `${Math.round(celsius)}°C`;
    return `${Math.round(toFahrenheit(celsius))}°F`;
  };

  // Toggle temperature unit
  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  // Refresh weather data
  const handleRefresh = () => {
    fetchWeatherData();
  };

  // Safe way to check if all required properties exist
  const isDataValid = weather && 
    weather.location?.name &&
    weather.location?.country &&
    weather.location?.localtime &&
    weather.current?.condition?.icon &&
    weather.current?.condition?.text &&
    weather.current?.temp_c &&
    weather.current?.feelslike_c &&
    weather.current?.humidity &&
    weather.current?.wind_kph &&
    weather.current?.uv !== undefined &&
    weather.forecast?.forecastday?.length > 0;

  // Generate a unique key for animation elements
  const generateKey = (prefix, index) => `${prefix}-${index}-${Math.random().toString(36).substring(2, 9)}`;

  // Render weather animations based on condition
  const renderWeatherAnimation = () => {
    if (!weatherAnimation) return null;
    
    switch (weatherAnimation) {
      case 'rainy':
        return (
          <div className="weather-animation rainy">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={generateKey('raindrop', i)} 
                className="raindrop" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animationDuration: `${0.7 + Math.random() * 0.5}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
      case 'snowy':
        return (
          <div className="weather-animation snowy">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={generateKey('snowflake', i)} 
                className="snowflake" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animationDuration: `${3 + Math.random() * 5}s`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        );
      case 'sunny':
        return (
          <div className="weather-animation sunny">
            <div className="sun">
              <div className="sun-rays" />
            </div>
          </div>
        );
      case 'cloudy':
        return (
          <div className="weather-animation cloudy">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={generateKey('cloud', i)} 
                className="cloud" 
                style={{ 
                  top: `${10 + Math.random() * 20}%`, 
                  left: `${Math.random() * 50}%`,
                  opacity: 0.7 + Math.random() * 0.3,
                  transform: `scale(${0.6 + Math.random() * 0.5})`,
                  animationDuration: `${60 + Math.random() * 40}s`
                }}
              />
            ))}
          </div>
        );
      case 'stormy':
        return (
          <div className="weather-animation stormy">
            <div className="lightning" />
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={generateKey('storm-raindrop', i)} 
                className="raindrop" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animationDuration: `${0.5 + Math.random() * 0.3}s`,
                  animationDelay: `${Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        );
      case 'foggy':
        return (
          <div className="weather-animation foggy">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={generateKey('fog', i)} 
                className="fog-layer" 
                style={{ 
                  top: `${10 + i * 15}%`, 
                  opacity: 0.3 - (i * 0.04),
                  animationDuration: `${80 + Math.random() * 30}s`,
                  animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`agrointel-weather ${weatherAnimation || 'default'}-bg`}>
      {renderWeatherAnimation()}
      <Container>
        <div className="weather-header">
          <h1 className="weather-title">Weather Forecast</h1>
          <p className="weather-subtitle">Real-time weather information for your location</p>
          <div className="weather-actions">
            <Button 
              variant="outline-light" 
              className="unit-toggle" 
              onClick={toggleUnit}
              disabled={loading}
            >
              {unit === 'celsius' ? 'Switch to °F' : 'Switch to °C'}
            </Button>
            <Button 
              variant="outline-light" 
              className="refresh-btn ml-2" 
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              {refreshing ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                  <span className="ms-2">Refreshing...</span>
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
        
        {loading && !refreshing ? (
          <div className="text-center my-5 loading-container">
            <div className="spinner" />
            <p className="mt-2 loading-text">Loading weather data...</p>
          </div>
        ) : error || !isDataValid ? (
          <Alert variant="danger" className="weather-error">
            <Alert.Heading>Unable to load weather data</Alert.Heading>
            <p>Please check your connection and try again.</p>
            <Button variant="outline-danger" onClick={handleRefresh}>Retry</Button>
          </Alert>
        ) : (
          <div className="weather-container animate-in">
            <Row>
              <Col lg={6} className="mb-4">
                <Card className="current-weather">
                  <Card.Body>
                    <div className="location">
                      <h2>{weather.location.name}, {weather.location.country}</h2>
                      <p>{new Date(weather.location.localtime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    <div className="current-conditions">
                      <div className="weather-icon-large">
                        <img 
                          src={weather.current.condition.icon} 
                          alt={weather.current.condition.text}
                          className="condition-icon"
                        />
                      </div>
                      <div className="weather-info">
                        <div className="weather-current-temp">{getTemperature(weather.current.temp_c)}</div>
                        <div className="weather-current-condition">{weather.current.condition.text}</div>
                      </div>
                    </div>
                    
                    <div className="weather-details mt-4">
                      <Row>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">Feels Like</div>
                          <div className="detail-value">{getTemperature(weather.current.feelslike_c)}</div>
                        </Col>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">Humidity</div>
                          <div className="detail-value">{weather.current.humidity}%</div>
                        </Col>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">Wind</div>
                          <div className="detail-value">{Math.round(weather.current.wind_kph)} km/h</div>
                        </Col>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">UV Index</div>
                          <div className="detail-value">{weather.current.uv}</div>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={6}>
                <Card className="forecast-card">
                  <Card.Body>
                    <Card.Title>3-Day Forecast</Card.Title>
                    <div className="forecast-days">
                      {weather.forecast.forecastday.map((day) => (
                        <div key={day.date} className="forecast-day">
                          <div className="forecast-date">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="forecast-icon">
                            <img src={day.day.condition.icon} alt={day.day.condition.text} />
                          </div>
                          <div className="forecast-temps">
                            <div className="forecast-day-temp">{getTemperature(day.day.maxtemp_c)}</div>
                            <div className="forecast-night-temp">{getTemperature(day.day.mintemp_c)}</div>
                          </div>
                          <div className="forecast-condition">
                            <span className="badge">{day.day.condition.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default WeatherPage;