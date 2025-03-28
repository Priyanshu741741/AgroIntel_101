import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import CropAnalysisPage from './pages/CropAnalysisPage';
import WeatherPage from './pages/WeatherPage';
import ChatbotPage from './pages/ChatbotPage';
import MarketplacePage from './pages/MarketplacePage';
import TreatmentTimeline from './components/TreatmentTimeline';
import SoilAnalysisPage from './pages/SoilAnalysisPage';
import SplashScreen from './components/SplashScreen';

// Add Google Font
const loadGoogleFont = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Google Font
    loadGoogleFont();
    
    // Simulate loading resources
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Match this with the splash screen duration
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <SplashScreen />}
      <div className="App">
        <Router>
          <Navigation />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<CropAnalysisPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/treatment-timeline" element={<TreatmentTimeline />} />
              <Route path="/soil-analysis" element={<SoilAnalysisPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
            </Routes>
          </main>
        </Router>
      </div>
    </>
  );
}

export default App;