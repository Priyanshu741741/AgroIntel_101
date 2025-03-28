import { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // Add animation classes to elements when they mount
    const elements = document.querySelectorAll('.card, h1, h2, h3');
    elements.forEach((element, index) => {
      element.classList.add('fade-in');
      element.style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  return (
    <div className="App">
      <nav className="navbar">
        <a href="#" className="navbar-brand">AgroIntel</a>
        <ul className="navbar-nav">
          <li><a href="#home" className="nav-link">Home</a></li>
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#about" className="nav-link">About</a></li>
        </ul>
        <button className="ai-assistant-btn">AI Assistant</button>
      </nav>
      <div className="features-carousel">
        <div className="feature-card">
          <h2>Crop Health Analysis</h2>
          <p>Monitor your crop health in real-time with advanced AI technology</p>
          <button>Analyze Crops</button>
        </div>

        <div className="feature-card">
          <h2>Weather Integration</h2>
          <p>Stay ahead with precise weather forecasts and alerts</p>
          <button>Check Weather</button>
        </div>

        <div className="feature-card">
          <h2>Smart Recommendations</h2>
          <p>Get personalized AI-powered farming insights</p>
          <button>Get Insights</button>
        </div>

        <div className="feature-card">
          <h2>AI Assistant</h2>
          <p>Your intelligent farming companion available 24/7</p>
          <button>Chat Now</button>
        </div>
      </div>
    </div>
  );
}

export default App;
