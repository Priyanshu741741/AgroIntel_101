import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SoilAnalysis from '../components/SoilAnalysis';

const HomePage = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1>AI-Powered Crop Monitoring</h1>
            <p className="lead">
              Monitor your crops' health and soil conditions using AI and get personalized recommendations
            </p>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" />
            <Card.Body>
              <Card.Title>Crop Health Analysis</Card.Title>
              <Card.Text>
                Upload photos of your crops and get instant health assessment using our AI model.
              </Card.Text>
              <Link to="/dashboard">
                <Button variant="primary">Analyze Your Crops</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1561583534-09e822ba83ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" />
            <Card.Body>
              <Card.Title>Weather Integration</Card.Title>
              <Card.Text>
                Get real-time weather data for your location to help make informed farming decisions.
              </Card.Text>
              <Link to="/weather">
                <Button variant="primary">Check Weather</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" />
            <Card.Body>
              <Card.Title>Personalized Recommendations</Card.Title>
              <Card.Text>
                Receive tailored care suggestions based on crop health and local weather conditions.
              </Card.Text>
              <Link to="/dashboard">
                <Button variant="primary">Get Recommendations</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100">
            <Card.Img variant="top" src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" />
            <Card.Body>
              <Card.Title>AI Crop Assistant</Card.Title>
              <Card.Text>
                Chat with our Google AI-powered assistant for expert advice on crop care and disease management.
              </Card.Text>
              <Link to="/chatbot">
                <Button variant="primary">Ask the Assistant</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Soil Analysis</h2>
          <SoilAnalysis />
        </Col>
      </Row>
      
      <Row>
        <Col>
          <div className="text-center">
            <h3>How It Works</h3>
            <p>
              Our app uses advanced AI models to identify crop health issues, analyze soil conditions, and provide personalized recommendations.
              Simply take a photo of your crops or soil, upload it, and get instant analysis. Need more help? Chat with our
              AI-powered assistant for expert advice on crop care.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;