import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import WeatherPage from './pages/WeatherPage';
import ChatbotPage from './pages/ChatbotPage';
import SplashScreen from './components/SplashScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
            </Routes>
          </main>
          <footer className="bg-dark text-white text-center py-3 mt-5">
            <p className="mb-0">© {new Date().getFullYear()} Crop Monitoring App</p>
          </footer>
        </Router>
      </div>
    </>
  );
}

export default App;