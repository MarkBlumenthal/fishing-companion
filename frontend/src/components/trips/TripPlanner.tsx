import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trip } from '../../types';
import { tripService } from '../../services/tripService';
import { formatDate } from '../../utils/helpers';
import './TripPlanner.css';

const TripPlanner: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  
  useEffect(() => {
    const loadTrips = () => {
      setLoading(true);
      const allTrips = tripService.getAllTrips();
      
      // Sort trips by date
      allTrips.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setTrips(allTrips);
      setLoading(false);
    };
    
    loadTrips();
  }, []);
  
  // Filter trips based on current filter
  const filteredTrips = trips.filter(trip => {
    const tripDate = new Date(trip.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') {
      return tripDate >= today;
    } else if (filter === 'past') {
      return tripDate < today;
    }
    return true; // 'all' filter
  });
  
  return (
    <div className="trip-planner">
      <div className="page-header">
        <h2>Trip Planner</h2>
        <Link to="/trips/new" className="btn btn-primary">Plan New Trip</Link>
      </div>
      
      <div className="filter-controls-card">
  <h3>Filter Trips</h3>
  <div className="filter-controls">
    <button 
      className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
      onClick={() => setFilter('upcoming')}
    >
      Upcoming
    </button>
    <button 
      className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
      onClick={() => setFilter('past')}
    >
      Past
    </button>
    <button 
      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
      onClick={() => setFilter('all')}
    >
      All
    </button>
  </div>
</div>
      
      {loading ? (
        <div className="loading">Loading trips...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="empty-state">
          <p>No {filter === 'all' ? '' : filter} trips found.</p>
          <Link to="/trips/new" className="btn btn-primary">Plan Your First Trip</Link>
        </div>
      ) : (
        <div className="trips-grid">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-header">
                <h3 className="trip-name">{trip.name}</h3>
                <div className="trip-date">{formatDate(trip.date)}</div>
              </div>
              
              <div className="trip-location">
                {trip.location ? (
                  <div>
                    <strong>Location:</strong> {trip.location.name}
                  </div>
                ) : (
                  <div className="no-location">No location set</div>
                )}
              </div>
              
              <div className="trip-checklist-progress">
                <div className="progress-label">Packing Progress:</div>
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
              
              {trip.notes && (
                <div className="trip-notes">
                  <strong>Notes:</strong> {trip.notes.length > 100 ? `${trip.notes.slice(0, 100)}...` : trip.notes}
                </div>
              )}
              
              <div className="trip-actions">
                <Link to={`/trips/${trip.id}`} className="btn btn-primary">View Details</Link>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trip?')) {
                      tripService.deleteTrip(trip.id);
                      // Remove the trip from state
                      setTrips(trips.filter(t => t.id !== trip.id));
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripPlanner;