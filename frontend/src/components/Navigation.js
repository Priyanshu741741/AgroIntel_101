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
          <Link to="/weather" className="nav-item">Weather</Link>
          <Link to="/marketplace" className="nav-item">Marketplace</Link>
          <Link to="/chatbot" className="nav-item">AI Assistant</Link>
        </div>
        
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Log in</Link>
          <Link to="/signup" className="signup-btn">Sign up free</Link>
        </div>
      </Container>
    </header>
  );
};

export default Navigation;