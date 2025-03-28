import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { addProduct } from '../../services/marketplaceService';

const AddMarketForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    products: '',
    priceRange: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        ...formData,
        rating: 0,
        products: formData.products.split(',').map(p => p.trim())
      };

      const productId = await addProduct(productData);
      if (onSubmit) {
        onSubmit({ ...productData, id: productId });
      }
      
      setFormData({
        name: '',
        description: '',
        location: '',
        products: '',
        priceRange: ''
      });
      onClose();
    } catch (error) {
      console.error('Error adding market listing:', error);
      setError('Failed to add market listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Market Listing</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              label="Business Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
            <TextField
              required
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              disabled={loading}
            />
            <TextField
              required
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
            <TextField
              required
              label="Products (comma-separated)"
              name="products"
              value={formData.products}
              onChange={handleChange}
              helperText="Enter products separated by commas"
              fullWidth
              disabled={loading}
            />
            <TextField
              required
              label="Price Range"
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              placeholder="e.g. ₹500 - ₹2000"
              fullWidth
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Listing'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddMarketForm;