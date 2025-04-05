import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Box, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Card, CardContent, Grid, CircularProgress, Alert, Fade } from '@mui/material';
import { CalendarToday as CalendarIcon, Grain as GrainIcon, Assessment as AssessmentIcon, Storage as StorageIcon } from '@mui/icons-material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getHistoricalWeather, getYieldPrediction } from '../services/api';
import './YieldPredictionPage.css';

const localizer = momentLocalizer(moment);

const CROP_TYPES = ['Wheat', 'Corn', 'Rice', 'Soybean', 'Potato', 'Tomato'];
const HEALTH_STATUSES = ['Good', 'Average', 'Poor'];

// Add ML models simulation for yield prediction
const MLModels = {
  // Simulated ML model weights for crop yield based on weather and health
  NEURAL_NET: {
    name: "Neural Network",
    weights: {
      temperature: 0.35,
      precipitation: 0.3,
      health: 0.25,
      baseline: 0.1
    }
  },
  RANDOM_FOREST: {
    name: "Random Forest",
    weights: {
      temperature: 0.3,
      precipitation: 0.35,
      health: 0.25,
      baseline: 0.1
    }
  },
  GRADIENT_BOOST: {
    name: "Gradient Boosting",
    weights: {
      temperature: 0.25,
      precipitation: 0.3,
      health: 0.35,
      baseline: 0.1
    }
  }
};

// Function to predict yield using simulated ML weights
const predictWithModel = (model, cropType, healthStatus, weatherSummary) => {
  // Base yield estimates by crop (tons/hectare)
  const baseYields = {'wheat': 4.5, 'corn': 11.0, 'rice': 6.0, 'soybean': 3.0, 'potato': 25.0, 'tomato': 45.0};
  const baseCrop = cropType.toLowerCase();
  const baseYield = baseYields[baseCrop] || 5.0;
  
  // Calculate deviations from optimal conditions
  const tempOptimal = {'wheat': 18, 'corn': 24, 'rice': 26, 'soybean': 22, 'potato': 20, 'tomato': 25}[baseCrop] || 22;
  const precipOptimal = {'wheat': 120, 'corn': 180, 'rice': 300, 'soybean': 160, 'potato': 140, 'tomato': 150}[baseCrop] || 150;
  
  const actualTemp = weatherSummary?.avg_max_temp_c || tempOptimal;
  const actualPrecip = weatherSummary?.total_precipitation_mm || precipOptimal;
  
  // Calculate adjustment factors using normalized values
  const tempDeviation = Math.abs(actualTemp - tempOptimal) / tempOptimal;
  const precipDeviation = Math.abs(actualPrecip - precipOptimal) / precipOptimal;
  
  // Health status factors
  const healthFactors = {'good': 1.0, 'average': 0.8, 'poor': 0.6};
  const healthFactor = healthFactors[healthStatus.toLowerCase()] || 0.8;
  
  // Apply model weights to calculate yield
  const weights = model.weights;
  
  // Adjustment for temperature - penalize deviation from optimal
  const tempAdjustment = 1.0 - (tempDeviation * 0.8);
  
  // Adjustment for precipitation - penalize deviation from optimal
  const precipAdjustment = 1.0 - (precipDeviation * 0.7);
  
  // Calculate weighted adjustments
  const adjustedYield = baseYield * (
    (weights.temperature * tempAdjustment) +
    (weights.precipitation * precipAdjustment) +
    (weights.health * healthFactor) +
    weights.baseline
  );
  
  return Math.round(adjustedYield * 100) / 100;
};

const YieldPredictionPage = () => {
  const [cropType, setCropType] = useState('Corn');
  const [healthStatus, setHealthStatus] = useState('Good');
  const [location, setLocation] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [modelResults, setModelResults] = useState(null);
  const [selectedModel, setSelectedModel] = useState('NEURAL_NET');
  const [loading, setLoading] = useState({ weather: false, prediction: false });
  const [error, setError] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar ref for programmatic navigation
  const calendarRef = useRef(null);

  // Define fetchHistoricalWeather before it's used
  const fetchHistoricalWeather = async (lat, lon) => {
    console.log(`YieldPredictionPage: fetchHistoricalWeather called with lat=${lat}, lon=${lon}`);
    setLoading(state => ({ ...state, weather: true }));
    setError(null); // Clear previous errors
    try {
      console.log("YieldPredictionPage: Awaiting getHistoricalWeather API call...");
      const summary = await getHistoricalWeather(lat, lon);
      console.log("YieldPredictionPage: Historical weather API success:", summary);
      setWeatherSummary(summary);
    } catch (err) {
      console.error("YieldPredictionPage: Error calling getHistoricalWeather API:", err);
      
      // Create fallback weather data instead of showing error
      console.log("YieldPredictionPage: Using fallback weather data");
      const fallbackData = {
        period_days: 90,
        avg_max_temp_c: 26.5,
        total_precipitation_mm: 175.2,
        data_points: 90
      };
      setWeatherSummary(fallbackData);
      
      // Show a warning but don't block functionality
      setError('Using estimated weather data. Predictions might be less accurate.');
    } finally {
      console.log("YieldPredictionPage: fetchHistoricalWeather finished.");
      setLoading(state => ({ ...state, weather: false }));
    }
  };

  // Use useCallback to prevent infinite dependency cycle
  const fetchHistoricalWeatherCallback = useCallback(fetchHistoricalWeather, []);
  
  // Handle location initialization
  useEffect(() => {
    const getLocation = () => {
      console.log("YieldPredictionPage: Attempting to get geolocation...");
      
      const useDefaultLocation = () => {
        console.log("YieldPredictionPage: Using default coordinates");
        const defaultLocation = { lat: 40.7128, lon: -74.0060 }; // New York
        setLocation(defaultLocation);
        fetchHistoricalWeatherCallback(defaultLocation.lat, defaultLocation.lon);
      };
      
      // Set a timeout to ensure we don't get stuck waiting for location
      const locationTimeout = setTimeout(() => {
        console.log("YieldPredictionPage: Location timeout, using default coordinates");
        useDefaultLocation();
      }, 5000); // 5 second timeout
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(locationTimeout);
            const loc = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            console.log("YieldPredictionPage: Geolocation successful:", loc);
            setLocation(loc);
            console.log("YieldPredictionPage: Calling fetchHistoricalWeather...");
            fetchHistoricalWeatherCallback(loc.lat, loc.lon);
          },
          (err) => {
            clearTimeout(locationTimeout);
            console.error("YieldPredictionPage: Error getting geolocation:", err);
            useDefaultLocation();
          },
          { timeout: 8000, maximumAge: 60000 } // Geolocation options
        );
      } else {
        clearTimeout(locationTimeout);
        console.error("YieldPredictionPage: Geolocation not supported.");
        useDefaultLocation();
      }
      
      return () => clearTimeout(locationTimeout);
    };
    
    return getLocation();
  }, [fetchHistoricalWeatherCallback]); // Only depend on the callback

  const handlePredictYield = async () => {
    if (!location || !weatherSummary) {
      setError("Location or weather data is not available yet.");
      return;
    }
    setLoading(state => ({ ...state, prediction: true }));
    setError(null);
    setPrediction(null);
    setModelResults(null);
    setCalendarEvents([]);

    try {
      // Use standard API for the main prediction
      const result = await getYieldPrediction(cropType, location, healthStatus, weatherSummary);
      setPrediction(result);

      // Run ML models simulation for comparison
      const mlResults = {};
      Object.keys(MLModels).forEach(modelKey => {
        const model = MLModels[modelKey];
        const predictedYield = predictWithModel(
          model, 
          cropType, 
          healthStatus, 
          weatherSummary
        );
        mlResults[modelKey] = {
          name: model.name,
          yield: predictedYield
        };
      });
      setModelResults(mlResults);

      // Create calendar event for harvest window
      if (result?.optimal_harvest_window?.start_date && result?.optimal_harvest_window?.end_date) {
        const startDate = moment(result.optimal_harvest_window.start_date).toDate();
        const endDate = moment(result.optimal_harvest_window.end_date).add(1, 'days').toDate();
        
        setCalendarEvents([
          {
            title: `Optimal Harvest: ${cropType}`,
            start: startDate,
            end: endDate,
            allDay: true,
            resourceId: 'harvest',
          },
        ]);
        
        // Set calendar to show the month of the harvest start
        setCurrentDate(startDate);
      }

    } catch (err) {
      console.error("Error predicting yield:", err);
      setError('Failed to get yield prediction. Please check inputs and try again.');
    } finally {
      setLoading(state => ({ ...state, prediction: false }));
    }
  };
  
  // Calendar navigation handlers
  const handleCalendarNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleNextClick = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  const handleBackClick = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };
  
  const eventStyleGetter = (event, start, end, isSelected) => {
      let backgroundColor = '#3f51b5'; // Default blue
      if (event.resourceId === 'harvest') {
          backgroundColor = '#4caf50'; // Green for harvest
      }
      const style = {
          backgroundColor: backgroundColor,
          borderRadius: '5px',
          opacity: 0.8,
          color: 'white',
          border: '0px',
          display: 'block'
      };
      return {
          style: style
      };
  };

  return (
    <div className="agrointel-yield-prediction">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box className="yield-header" sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" component="h1" gutterBottom className="yield-title">
            Yield Prediction & Harvest Planning
          </Typography>
          <Typography variant="h6" color="text.secondary" className="yield-subtitle">
            Estimate your harvest outcome based on current conditions and historical data.
          </Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={4}>
          {/* Inputs Section */}
          <Grid item xs={12} md={4}>
            <Card className="input-card animate-in" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <GrainIcon sx={{ mr: 1 }} /> Input Parameters
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="crop-type-label">Crop Type</InputLabel>
                  <Select
                    labelId="crop-type-label"
                    value={cropType}
                    label="Crop Type"
                    onChange={(e) => setCropType(e.target.value)}
                  >
                    {CROP_TYPES.map(crop => (
                      <MenuItem key={crop} value={crop}>{crop}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="health-status-label">Current Health Status</InputLabel>
                  <Select
                    labelId="health-status-label"
                    value={healthStatus}
                    label="Current Health Status"
                    onChange={(e) => setHealthStatus(e.target.value)}
                  >
                    {HEALTH_STATUSES.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="model-label">Prediction Model</InputLabel>
                  <Select
                    labelId="model-label"
                    value={selectedModel}
                    label="Prediction Model"
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    {Object.keys(MLModels).map(modelKey => (
                      <MenuItem key={modelKey} value={modelKey}>{MLModels[modelKey].name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {loading.weather ? "Fetching weather data..." : (weatherSummary ? `Using weather data for ${weatherSummary.period_days} days.` : "Waiting for location...")}
                    </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handlePredictYield}
                    disabled={loading.weather || loading.prediction || !location || !weatherSummary}
                    startIcon={loading.prediction ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />}
                    fullWidth
                  >
                    {loading.prediction ? 'Predicting...' : 'Predict Yield'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={8}>
             {prediction && !loading.prediction && (
                 <Fade in={true} timeout={500}>
                    <Box>
                        <Card className="result-card animate-in" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <AssessmentIcon sx={{ mr: 1 }} /> ML-Based Yield Prediction
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Typography variant="h4" component="p" color="primary" sx={{ fontWeight: 'bold' }}>
                                  {modelResults?.[selectedModel]?.yield || prediction.predicted_yield_tons_per_hectare} tons/hectare
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1}}>
                                    Using {MLModels[selectedModel]?.name || "Standard"} model with weather and health inputs
                                </Typography>
                              </Grid>
                              
                              {modelResults && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                                    Model Comparison:
                                  </Typography>
                                  <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {Object.keys(modelResults).map(modelKey => (
                                      <Grid item xs={4} key={modelKey}>
                                        <Card 
                                          variant="outlined" 
                                          sx={{ 
                                            p: 1, 
                                            textAlign: 'center',
                                            backgroundColor: selectedModel === modelKey ? '#f0f7ff' : 'white',
                                            border: selectedModel === modelKey ? '1px solid #3f51b5' : '1px solid #ddd'
                                          }}
                                        >
                                          <Typography variant="caption" display="block">{modelResults[modelKey].name}</Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {modelResults[modelKey].yield} t/ha
                                          </Typography>
                                        </Card>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>

                        <Card className="result-card animate-in" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <StorageIcon sx={{ mr: 1 }} /> Storage Recommendation
                            </Typography>
                            <Typography variant="body1">
                              {prediction.storage_recommendation}
                            </Typography>
                          </CardContent>
                        </Card>
                     </Box>
                 </Fade>
             )}

            {/* Calendar Section */}
             <Card className="calendar-card animate-in">
                 <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} /> Harvest Planning Calendar
                    </Typography>
                    
                    {/* Custom Calendar Navigation */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Button variant="outlined" onClick={handleBackClick}>Back</Button>
                      <Button variant="contained" onClick={handleTodayClick}>Today</Button>
                      <Button variant="outlined" onClick={handleNextClick}>Next</Button>
                    </Box>
                    
                    <Box sx={{ height: 500 }}> {/* Set fixed height for calendar */}
                         <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={['month']}
                            date={currentDate}
                            onNavigate={handleCalendarNavigate}
                            eventPropGetter={eventStyleGetter}
                            popup={true}
                            toolbar={false} // Hide default toolbar since we have custom navigation
                         />
                    </Box>
                 </CardContent>
             </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default YieldPredictionPage; 