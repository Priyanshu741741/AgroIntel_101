import React, { useState } from 'react';
import { Button, Form, Spinner, ListGroup, Badge, Alert } from 'react-bootstrap';
import { analyzeImage } from '../services/api';
import './CropAnalysis.css';

const CropAnalysis = () => {
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
      const result = await analyzeImage(selectedFile);
      setAnalysisResult(result);
      setError(null);
    } catch (error) {
      setError(`Analysis failed: ${error.response?.data?.error || 'Server error'}`);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadgeVariant = (category) => {
    switch (category) {
      case 'healthy':
        return 'success';
      case 'diseased':
        return 'danger';
      case 'nutrient_deficient':
        return 'warning';
      default:
        return 'primary';
    }
  };
  
  const formatHealthCategory = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="crop-analysis-component">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      <div className="upload-section">
        <div className="image-upload-area">
          {imageUrl ? (
            <img src={imageUrl} alt="crop sample" className="preview-image" />
          ) : (
            <div className="upload-placeholder">
              <i className="bi bi-upload" />
              <span>Upload Crop Image</span>
            </div>
          )}
          
          <Form.Group controlId="cropImage" className="mt-3">
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
            'Get Crop Analysis'
          )}
        </Button>
      </div>

      {analysisResult && (
        <div className="analysis-results mt-4">
          <h3>Analysis Results</h3>
          
          <div className="crop-info">
            <div className="crop-type">
              <span>Crop Type:</span> 
              <Badge bg="info" className="ms-2">{analysisResult.class.replace(/_/g, ' ')}</Badge>
            </div>
            
            <div className="health-status">
              <span>Health Status:</span> 
              <Badge bg={getHealthBadgeVariant(analysisResult.health_category)} className="ms-2">
                {formatHealthCategory(analysisResult.health_category)}
              </Badge>
            </div>
            
            <div className="confidence">
              <span>Confidence:</span> 
              <Badge bg="success" className="ms-2">
                {(analysisResult.confidence * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
          
          <h4 className="mt-4">Recommendations</h4>
          <ListGroup className="mb-4">
            <ListGroup.Item className="recommendation-item">
              <strong>Care:</strong> {analysisResult.recommendations.care}
            </ListGroup.Item>
            <ListGroup.Item className="recommendation-item">
              <strong>Watering:</strong> {analysisResult.recommendations.watering}
            </ListGroup.Item>
            <ListGroup.Item className="recommendation-item">
              <strong>Issues:</strong> {analysisResult.recommendations.issues}
            </ListGroup.Item>
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default CropAnalysis; 