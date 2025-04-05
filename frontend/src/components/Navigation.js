import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <header className="agrointel-header">
      <Container fluid className="header-container">
        <Link to="/" className="logo">AgroIntel</Link>
        
        <div className="navigation-links">
          <Link to="/dashboard" className="nav-item">Crop Analysis</Link>
          <Link to="/soil-analysis" className="nav-item">Soil Analysis</Link>
          <Link to="/disease-prediction" className="nav-item">Disease Prediction</Link>
          <Link to="/weather" className="nav-item">Weather</Link>
          <Link to="/yield-prediction" className="nav-item">Yield Planning</Link>
          <Link to="/marketplace" className="nav-item">Marketplace</Link>
          <Link to="/chatbot" className="nav-item">AI Help</Link>
        </div>
        
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Log in</Link>
          <Link to="/signup" className="signup-btn">Sign up</Link>
        </div>
      </Container>
    </header>
  );
};

export default Navigation;