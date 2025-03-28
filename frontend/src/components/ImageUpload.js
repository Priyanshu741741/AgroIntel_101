import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { analyzeImage } from '../services/api';

const ImageUpload = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to analyze');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyzeImage(selectedFile);
      onAnalysisComplete(result, previewUrl);
    } catch (error) {
      setError('Error analyzing image. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload Crop Image</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select an image of your crop</Form.Label>
          <Form.Control 
            type="file" 
            onChange={handleFileChange}
            accept="image/*"
            disabled={isLoading}
          />
          <Form.Text className="text-muted">
            For best results, ensure the image clearly shows the plant's leaves.
          </Form.Text>
        </Form.Group>
        
        {previewUrl && (
          <div className="image-preview mb-3">
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '300px' }} 
            />
          </div>
        )}
        
        <Button 
          variant="primary" 
          type="submit"
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">Analyzing...</span>
            </>
          ) : (
            'Analyze Image'
          )}
        </Button>
      </Form>
    </div>
  );
};

export default ImageUpload;