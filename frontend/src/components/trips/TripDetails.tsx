import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trip, TripItem, WeatherData } from '../../types';
import { tripService } from '../../services/tripService';
import { weatherService } from '../../services/weatherService';
import { formatDate, getFishingScoreColor } from '../../utils/helpers';
import Map from '../common/Map';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [forecast, setForecast] = useState<WeatherData | null>(null);
  const [fishingScore, setFishingScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  
  useEffect(() => {
    const loadTripDetails = async () => {
      setLoading(true);
      
      if (!id) {
        navigate('/trips');
        return;
      }
      
      const tripData = tripService.getTripById(id);
      
      if (!tripData) {
        navigate('/trips');
        return;
      }
      
      setTrip(tripData);
      
      // Load weather forecast for the trip date if it has a location
      if (tripData.location) {
        try {
          // In a real app, we would fetch the actual forecast for the specific date
          // For demo purposes, we're just using the current weather
          const weatherData = await weatherService.getCurrentWeather(
            tripData.location.latitude,
            tripData.location.longitude
          );
          
          setForecast(weatherData);
          
          // Calculate fishing score based on weather
          const score = weatherService.getFishingScore(weatherData);
          setFishingScore(score);
        } catch (error) {
          console.error('Error fetching weather data:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadTripDetails();
  }, [id, navigate]);
  
  const handleToggleChecklistItem = (itemId: string) => {
    if (!trip || !id) return;
    
    // Update the item locally first for immediate UI feedback
    const updatedTrip = { 
      ...trip,
      checklist: trip.checklist.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    };
    
    setTrip(updatedTrip);
    
    // Then update in the service
    tripService.toggleChecklistItem(id, itemId);
  };
  
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName.trim() || !trip || !id) return;
    
    const newItem = tripService.addChecklistItem(id, newItemName);
    
    if (newItem) {
      // Update the trip in local state
      setTrip({
        ...trip,
        checklist: [...trip.checklist, newItem]
      });
      
      // Clear the input
      setNewItemName('');
    }
  };
  
  const handleRemoveChecklistItem = (itemId: string) => {
    if (!trip || !id) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to remove this item?')) {
      return;
    }
    
    // Update locally first
    const updatedTrip = {
      ...trip,
      checklist: trip.checklist.filter(item => item.id !== itemId)
    };
    
    setTrip(updatedTrip);
    
    // Then update in the service
    tripService.removeChecklistItem(id, itemId);
  };
  
  const handleDeleteTrip = () => {
    if (!id || !window.confirm('Are you sure you want to delete this trip?')) return;
    
    tripService.deleteTrip(id);
    navigate('/trips');
  };
  
  if (loading) {
    return <div className="loading">Loading trip details...</div>;
  }
  
  if (!trip) {
    return <div className="error">Trip not found</div>;
  }
  
  const isUpcoming = new Date(trip.date) >= new Date();
  
  return (
    <div className="trip-details">
      <div className="page-header">
        <h2>{trip.name}</h2>
        <div className="trip-date">
          <strong>Date:</strong> {formatDate(trip.date)}
          {!isUpcoming && <span className="past-trip-badge">Past Trip</span>}
        </div>
      </div>
      
      <div className="trip-content">
        <div className="trip-main">
          <div className="card">
            <h3 className="card-title">Location</h3>
            {trip.location ? (
              <div className="location-details">
                <h4>{trip.location.name}</h4>
                <p>Coordinates: {trip.location.latitude.toFixed(4)}, {trip.location.longitude.toFixed(4)}</p>
                {trip.location.notes && <p>{trip.location.notes}</p>}
                
                <div className="map-container">
                  <Map
                    locations={[trip.location]}
                    selectedLocationId={trip.location.id}
                    center={[trip.location.latitude, trip.location.longitude]}
                    zoom={12}
                    interactive={false}
                    height="300px"
                  />
                </div>
              </div>
            ) : (
              <p>No location specified for this trip.</p>
            )}
          </div>
          
          {trip.notes && (
            <div className="card">
              <h3 className="card-title">Notes</h3>
              <p className="trip-notes">{trip.notes}</p>
            </div>
          )}
          
          {forecast && (
            <div className="card">
              <h3 className="card-title">Weather Forecast</h3>
              <div className="weather-preview">
                <div className="weather-main">
                  <div className="weather-temp">{Math.round(forecast.temperature)}°F</div>
                  <div className="weather-condition">{forecast.conditions}</div>
                </div>
                
                <div className="weather-details">
                  <div>Wind: {forecast.windSpeed} mph {forecast.windDirection}</div>
                  <div>Pressure: {forecast.pressure} hPa</div>
                  <div>Humidity: {forecast.humidity}%</div>
                </div>
                
                {fishingScore !== null && (
                  <div className="fishing-score-container">
                    <h4>Fishing Conditions</h4>
                    <div 
                      className="fishing-score" 
                      style={{ color: getFishingScoreColor(fishingScore) }}
                    >
                      <span className="score-value">{fishingScore}</span>
                      <span className="score-label">/100</span>
                    </div>
                    <p className="score-description">
                      {fishingScore >= 80 && 'Excellent fishing conditions!'}
                      {fishingScore >= 60 && fishingScore < 80 && 'Good fishing conditions.'}
                      {fishingScore >= 40 && fishingScore < 60 && 'Average fishing conditions.'}
                      {fishingScore >= 20 && fishingScore < 40 && 'Below average fishing conditions.'}
                      {fishingScore < 20 && 'Poor fishing conditions.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="trip-sidebar">
          <div className="card checklist-card">
            <h3 className="card-title">Trip Checklist</h3>
            
            <div className="checklist-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${(trip.checklist.filter(item => item.checked).length / trip.checklist.length) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="progress-text">
                {trip.checklist.filter(item => item.checked).length} of {trip.checklist.length} items packed
              </div>
            </div>
            
            <div className="checklist">
              {trip.checklist.map(item => (
                <div key={item.id} className="checklist-item">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleChecklistItem(item.id)}
                    />
                    <span className="checkmark"></span>
                    <span className="item-name">{item.name}</span>
                  </label>
                  <button 
                    className="remove-item-btn"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddChecklistItem} className="add-item-form">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add new item..."
                className="form-input"
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
          </div>
          
          <div className="trip-actions">
            <Link to={`/trips/edit/${id}`} className="btn btn-primary">Edit Trip</Link>
            <button onClick={handleDeleteTrip} className="btn btn-danger">Delete Trip</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;