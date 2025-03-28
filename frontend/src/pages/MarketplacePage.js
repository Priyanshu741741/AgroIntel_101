import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, TextField, Button, Rating, Box, AppBar, Tabs, Tab } from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon, Add as AddIcon } from '@mui/icons-material';
import AddMarketForm from '../components/marketplace/AddMarketForm';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './MarketplacePage.css';

const mockSuppliers = [
  {
    id: 1,
    name: 'Organic Fertilizers Co.',
    description: 'Premium organic fertilizers for all crop types',
    rating: 4.5,
    location: 'Mumbai, India',
    products: ['Organic Compost', 'Bio-Fertilizer'],
    price_range: '₹500 - ₹2000'
  },
  {
    id: 2,
    name: 'Green Earth Solutions',
    description: 'Sustainable farming inputs and solutions',
    rating: 4.8,
    location: 'Delhi, India',
    products: ['Vermicompost', 'Neem Oil Spray'],
    price_range: '₹300 - ₹1500'
  }
];

const MarketplacePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [location, setLocation] = useState(null);
  const [isAddMarketOpen, setIsAddMarketOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Listen for auth state changes
      const unsubscribe = auth?.onAuthStateChanged?.(user => {
        setCurrentUser(user);
      }) || (() => {});

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }

      return () => {
        try {
          unsubscribe();
        } catch (e) {
          console.error("Error unsubscribing from auth:", e);
        }
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setAuthError("Failed to initialize authentication");
    }
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Filter suppliers based on search term
    const filtered = mockSuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
      supplier.products.some(product =>
        product.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
    setSuppliers(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAddMarket = () => {
    if (!currentUser && auth) {
      navigate('/login');
      return;
    }
    setIsAddMarketOpen(true);
  };

  const handleMarketSubmit = (newMarket) => {
    setSuppliers(prevSuppliers => [...prevSuppliers, newMarket]);
    setIsAddMarketOpen(false);
  };

  return (
    <div className="agrointel-marketplace">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" className="marketplace-title animate-text">
            Sustainable Input Marketplace
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddMarket} 
              sx={{ mr: 2 }}
              startIcon={<AddIcon />}
              className="marketplace-button"
            >
              Add New Market
            </Button>
          </Box>
        </Box>

        {authError && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography color="error">{authError}</Typography>
            <Typography variant="body2">
              Firebase authentication is currently unavailable. Some features may be limited.
            </Typography>
          </Box>
        )}

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }} className="search-container animate-in" style={{ animationDelay: '0.2s' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for suppliers or products..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 2 }}
          />

          <AppBar position="static" color="default" sx={{ borderRadius: 1 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="All Products" />
              <Tab label="Organic Fertilizers" />
              <Tab label="Bio Pesticides" />
              <Tab label="Seeds" />
            </Tabs>
          </AppBar>
        </Box>

        {/* Suppliers Grid */}
        <Grid container spacing={3}>
          {suppliers.map((supplier, index) => (
            <Grid item xs={12} sm={6} md={4} key={supplier.id} className="supplier-card-container" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <Card sx={{ height: '100%' }} className="supplier-card">
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {supplier.name}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {supplier.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {supplier.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={supplier.rating} precision={0.5} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({supplier.rating})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Products: {supplier.products.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price Range: {supplier.price_range}
                  </Typography>
                  <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} className="contact-button">
                    Contact Supplier
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <AddMarketForm 
          open={isAddMarketOpen} 
          onClose={() => setIsAddMarketOpen(false)} 
          onSubmit={handleMarketSubmit}
        />
      </Container>
    </div>
  );
};

export default MarketplacePage;