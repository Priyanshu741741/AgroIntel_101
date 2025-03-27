import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import ImageUpload from '../components/ImageUpload';
import AnalysisResults from '../components/AnalysisResults';
import { getModelInfo } from '../services/api';

const DashboardPage = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState(null);
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

  const handleAnalysisComplete = (results, imageUrl) => {
    setAnalysisResults(results);
    setAnalyzedImageUrl(imageUrl);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Crop Analysis Dashboard</h2>
      
      {modelStatus.error && (
        <Alert variant="warning" className="mb-4">
          {modelStatus.error}
        </Alert>
      )}
      
      <Row>
        <Col lg={5} className="mb-4">
          <ImageUpload onAnalysisComplete={handleAnalysisComplete} />
        </Col>
        
        <Col lg={7}>
          {analysisResults && (
            <AnalysisResults 
              results={analysisResults} 
              imageUrl={analyzedImageUrl} 
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;