import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { getWeatherData } from '../services/api';
import './WeatherPage.css';

const WeatherPage = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: null, lon: null });

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
          // Default location
          setLocation({ lat: 37.7749, lon: -122.4194 });
        }
      );
    }
  }, []);

  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const data = await getWeatherData(location.lat, location.lon);
      console.log("Weather data received:", data);
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if weather data has the required structure
  const isValidWeatherData = weather?.location && 
    weather?.current && 
    weather?.forecast?.forecastday;

  return (
    <div className="agrointel-weather">
      <Container>
        <div className="weather-header">
          <h1 className="weather-title">Weather Forecast</h1>
          <p className="weather-subtitle">Real-time weather information for your location</p>
        </div>
        
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner" />
            <p className="mt-2">Loading weather data...</p>
          </div>
        ) : isValidWeatherData ? (
          <div className="weather-container">
            <Row>
              <Col lg={6} className="mb-4">
                <Card className="current-weather">
                  <Card.Body>
                    <div className="location">
                      <h2>{weather?.location?.name}, {weather?.location?.country}</h2>
                      <p>{new Date(weather?.location?.localtime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    <div className="current-conditions">
                      <div className="weather-icon-large">
                        <img src={weather?.current?.condition?.icon} alt={weather?.current?.condition?.text} />
                      </div>
                      <div className="weather-info">
                        <div className="weather-current-temp">{Math.round(weather?.current?.temp_c)}°C</div>
                        <div className="weather-current-condition">{weather?.current?.condition?.text}</div>
                      </div>
                    </div>
                    
                    <div className="weather-details mt-4">
                      <Row>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">Feels Like</div>
                          <div className="detail-value">{Math.round(weather?.current?.feelslike_c)}°C</div>
                        </Col>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">Humidity</div>
                          <div className="detail-value">{weather?.current?.humidity}%</div>
                        </Col>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">Wind</div>
                          <div className="detail-value">{weather?.current?.wind_kph} km/h</div>
                        </Col>
                        <Col xs={6} className="weather-detail">
                          <div className="detail-label">UV Index</div>
                          <div className="detail-value">{weather?.current?.uv}</div>
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
                      {weather?.forecast?.forecastday?.map((day) => (
                        <div key={day.date} className="forecast-day">
                          <div className="forecast-date">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="forecast-icon">
                            <img src={day.day?.condition?.icon} alt={day.day?.condition?.text} />
                          </div>
                          <div className="forecast-temps">
                            <div className="forecast-day-temp">{Math.round(day.day?.maxtemp_c)}°</div>
                            <div className="forecast-night-temp">{Math.round(day.day?.mintemp_c)}°</div>
                          </div>
                          <div className="forecast-condition">
                            <span className="badge">{day.day?.condition?.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="weather-error">
            <p>Unable to load weather data. Please check your connection and try again.</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default WeatherPage;