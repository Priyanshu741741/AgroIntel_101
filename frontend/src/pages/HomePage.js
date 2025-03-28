import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './HomePage.css';
import gardenImage from '../assets/garden-image.jpg';

const HomePage = () => {
  return (
    <div className="agrointel-home">
      <Container>
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="main-heading">
              Smart Farming, <br /> Smarter Future.
            </h1>
            <p className="hero-text">
            AgroIntel is your all-in-one smart farming companion, revolutionizing agriculture with AI-driven insights. From crop and soil analysis to real-time weather updates, we empower farmers with data-driven decisions. Our marketplace connects growers with buyers, while the AI Assistant offers expert guidance for maximizing yields. Experience the future of farming with AgroIntel—where intelligence meets agriculture!
            </p>
            
            <div className="link-input-container">
              <Link to="/signup" className="get-started-button">
                Get Started with AgroIntel
              </Link>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="ghibli-garden">
              <img src={gardenImage} alt="Beautiful garden illustration" />
            </div>
          </div>
        </div>
        
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Crop Health Analysis</h3>
            <p>Identify diseases and nutrient deficiencies with our AI-powered image analysis</p>
            <Link to="/dashboard" className="feature-link">Analyze your crops</Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌡️</div>
            <h3>Weather Monitoring</h3>
            <p>Get real-time forecasts and alerts tailored to your location</p>
            <Link to="/weather" className="feature-link">Check weather</Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🧪</div>
            <h3>Soil Analysis</h3>
            <p>Understand your soil composition and get fertilizer recommendations</p>
            <Link to="/soil-analysis" className="feature-link">Test your soil</Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Get expert advice on crop care and farming practices</p>
            <Link to="/chatbot" className="feature-link">Chat with assistant</Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;