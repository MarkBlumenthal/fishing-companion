import React from 'react';
import { Link } from 'react-router-dom';
import { Trip } from '../../types';
import { formatDate } from '../../utils/helpers';

interface UpcomingTripsProps {
  trips: Trip[];
}

const UpcomingTrips: React.FC<UpcomingTripsProps> = ({ trips }) => {
  return (
    <div className="upcoming-trips-component">
      <h3>Upcoming Trips</h3>
      
      {trips.length === 0 ? (
        <div className="empty-state">
          <p>No upcoming trips scheduled.</p>
          <Link to="/trips/new" className="btn btn-primary">Plan a Trip</Link>
        </div>
      ) : (
        <ul className="trips-list">
          {trips.map(trip => (
            <li key={trip.id} className="trip-item">
              <Link to={`/trips/${trip.id}`}>
                <div className="trip-date">{formatDate(trip.date)}</div>
                <div className="trip-name">{trip.name}</div>
                <div className="trip-location">
                  {trip.location ? trip.location.name : 'No location set'}
                </div>
                <div className="trip-progress">
                  <div className="trip-checklist-status">
                    <span className="completed">
                      {trip.checklist.filter(item => item.checked).length}
                    </span>
                    <span className="separator">/</span>
                    <span className="total">{trip.checklist.length}</span>
                    <span className="label"> items packed</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      <div className="action-links">
        <Link to="/trips" className="btn btn-secondary">View All Trips</Link>
      </div>
    </div>
  );
};

export default UpcomingTrips;