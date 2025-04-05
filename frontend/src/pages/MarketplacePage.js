import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, TextField, Button, Rating, Box, AppBar, Tabs, Tab, Chip, Fade, Grow, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon, Add as AddIcon, FilterList as FilterIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Phone as PhoneIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import AddMarketForm from '../components/marketplace/AddMarketForm';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './MarketplacePage.css';

// Enhanced mock data with more details
const mockSuppliers = [
  {
    id: 1,
    name: 'Organic Fertilizers Co.',
    description: 'Premium organic fertilizers for all crop types. We offer high-quality compost made from plant materials that enhance soil health.',
    rating: 4.5,
    location: 'Mumbai, India',
    products: ['Organic Compost', 'Bio-Fertilizer', 'Vermicompost'],
    price_range: '₹500 - ₹2000',
    contact: '+91 9876543210',
    category: 'Organic Fertilizers',
    image: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    featured: true
  },
  {
    id: 2,
    name: 'Green Earth Solutions',
    description: 'Sustainable farming inputs and solutions. Our products are eco-friendly and designed to boost crop yield without harming the environment.',
    rating: 4.8,
    location: 'Delhi, India',
    products: ['Vermicompost', 'Neem Oil Spray', 'Organic Soil Mix'],
    price_range: '₹300 - ₹1500',
    contact: '+91 9876543211',
    category: 'Organic Fertilizers',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    featured: true
  },
  {
    id: 3,
    name: 'EcoPest Control',
    description: 'Natural pest control solutions that are safe for beneficial insects and the environment while effectively managing harmful pests.',
    rating: 4.3,
    location: 'Bangalore, India',
    products: ['Neem Extract', 'Biological Pest Control', 'Insect Traps'],
    price_range: '₹250 - ₹1800',
    contact: '+91 9876543212',
    category: 'Bio Pesticides',
    image: 'https://images.unsplash.com/photo-1589928358955-14a9d4a6d303?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    featured: false
  },
  {
    id: 4,
    name: 'Seed Vault India',
    description: 'Premium quality seeds for various crops with high germination rates. We focus on indigenous and heirloom varieties.',
    rating: 4.6,
    location: 'Chennai, India',
    products: ['Organic Seeds', 'Heirloom Varieties', 'High-Yield Hybrid Seeds'],
    price_range: '₹100 - ₹1000',
    contact: '+91 9876543213',
    category: 'Seeds',
    image: 'https://images.unsplash.com/photo-1574943320219-89fde309bc12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    featured: true
  },
  {
    id: 5,
    name: 'BioDrip Irrigation',
    description: 'Modern irrigation solutions that conserve water while ensuring optimal plant hydration. Our systems are easy to install and maintain.',
    rating: 4.2,
    location: 'Hyderabad, India',
    products: ['Drip Irrigation Systems', 'Sprinklers', 'Water Sensors'],
    price_range: '₹2000 - ₹10000',
    contact: '+91 9876543214',
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1463123081488-789f998ac9c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
    featured: false
  }
];

// Product categories
const CATEGORIES = [
  'All Products',
  'Organic Fertilizers',
  'Bio Pesticides',
  'Seeds',
  'Equipment'
];

const MarketplacePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [location, setLocation] = useState(null);
  const [isAddMarketOpen, setIsAddMarketOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isContactOpen, setIsContactOpen] = useState(null);
  const navigate = useNavigate();

  // Initialize data
  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setFilteredSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);

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

      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('marketplace_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
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

  // Filter suppliers whenever tab, search term, or featured filter changes
  useEffect(() => {
    let result = suppliers;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.products.some(product =>
          product.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Filter by category
    if (selectedTab > 0) {
      const category = CATEGORIES[selectedTab];
      result = result.filter(supplier => supplier.category === category);
    }
    
    // Filter by featured status
    if (showFeaturedOnly) {
      result = result.filter(supplier => supplier.featured);
    }
    
    setFilteredSuppliers(result);
  }, [suppliers, searchTerm, selectedTab, showFeaturedOnly]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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
    // Add image and category
    const enhancedMarket = {
      ...newMarket,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
      category: CATEGORIES[selectedTab],
      featured: false
    };
    
    setSuppliers(prevSuppliers => [...prevSuppliers, enhancedMarket]);
    setSuccessMessage('New supplier added successfully!');
    setIsAddMarketOpen(false);
  };

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(fav => fav !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
    
    // Save to localStorage
    localStorage.setItem('marketplace_favorites', JSON.stringify(
      favorites.includes(id) 
        ? favorites.filter(fav => fav !== id)
        : [...favorites, id]
    ));
  };

  const toggleFeaturedFilter = () => {
    setShowFeaturedOnly(!showFeaturedOnly);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  const toggleContact = (id) => {
    setIsContactOpen(isContactOpen === id ? null : id);
  };

  return (
    <div className="agrointel-marketplace">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }} className="marketplace-title-container">
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
              Add New Supplier
            </Button>
          </Box>
        </Box>

        {authError && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setAuthError(null)}>
            <Typography fontWeight="medium">{authError}</Typography>
            <Typography variant="body2">
              Firebase authentication is currently unavailable. Some features may be limited.
            </Typography>
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }} className="search-container animate-in" style={{ animationDelay: '0.2s' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for suppliers or products..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button 
              variant={showFeaturedOnly ? "contained" : "outlined"} 
              color="primary" 
              onClick={toggleFeaturedFilter}
              startIcon={<FilterIcon />}
              sx={{ minWidth: '180px' }}
            >
              {showFeaturedOnly ? "Show All" : "Featured Only"}
            </Button>
          </Box>

          <AppBar position="static" color="default" sx={{ borderRadius: 1 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {CATEGORIES.map((category, index) => (
                <Tab key={category} label={category} />
              ))}
            </Tabs>
          </AppBar>
        </Box>

        {/* Loading indicator or results count */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Showing {filteredSuppliers.length} suppliers
              {selectedTab > 0 ? ` in ${CATEGORIES[selectedTab]}` : ''}
              {showFeaturedOnly ? ' (featured only)' : ''}
            </Typography>
          </Box>
        )}

        {/* Suppliers Grid */}
        <Grid container spacing={3}>
          {filteredSuppliers.length === 0 && !loading ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary">
                No suppliers found matching your criteria
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTab(0);
                  setShowFeaturedOnly(false);
                }}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            filteredSuppliers.map((supplier, index) => (
              <Grow 
                in={true} 
                style={{ transformOrigin: '0 0 0' }}
                timeout={500 + (index * 100)}
                key={supplier.id}
              >
                <Grid item xs={12} sm={6} md={4} className="supplier-card-container">
                  <Card sx={{ height: '100%' }} className="supplier-card">
                    <Box className="supplier-card-image" sx={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={supplier.image} 
                        alt={supplier.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box 
                        onClick={() => toggleFavorite(supplier.id)}
                        className="favorite-icon"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: 'white',
                          borderRadius: '50%',
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        {favorites.includes(supplier.id) ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </Box>
                      {supplier.featured && (
                        <Chip 
                          label="Featured" 
                          color="primary" 
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            bottom: 10, 
                            left: 10,
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {supplier.name}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom className="supplier-description">
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
                      <Box sx={{ mb: 2 }}>
                        {supplier.products.map((product, idx) => (
                          <Chip 
                            key={`${supplier.id}-${idx}`}
                            label={product}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Price Range:</strong> {supplier.price_range}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth 
                          className="contact-button"
                          onClick={() => toggleContact(supplier.id)}
                          startIcon={<PhoneIcon />}
                        >
                          Contact Supplier
                        </Button>
                        
                        {isContactOpen === supplier.id && (
                          <Fade in={true}>
                            <Box className="contact-info" sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                              <Typography variant="body2" gutterBottom><strong>Phone:</strong> {supplier.contact}</Typography>
                              <Button 
                                variant="outlined" 
                                color="success" 
                                fullWidth 
                                size="small"
                                sx={{ mt: 1 }}
                                startIcon={<WhatsAppIcon />}
                                onClick={() => window.open(`https://wa.me/${supplier.contact.replace(/\D/g,'')}`)}
                              >
                                WhatsApp
                              </Button>
                            </Box>
                          </Fade>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grow>
            ))
          )}
        </Grid>

        <AddMarketForm 
          open={isAddMarketOpen} 
          onClose={() => setIsAddMarketOpen(false)} 
          onSubmit={handleMarketSubmit}
        />
        
        <Snackbar 
          open={!!successMessage} 
          autoHideDuration={6000} 
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default MarketplacePage;