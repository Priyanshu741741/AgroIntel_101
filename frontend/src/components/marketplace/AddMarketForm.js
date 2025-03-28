import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const AddMarketForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    products: '',
    price_range: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare the data
      const marketData = {
        ...formData,
        id: Date.now(), // Generate a temporary ID
        rating: 0,
        products: formData.products.split(',').map(product => product.trim())
      };
      
      // Here you would typically send the data to your backend API
      // For example: await fetch('/api/market', {method: 'POST', body: JSON.stringify(marketData)});
      
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onSubmit prop with the new market data
      onSubmit(marketData);
      
      // Show success message
      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          location: '',
          products: '',
          price_range: ''
        });
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to add market. Please try again.');
      console.error('Error adding market:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Add New Market
          </Typography>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 0.5 }}>
            <CloseIcon />
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Market added successfully!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Market Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Products (comma separated)"
            name="products"
            value={formData.products}
            onChange={handleChange}
            helperText="e.g., Organic Compost, Bio-Fertilizer"
            required
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Price Range"
            name="price_range"
            value={formData.price_range}
            onChange={handleChange}
            helperText="e.g., ₹500 - ₹2000"
            required
            margin="normal"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={onClose} 
              sx={{ mr: 2 }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Market'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddMarketForm;