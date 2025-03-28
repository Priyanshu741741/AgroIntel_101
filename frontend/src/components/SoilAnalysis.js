import React, { useState } from 'react';
import { Button, Form, Spinner, ListGroup, Badge, Alert } from 'react-bootstrap';
import { analyzeSoil } from '../services/api';
import './SoilAnalysis.css';

const SoilAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      setError('You can only upload image files!');
      return;
    }
    
    // Check file size
    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      setError('Image must be smaller than 5MB!');
      return;
    }
    
    // Clear previous error
    setError(null);
    
    // Create URL for preview
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
    setSelectedFile(file);
  };

  const handleAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select an image first!');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSoil(selectedFile);
      setAnalysisResult(result);
      setError(null);
    } catch (error) {
      setError(`Analysis failed: ${error.response?.data?.error || 'Server error'}`);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soil-analysis-component">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="upload-section">
        <div className="image-upload-area">
          {imageUrl ? (
            <img src={imageUrl} alt="soil sample" className="preview-image" />
          ) : (
            <div className="upload-placeholder">
              <i className="bi bi-upload" />
              <span>Upload Soil Image</span>
            </div>
          )}
          
          <Form.Group controlId="soilImage" className="mt-3">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </Form.Group>
        </div>
        
        <Button
          variant="primary"
          onClick={handleAnalysis}
          disabled={!selectedFile || loading}
          className="analysis-button mt-3"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Analyzing...</span>
            </>
          ) : (
            'Get Soil Analysis'
          )}
        </Button>
      </div>

      {analysisResult && (
        <div className="analysis-results mt-4">
          <h3>Analysis Results</h3>
          
          <div className="soil-info">
            <div className="soil-type">
              <span>Soil Type:</span> 
              <Badge bg="info" className="ms-2">{analysisResult.class}</Badge>
            </div>
            
            <div className="confidence">
              <span>Confidence:</span> 
              <Badge bg="success" className="ms-2">
                {(analysisResult.confidence * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
          
          <h4 className="mt-4">Characteristics</h4>
          <ListGroup className="mb-4">
            {analysisResult.characteristics.map((item, index) => (
              <ListGroup.Item key={`char-${index}`} className="characteristic-item">
                {item}
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          <h4>Recommendations</h4>
          <ListGroup>
            {analysisResult.recommendations.map((item, index) => (
              <ListGroup.Item key={`rec-${index}`} className="recommendation-item">
                {item}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default SoilAnalysis;