import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import './DiseasePredictionPage.css';

const DiseasePredictionPage = () => {
  const [cropType, setCropType] = useState('tomato');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  const cropTypes = [
    { value: 'tomato', label: 'Tomato' },
    { value: 'potato', label: 'Potato' },
    { value: 'corn', label: 'Corn' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Mock API call - in a real app, you would send the image to a backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock prediction results
      const mockPredictions = {
        tomato: [
          { disease: 'Early Blight', confidence: 0.85, treatment: 'Apply copper-based fungicide' },
          { disease: 'Leaf Mold', confidence: 0.12, treatment: 'Improve air circulation' }
        ],
        potato: [
          { disease: 'Late Blight', confidence: 0.76, treatment: 'Apply fungicide' },
          { disease: 'Common Scab', confidence: 0.18, treatment: 'Adjust soil pH' }
        ],
        corn: [
          { disease: 'Gray Leaf Spot', confidence: 0.92, treatment: 'Apply foliar fungicide' },
          { disease: 'Northern Leaf Blight', confidence: 0.07, treatment: 'Crop rotation' }
        ],
        rice: [
          { disease: 'Rice Blast', confidence: 0.81, treatment: 'Apply fungicide' },
          { disease: 'Bacterial Leaf Blight', confidence: 0.16, treatment: 'Use resistant varieties' }
        ],
        wheat: [
          { disease: 'Powdery Mildew', confidence: 0.78, treatment: 'Apply sulfur-based fungicide' },
          { disease: 'Rust', confidence: 0.19, treatment: 'Early application of fungicide' }
        ]
      };
      
      setPrediction(mockPredictions[cropType] || mockPredictions.tomato);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disease-prediction-page">
      <Container className="py-5">
        <h1 className="text-center mb-4">Crop Disease Detection</h1>
        <p className="text-center text-muted mb-5">Identify crop diseases and get treatment recommendations</p>
        
        <Row>
          <Col md={5}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h4 className="mb-3">Upload Image</h4>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Crop Type</Form.Label>
                    <Form.Select 
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                    >
                      {cropTypes.map(crop => (
                        <option key={crop.value} value={crop.value}>{crop.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Crop Image</Form.Label>
                    <Form.Control 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <Form.Text className="text-muted">
                      Select a clear image of the affected plant part.
                    </Form.Text>
                  </Form.Group>
                  
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading || !image}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Analyzing...
                        </>
                      ) : 'Analyze Image'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            {previewUrl && (
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-3">Image Preview</h4>
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" className="img-fluid" />
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
          
          <Col md={7}>
            {prediction ? (
              <Card className="shadow-sm prediction-result">
                <Card.Body>
                  <h4 className="mb-4">Detection Results</h4>
                  
                  {prediction.map((item, index) => (
                    <div key={index} className={`result-item mb-3 ${index === 0 ? 'primary-result' : 'secondary-result'}`}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="m-0">{item.disease}</h5>
                        <span className="confidence-score">
                          {Math.round(item.confidence * 100)}% confidence
                        </span>
                      </div>
                      
                      <div className="progress mb-3">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${item.confidence * 100}%` }}
                          aria-valuenow={item.confidence * 100} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                      
                      <div className="treatment-info">
                        <strong>Recommended Treatment:</strong>
                        <p className="mb-0">{item.treatment}</p>
                      </div>
                      
                      {index === 0 && <hr className="my-4" />}
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <h5>Prevention Tips</h5>
                    <ul>
                      <li>Practice crop rotation</li>
                      <li>Ensure proper spacing between plants</li>
                      <li>Water at the base of plants to keep foliage dry</li>
                      <li>Use disease-resistant varieties when available</li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <div className="text-center mt-5 empty-state">
                <img 
                  src="/images/plant-analysis.svg" 
                  alt="Disease Detection" 
                  className="empty-state-image"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <h4 className="mt-4">Ready to Analyze</h4>
                <p className="text-muted">
                  Upload an image of your crop to receive disease identification and treatment recommendations.
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DiseasePredictionPage; 