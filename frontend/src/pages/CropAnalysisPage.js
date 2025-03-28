import React from 'react';
import { Container } from 'react-bootstrap';
import CropAnalysis from '../components/CropAnalysis';
import './CropAnalysisPage.css';

const CropAnalysisPage = () => {
  return (
    <div className="agrointel-crop">
      <Container>
        <div className="crop-header">
          <h1 className="crop-title animate-text">Crop Analysis</h1>
          <p className="crop-subtitle animate-text" style={{ animationDelay: '0.3s' }}>
            Upload images of your crops to get detailed health analysis and recommendations
          </p>
        </div>
        
        <div className="crop-container animate-in">
          <CropAnalysis />
        </div>
      </Container>
    </div>
  );
};

export default CropAnalysisPage; 