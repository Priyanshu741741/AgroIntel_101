import React from 'react';
import { Container } from 'react-bootstrap';
import WeatherDisplay from '../components/WeatherDisplay';

const WeatherPage = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Weather Monitoring</h2>
      <WeatherDisplay />
    </Container>
  );
};

export default WeatherPage;