const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_OPENWEATHER_API_KEY';

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Fishing Companion API is working!' });
});

// Weather API proxy routes - ADDED &units=imperial
app.get('/api/weather/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    });
  }
});

app.get('/api/forecast/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch forecast data',
      details: error.message 
    });
  }
});

// Simplified sun data endpoint
app.get('/api/sun/:lat/:lon/:date', async (req, res) => {
  const { lat, lon, date } = req.params;
  
  try {
    const response = await axios.get(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`
    );
    
    const dateObj = new Date(date);
    const phaseCalculation = ((dateObj.getTime() / 86400000) % 29.5) / 29.5;
    
    res.json({
      sunrise: response.data.results.sunrise.split('T')[1].split('+')[0],
      sunset: response.data.results.sunset.split('T')[1].split('+')[0],
      moonPhase: phaseCalculation
    });
  } catch (error) {
    console.error('Error fetching sun data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch sun data',
      details: error.message 
    });
  }
});

// Simplified tides endpoint
app.get('/api/tides/:lat/:lon/:date', (req, res) => {
  const { lat, lon, date } = req.params;
  
  const isCoastal = Math.abs(Math.abs(lon) - 123) < 3 || 
                    Math.abs(Math.abs(lon) - 74) < 3;
  
  if (!isCoastal) {
    return res.status(404).json({ error: 'No tide data available for inland locations' });
  }
  
  const tides = [
    { time: '03:42:00', height: 1.2, type: 'low' },
    { time: '09:56:00', height: 4.5, type: 'high' },
    { time: '16:12:00', height: 0.8, type: 'low' },
    { time: '22:24:00', height: 3.9, type: 'high' }
  ];
  
  res.json(tides);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});