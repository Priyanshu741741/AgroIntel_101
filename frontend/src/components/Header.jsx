import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="nav-link" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          CropMonitor
        </Link>
        <nav className="nav-links">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/analysis" className="nav-link">
            Analysis
          </Link>
          <Link to="/monitor" className="nav-link">
            Monitor
          </Link>
          <Link to="/chat" className="nav-link">
            Chat
          </Link>
        </nav>
        <button className="btn">
          Get Started
        </button>
      </div>
    </header>
  );
}