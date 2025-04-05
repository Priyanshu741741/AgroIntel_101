import React, { useState } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, MenuItem, Select, 
  InputLabel, FormControl, Alert, Grid, Chip, Fade, Slide, 
  IconButton, Divider, CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Add as AddIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  CurrencyRupee as CurrencyIcon,
  Phone as PhoneIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

// Product categories
const CATEGORIES = [
  'Organic Fertilizers',
  'Bio Pesticides',
  'Seeds',
  'Equipment',
  'Other'
];

const AddMarketForm = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    products: [],
    price_range: '',
    contact: '',
    category: 'Organic Fertilizers',
  });
  
  const [currentProduct, setCurrentProduct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleAddProduct = () => {
    if (currentProduct.trim() !== '' && !formData.products.includes(currentProduct.trim())) {
      setFormData(prevData => ({
        ...prevData,
        products: [...prevData.products, currentProduct.trim()]
      }));
      setCurrentProduct('');
    }
  };

  const handleRemoveProduct = (productToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      products: prevData.products.filter(product => product !== productToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.products.length === 0) {
      setError('Please add at least one product');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare the data
      const marketData = {
        ...formData,
        id: Date.now(), // Generate a temporary ID
        rating: 4.0 + Math.random() * 1.0, // Generate a random rating between 4.0 and 5.0
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
          products: [],
          price_range: '',
          contact: '',
          category: 'Organic Fertilizers',
        });
        setCurrentProduct('');
        setActiveStep(0);
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to add supplier. Please try again.');
      console.error('Error adding supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.name || !formData.description)) {
      setError('Please fill in all required fields');
      return;
    }
    if (activeStep === 1 && (!formData.location || !formData.contact)) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Form steps
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <StoreIcon sx={{ mr: 1 }} /> Basic Information
              </Typography>
              <TextField
                fullWidth
                label="Supplier Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
                autoFocus
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
                placeholder="Describe what you offer, your unique value proposition, etc."
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1 }} /> Contact Details
              </Typography>
              
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="City, State"
              />
              
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                margin="normal"
                placeholder="+91 9876543210"
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
                InputProps={{
                  startAdornment: <CurrencyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1 }} /> Products
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add a Product"
                  value={currentProduct}
                  onChange={(e) => setCurrentProduct(e.target.value)}
                  placeholder="e.g., Organic Compost"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddProduct();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddProduct} 
                  disabled={!currentProduct.trim()}
                  sx={{ minWidth: '50px' }}
                >
                  <AddIcon />
                </Button>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {formData.products.length > 0 
                    ? 'Your products:' 
                    : 'No products added yet. Add some products to continue.'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.products.map((product) => (
                    <Chip
                      key={`product-${product}`}
                      label={product}
                      onDelete={() => handleRemoveProduct(product)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Review your information before submitting. You'll be able to edit this later.
                </Typography>
              </Alert>
            </Box>
          </Fade>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={!isSubmitting ? onClose : undefined}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Slide direction="up" in={open}>
        <Box sx={{
          width: { xs: '90%', sm: 600 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Add New Supplier
            </Typography>
            <IconButton onClick={onClose} disabled={isSubmitting} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Supplier added successfully!
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', mb: 3 }}>
              {[0, 1, 2].map((step) => (
                <Box
                  key={step}
                  sx={{
                    flex: 1,
                    height: 4,
                    bgcolor: step <= activeStep ? 'primary.main' : 'grey.300',
                    mr: step < 2 ? 1 : 0,
                    borderRadius: 1,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
            
            <Typography sx={{ mb: 1 }} color="text.secondary">
              Step {activeStep + 1} of 3
            </Typography>
          </Box>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (activeStep === 2) {
              handleSubmit(e);
            } else {
              handleNext();
            }
          }}>
            {getStepContent(activeStep)}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? onClose : handleBack}
                disabled={isSubmitting}
              >
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={20} />}
              >
                {isSubmitting
                  ? 'Submitting...'
                  : activeStep === 2
                  ? 'Submit'
                  : 'Continue'}
              </Button>
            </Box>
          </form>
        </Box>
      </Slide>
    </Modal>
  );
};

export default AddMarketForm;