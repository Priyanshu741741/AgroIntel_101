import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import './SellerDashboard.css';

const mockProducts = [
  {
    id: 1,
    name: 'Organic Compost',
    price: '₹800 per 25kg',
    stock: 50,
    description: 'Premium quality organic compost for all crop types',
    sales: 12
  },
  {
    id: 2,
    name: 'Bio Fertilizer',
    price: '₹1200 per 10L',
    stock: 25,
    description: 'Nutrient-rich bio fertilizer for enhanced crop growth',
    sales: 8
  }
];

const SellerDashboard = () => {
  const [products, setProducts] = useState(mockProducts);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: ''
  });
  
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
  };
  
  const handleShowModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description
      });
    } else {
      setFormData({
        name: '',
        price: '',
        stock: '',
        description: ''
      });
    }
    setShowModal(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentProduct) {
      // Update existing product
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === currentProduct.id 
            ? { ...product, ...formData } 
            : product
        )
      );
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...formData,
        sales: 0
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
    }
    
    handleCloseModal();
  };
  
  const handleDeleteProduct = (id) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  };
  
  return (
    <div className="seller-dashboard">
      <Container>
        <div className="dashboard-header">
          <h2>Seller Dashboard</h2>
          <Button 
            variant="primary" 
            onClick={() => handleShowModal()}
            className="add-product-btn"
          >
            Add New Product
          </Button>
        </div>
        
        <Row className="dashboard-stats mb-4">
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <h3>Total Products</h3>
                <p className="stat-value">{products.length}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <h3>Total Sales</h3>
                <p className="stat-value">
                  {products.reduce((total, product) => total + product.sales, 0)}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <h3>Product Views</h3>
                <p className="stat-value">124</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <h3 className="section-title">Your Products</h3>
        
        <Row>
          {products.map(product => (
            <Col md={6} lg={4} key={product.id} className="mb-4">
              <Card className="product-card">
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="price">{product.price}</Card.Text>
                  <Card.Text>
                    <span className="label">Stock:</span> {product.stock} units
                  </Card.Text>
                  <Card.Text>{product.description}</Card.Text>
                  <Card.Text>
                    <span className="label">Sales:</span> {product.sales} units
                  </Card.Text>
                  <div className="product-actions">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleShowModal(product)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control 
                type="text" 
                name="price" 
                value={formData.price} 
                onChange={handleChange}
                placeholder="e.g. ₹800 per 25kg"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentProduct ? 'Update' : 'Add'} Product
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SellerDashboard;