import React from 'react';
import { Card, Badge, ListGroup } from 'react-bootstrap';

const AnalysisResults = ({ results, imageUrl }) => {
  if (!results) return null;
  
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
    <Card className="mb-4">
      <Card.Header>
        <h4>Analysis Results</h4>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-wrap">
          <div className="me-4 mb-3" style={{ maxWidth: '300px' }}>
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Analyzed crop" 
                className="img-fluid rounded" 
              />
            )}
          </div>
          
          <div className="flex-grow-1">
            <h5>
              Plant Health: 
              <Badge 
                bg={getHealthBadgeVariant(results.health_category)}
                className="ms-2"
              >
                {formatHealthCategory(results.health_category)}
              </Badge>
            </h5>
            
            <p>
              <strong>Identified as:</strong> {results.class.replace(/_/g, ' ')}
              {results.confidence && (
                <span className="ms-2 text-muted">
                  (Confidence: {(results.confidence * 100).toFixed(1)}%)
                </span>
              )}
            </p>
            
            <h6 className="mt-4">Recommendations</h6>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Care:</strong> {results.recommendations.care}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Watering:</strong> {results.recommendations.watering}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Issues:</strong> {results.recommendations.issues}
              </ListGroup.Item>
            </ListGroup>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnalysisResults;