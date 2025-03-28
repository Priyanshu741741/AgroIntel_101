import React, { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import CropAnalysis from '../components/CropAnalysis';
import { getModelInfo } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const [modelStatus, setModelStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        await getModelInfo();
        setModelStatus({ loading: false, error: null });
      } catch (error) {
        setModelStatus({ 
          loading: false, 
          error: "The model may not be available. Please ensure the backend is running and the model is trained."
        });
      }
    };
    
    checkModelStatus();
  }, []);

  return (
    <div className="agrointel-dashboard">
      <Container>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Crop Analysis</h1>
          <p className="dashboard-subtitle">Upload photos of your crops and get instant AI analysis</p>
        </div>
        
        {modelStatus.error && (
          <Alert variant="warning" className="mb-4">
            {modelStatus.error}
          </Alert>
        )}
        
        <CropAnalysis />
      </Container>
    </div>
  );
};

export default DashboardPage;