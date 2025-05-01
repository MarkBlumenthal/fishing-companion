import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setCurrentWeather, 
  setForecast, 
  setTides, 
  setSunData,
  setLoading, 
  setError 
} from '../../store/slices/weatherSlice';
import { Location } from '../../types';
import { weatherService } from '../../services/weatherService';
import { tripService } from '../../services/tripService';
import { 
  formatDate, 
  formatTime, 
  kelvinToFahrenheit, 
  getFishingScoreColor,
  getMoonPhaseName
} from '../../utils/helpers';
import Map from '../common/Map';

// Chart component for visualizing forecast data
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const WeatherForecast: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    currentWeather, 
    forecast, 
    tides, 
    sunData, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.weather);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [fishingScores, setFishingScores] = useState<{ date: string; score: number }[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.8781, -87.6298]); // Default: Chicago
  
  useEffect(() => {
    const loadWeatherData = async () => {
      dispatch(setLoading(true));
      
      // Load saved locations from trip service
      const locations = tripService.getAllLocations();
      setSavedLocations(locations);
      
      // If we already have a location selected or no saved locations, try to get user's current location
      if (!selectedLocation && locations.length === 0) {
        // For simplicity, we're using a default location
        // In a real app, we would use the browser's geolocation API
        const defaultLocation = {
          id: 'current',
          name: 'Current Location',
          latitude: 41.8781,
          longitude: -87.6298,
          notes: 'Default location (Chicago)',
        };
        
        setSelectedLocation(defaultLocation);
        await fetchWeatherData(defaultLocation.latitude, defaultLocation.longitude);
      }
      
      dispatch(setLoading(false));
    };
    
    loadWeatherData();
  }, [dispatch]);
  
  // Fetch weather data for a location
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    try {
      // Fetch current weather
      const weather = await weatherService.getCurrentWeather(latitude, longitude);
      dispatch(setCurrentWeather(weather));
      
      // Fetch forecast
      const forecastData = await weatherService.getForecast(latitude, longitude);
      dispatch(setForecast(forecastData));
      
      // Calculate fishing scores for each day
      const scores = forecastData.map(day => ({
        date: day.date,
        score: weatherService.getFishingScore(day)
      }));
      setFishingScores(scores);
      
      // Fetch sun and moon data for the next few days
      const today = new Date().toISOString().split('T')[0];
      const sunDataResponse = await weatherService.getSunData(latitude, longitude, today);
      dispatch(setSunData([sunDataResponse]));
      
      // Fetch tide data if location is coastal (would need more complex logic in a real app)
      try {
        const tideData = await weatherService.getTides(latitude, longitude, today);
        dispatch(setTides(tideData));
      } catch (error) {
        // This can fail for non-coastal locations, which is expected
        console.log('No tide data available for this location');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      dispatch(setError('Failed to fetch weather data. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);
    fetchWeatherData(location.latitude, location.longitude);
  };
  
  // Get color based on temperature
  const getTemperatureColor = (temp: number): string => {
    if (temp > 90) return '#d32f2f'; // Hot (red)
    if (temp > 80) return '#ff9800'; // Warm (orange)
    if (temp > 70) return '#4caf50'; // Mild (green)
    if (temp > 50) return '#2196f3'; // Cool (blue)
    return '#673ab7'; // Cold (purple)
  };
  
  // Format data for temperature chart
  const temperatureChartData = forecast.map(day => ({
    date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
    temperature: Math.round(day.temperature),
  }));
  
  // Format data for fishing score chart
  const fishingScoreChartData = fishingScores.map(day => ({
    date: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
    score: day.score,
  }));
  
  return (
    <div className="weather-forecast">
      <div className="page-header">
        <h2>Weather & Fishing Conditions</h2>
      </div>
      
      <div className="location-selection">
        <h3>Select Location</h3>
        
        <div className="saved-locations">
          {savedLocations.length === 0 ? (
            <p>No saved locations. Add some in the Trip Planner.</p>
          ) : (
            <div className="location-list">
              {savedLocations.map(location => (
                <button
                  key={location.id}
                  className={`location-btn ${selectedLocation?.id === location.id ? 'active' : ''}`}
                  onClick={() => handleLocationSelect(location)}
                >
                  {location.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="map-container">
          <Map
            locations={savedLocations}
            selectedLocationId={selectedLocation?.id}
            center={mapCenter}
            zoom={8}
            onLocationSelect={handleLocationSelect}
            height="250px"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading weather data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : !currentWeather ? (
        <div className="no-data-message">
          <p>Select a location to view weather and fishing conditions.</p>
        </div>
      ) : (
        <div className="weather-data">
          <div className="current-conditions card">
            <h3>Current Conditions</h3>
            
            <div className="current-weather">
              <div className="weather-main">
                <div 
                  className="temperature" 
                  style={{ color: getTemperatureColor(Math.round(currentWeather.temperature)) }}
                >
                  {Math.round(currentWeather.temperature)}°F
                </div>
                <div className="conditions">{currentWeather.conditions}</div>
              </div>
              
              <div className="weather-details">
                <div className="weather-detail">
                  <span className="label">Wind:</span>
                  <span className="value">{currentWeather.windSpeed} mph {currentWeather.windDirection}</span>
                </div>
                <div className="weather-detail">
                  <span className="label">Pressure:</span>
                  <span className="value">{currentWeather.pressure} hPa</span>
                </div>
                <div className="weather-detail">
                  <span className="label">Humidity:</span>
                  <span className="value">{currentWeather.humidity}%</span>
                </div>
                <div className="weather-detail">
                  <span className="label">Precipitation:</span>
                  <span className="value">{currentWeather.precipitation} mm</span>
                </div>
              </div>
              
              {fishingScores.length > 0 && (
                <div className="fishing-conditions">
                  <h4>Fishing Conditions</h4>
                  <div 
                    className="fishing-score" 
                    style={{ color: getFishingScoreColor(fishingScores[0].score) }}
                  >
                    <span className="score-value">{fishingScores[0].score}</span>
                    <span className="score-label">/100</span>
                  </div>
                  <div className="fishing-rating">
                    {fishingScores[0].score >= 80 && 'Excellent'}
                    {fishingScores[0].score >= 60 && fishingScores[0].score < 80 && 'Good'}
                    {fishingScores[0].score >= 40 && fishingScores[0].score < 60 && 'Average'}
                    {fishingScores[0].score >= 20 && fishingScores[0].score < 40 && 'Below Average'}
                    {fishingScores[0].score < 20 && 'Poor'}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="forecast-section">
            <div className="card temperature-forecast">
              <h3>Temperature Forecast</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={temperatureChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: '°F', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}°F`, 'Temperature']} />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#2196f3" 
                      activeDot={{ r: 8 }} 
                      name="Temperature"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card fishing-score-forecast">
              <h3>Fishing Conditions Forecast</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={fishingScoreChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}/100`, 'Fishing Score']} />
                    <Bar 
                      dataKey="score" 
                      name="Fishing Score"
                      fill="#4caf50"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {sunData.length > 0 && (
            <div className="card sun-moon-data">
              <h3>Sun & Moon</h3>
              
              <div className="sun-moon-container">
                <div className="sun-data">
                  <div className="data-item">
                    <span className="label">Sunrise:</span>
                    <span className="value">{formatTime(sunData[0].sunrise)}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Sunset:</span>
                    <span className="value">{formatTime(sunData[0].sunset)}</span>
                  </div>
                  <div className="daylight">
                    <span className="label">Daylight:</span>
                    <span className="value">
                      {(() => {
                        const sunrise = new Date(`1970-01-01T${sunData[0].sunrise}`);
                        const sunset = new Date(`1970-01-01T${sunData[0].sunset}`);
                        const diff = sunset.getTime() - sunrise.getTime();
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        return `${hours}h ${minutes}m`;
                      })()}
                    </span>
                  </div>
                </div>
                
                <div className="moon-data">
                  <div className="data-item">
                    <span className="label">Moon Phase:</span>
                    <span className="value">{getMoonPhaseName(sunData[0].moonPhase)}</span>
                  </div>
                  <div className="moon-phase-visual">
                    {/* Visual representation of moon phase would go here in a real app */}
                    {sunData[0].moonPhase === 0 && '🌑'}
                    {sunData[0].moonPhase > 0 && sunData[0].moonPhase < 0.25 && '🌒'}
                    {sunData[0].moonPhase === 0.25 && '🌓'}
                    {sunData[0].moonPhase > 0.25 && sunData[0].moonPhase < 0.5 && '🌔'}
                    {sunData[0].moonPhase === 0.5 && '🌕'}
                    {sunData[0].moonPhase > 0.5 && sunData[0].moonPhase < 0.75 && '🌖'}
                    {sunData[0].moonPhase === 0.75 && '🌗'}
                    {sunData[0].moonPhase > 0.75 && '🌘'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {tides.length > 0 && (
            <div className="card tide-data">
              <h3>Tide Information</h3>
              
              <div className="tide-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Height</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tides.map((tide, index) => (
                      <tr key={index}>
                        <td>{formatTime(tide.time)}</td>
                        <td>{tide.type === 'high' ? 'High Tide' : 'Low Tide'}</td>
                        <td>{tide.height.toFixed(1)} ft</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="card fishing-tips">
            <h3>Fishing Tips Based on Conditions</h3>
            
            <div className="tips-container">
              <div className="tip">
                <h4>Best Times to Fish Today</h4>
                <p>
                  {sunData.length > 0 && (
                    <>
                      Early morning (around {formatTime(sunData[0].sunrise)}) and 
                      evening (around {formatTime(sunData[0].sunset)}) typically provide
                      the best fishing conditions.
                    </>
                  )}
                </p>
              </div>
              
              <div className="tip">
                <h4>Weather Considerations</h4>
                <p>
                  Current conditions: {currentWeather.conditions.toLowerCase()} with 
                  winds at {currentWeather.windSpeed} mph.
                  {currentWeather.windSpeed > 15 
                    ? " The higher winds might make fishing challenging. Consider fishing in sheltered areas."
                    : " These wind conditions are generally favorable for fishing."
                  }
                </p>
              </div>
              
              <div className="tip">
                <h4>Pressure Trends</h4>
                <p>
                  Barometric pressure is {currentWeather.pressure} hPa.
                  {currentWeather.pressure > 1013 
                    ? " High pressure generally means clear conditions but potentially less fish activity."
                    : " Lower pressure might indicate approaching weather changes, which can trigger feeding activity."
                  }
                </p>
              </div>
              
              {tides.length > 0 && (
                <div className="tip">
                  <h4>Tide Considerations</h4>
                  <p>
                    Fish are often more active during tidal changes. 
                    The next tidal change will be at {
                      formatTime(tides[0].time)
                    } ({tides[0].type === 'high' ? 'high' : 'low'} tide).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;