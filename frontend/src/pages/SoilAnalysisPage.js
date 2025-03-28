import React from 'react';
import { Container } from 'react-bootstrap';
import SoilAnalysis from '../components/SoilAnalysis';
import './SoilAnalysisPage.css';

const SoilAnalysisPage = () => {
  return (
    <div className="agrointel-soil">
      <Container>
        <div className="soil-header">
          <h1 className="soil-title animate-text">Soil Analysis</h1>
          <p className="soil-subtitle animate-text" style={{ animationDelay: '0.3s' }}>
            Upload images of your soil to get detailed analysis and recommendations
          </p>
        </div>
        
        <div className="soil-container animate-in">
          <SoilAnalysis />
        </div>
      </Container>
    </div>
  );
};

export default SoilAnalysisPage; 