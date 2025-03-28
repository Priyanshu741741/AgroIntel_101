import React, { useEffect, useState } from 'react';
import '../styles/SplashScreen.css';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [logoActive, setLogoActive] = useState(false);
  const [logoFade, setLogoFade] = useState(false);

  useEffect(() => {
    // Activate logo animation
    const activateTimer = setTimeout(() => {
      setLogoActive(true);
    }, 500);

    // Fade the logo
    const fadeTimer = setTimeout(() => {
      setLogoFade(true);
    }, 2500);

    // Hide the splash screen
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    // Clean up timers
    return () => {
      clearTimeout(activateTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="splash-screen">
      <h1 className="splash-logo-header">
        <span className={`splash-logo ${logoActive ? 'active' : ''} ${logoFade ? 'fade' : ''}`}>Crop</span>
        <span className={`splash-logo ${logoActive ? 'active' : ''} ${logoFade ? 'fade' : ''}`} style={{ animationDelay: '0.4s' }}>Monitoring</span>
        <span className={`splash-logo ${logoActive ? 'active' : ''} ${logoFade ? 'fade' : ''}`} style={{ animationDelay: '0.8s' }}>App</span>
      </h1>
    </div>
  );
};

export default SplashScreen;