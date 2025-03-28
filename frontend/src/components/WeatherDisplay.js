import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { getWeatherData } from '../services/api';

const WeatherDisplay = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            setError("Unable to get your location. Please allow location access.");
            setLoading(false);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (location.lat && location.lon) {
        try {
          const data = await getWeatherData(location.lat, location.lon);
          setWeather(data);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch weather data");
          setLoading(false);
        }
      }
    };

    if (location.lat && location.lon) {
      fetchWeather();
    }
  }, [location]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!weather) {
    return <Alert variant="info">No weather data available</Alert>;
  }

  const getWeatherIcon = (description) => {
    if (description.includes('rain')) return '🌧️';
    if (description.includes('cloud')) return '☁️';
    if (description.includes('clear')) return '☀️';
    if (description.includes('snow')) return '❄️';
    if (description.includes('thunder')) return '⛈️';
    return '🌤️';
  };

  return (
    <div className="weather-container">
      <h3 className="mb-4">Weather Conditions</h3>
      
      <Card className="mb-4">
        <Card.Header>
          <h5>Current Weather {getWeatherIcon(weather.current.description)}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p className="mb-1"><strong>Temperature:</strong> {weather.current.temp}°C</p>
              <p className="mb-1"><strong>Conditions:</strong> {weather.current.description}</p>
            </Col>
            <Col md={6}>
              <p className="mb-1"><strong>Humidity:</strong> {weather.current.humidity}%</p>
              <p className="mb-1"><strong>Wind Speed:</strong> {weather.current.wind_speed} m/s</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <h4 className="mb-3">5-Day Forecast</h4>
      <Row>
        {weather.forecast.map((day, index) => (
          <Col key={index} md={6} lg={4} className="mb-3">
            <Card>
            <Card.Header>
                {/* Use the date property directly if it's already a day name, otherwise format it */}
                {typeof day.date === 'string' && day.date.length <= 10 
                  ? day.date 
                  : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                {' '}{getWeatherIcon(day.description)}
              </Card.Header>
              <Card.Body>
                <p className="mb-1"><strong>Temperature:</strong> {day.temp}°C</p>
                <p className="mb-1"><strong>Conditions:</strong> {day.description}</p>
                <p className="mb-1"><strong>Humidity:</strong> {day.humidity}%</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default WeatherDisplay;