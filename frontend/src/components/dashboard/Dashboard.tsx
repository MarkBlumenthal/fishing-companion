import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../store';
import { setCurrentWeather } from '../../store/slices/weatherSlice';
import { WeatherData, Trip } from '../../types';
import { weatherService } from '../../services/weatherService';
import { tripService } from '../../services/tripService';
import { journalService } from '../../services/journalService';
import { formatDate, getFishingScoreColor } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const currentWeather = useSelector((state: RootState) => state.weather.currentWeather);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [recentCatches, setRecentCatches] = useState<any[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);
  const [fishingScore, setFishingScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      
      // Load trips
      const trips = tripService.getUpcomingTrips().slice(0, 3);
      setUpcomingTrips(trips);
      
      // Load recent catches
      const catches = journalService.getAllEntries()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      setRecentCatches(catches);
      
      try {
        // Get current weather for fishing score
        if (!currentWeather) {
          if (navigator.geolocation) {
            // Get user's actual location
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                const weatherData = await weatherService.getCurrentWeather(lat, lon);
                dispatch(setCurrentWeather(weatherData));
                
                // Calculate fishing score
                const score = weatherService.getFishingScore(weatherData);
                setFishingScore(score);
                setLoading(false);
              },
              async (error) => {
                // If user denies location or error occurs, use Chicago as fallback
                console.log('Geolocation error, using default location:', error);
                const lat = 41.8781;
                const lon = -87.6298;
                
                const weatherData = await weatherService.getCurrentWeather(lat, lon);
                dispatch(setCurrentWeather(weatherData));
                const score = weatherService.getFishingScore(weatherData);
                setFishingScore(score);
                setLoading(false);
              }
            );
          } else {
            // Browser doesn't support geolocation, use Chicago
            const lat = 41.8781;
            const lon = -87.6298;
            
            const weatherData = await weatherService.getCurrentWeather(lat, lon);
            dispatch(setCurrentWeather(weatherData));
            
            const score = weatherService.getFishingScore(weatherData);
            setFishingScore(score);
            setLoading(false);
          }
        } else {
          // Calculate fishing score from existing weather
          const score = weatherService.getFishingScore(currentWeather);
          setFishingScore(score);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      }
    };
    
    initDashboard();
  }, [dispatch, currentWeather]);
  
  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          <div className="dashboard-header">
            <div className="fishing-conditions-card">
              <h3>Today's Fishing Conditions</h3>
              {fishingScore !== null ? (
                <div 
                  className="fishing-score" 
                  style={{ 
                    color: getFishingScoreColor(fishingScore),
                    borderColor: getFishingScoreColor(fishingScore)
                  }}
                >
                  <span className="score-value">{fishingScore}</span>
                  <span className="score-label">/100</span>
                </div>
              ) : (
                <div>Unable to calculate fishing score</div>
              )}
              <p>
                {fishingScore !== null && (
                  <>
                    {fishingScore >= 80 && 'Excellent fishing conditions today!'}
                    {fishingScore >= 60 && fishingScore < 80 && 'Good fishing conditions today.'}
                    {fishingScore >= 40 && fishingScore < 60 && 'Average fishing conditions today.'}
                    {fishingScore >= 20 && fishingScore < 40 && 'Below average fishing conditions today.'}
                    {fishingScore < 20 && 'Poor fishing conditions today.'}
                  </>
                )}
              </p>
              <Link to="/weather" className="btn btn-primary">View Details</Link>
            </div>
            
            {currentWeather && (
              <div className="current-weather-card">
                <h3>Current Weather</h3>
                <div className="weather-overview">
                  <div className="weather-temp">
                    {Math.round(currentWeather.temperature)}°F
                  </div>
                  <div className="weather-conditions">
                    {currentWeather.conditions}
                  </div>
                  <div className="weather-details">
                    <div>Wind: {currentWeather.windSpeed} mph {currentWeather.windDirection}</div>
                    <div>Pressure: {currentWeather.pressure} hPa</div>
                    <div>Humidity: {currentWeather.humidity}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Upcoming Trips</h3>
              {upcomingTrips.length > 0 ? (
                <ul className="trips-list">
                  {upcomingTrips.map(trip => (
                    <li key={trip.id} className="trip-item">
                      <Link to={`/trips/${trip.id}`}>
                        <div className="trip-name">{trip.name}</div>
                        <div className="trip-date">{formatDate(trip.date)}</div>
                        <div className="trip-location">
                          {trip.location ? trip.location.name : 'No location set'}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming trips. <Link to="/trips/new">Plan one now!</Link></p>
              )}
              <Link to="/trips" className="btn btn-secondary">View All Trips</Link>
            </div>
            
            <div className="dashboard-card">
              <h3>Recent Catches</h3>
              {recentCatches.length > 0 ? (
                <ul className="catches-list">
                  {recentCatches.map(catchEntry => (
                    <li key={catchEntry.id} className="catch-item">
                      <Link to={`/journal/${catchEntry.id}`}>
                        <div className="catch-species">{catchEntry.species}</div>
                        <div className="catch-date">{formatDate(catchEntry.date)}</div>
                        <div className="catch-location">{catchEntry.locationName}</div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No catch records yet. <Link to="/journal/new">Add your first catch!</Link></p>
              )}
              <Link to="/journal" className="btn btn-secondary">View Journal</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;