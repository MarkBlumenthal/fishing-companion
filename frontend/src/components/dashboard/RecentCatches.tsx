import React from 'react';
import { Link } from 'react-router-dom';
import { CatchEntry } from '../../types';
import { formatDate } from '../../utils/helpers';

interface RecentCatchesProps {
  catches: CatchEntry[];
}

const RecentCatches: React.FC<RecentCatchesProps> = ({ catches }) => {
  return (
    <div className="recent-catches-component">
      <h3>Recent Catches</h3>
      
      {catches.length === 0 ? (
        <div className="empty-state">
          <p>No catch records yet.</p>
          <Link to="/journal/new" className="btn btn-primary">Record a Catch</Link>
        </div>
      ) : (
        <ul className="catches-list">
          {catches.map(catchEntry => (
            <li key={catchEntry.id} className="catch-item">
              <Link to={`/journal/${catchEntry.id}`}>
                <div className="catch-date">{formatDate(catchEntry.date)}</div>
                <div className="catch-species">{catchEntry.species}</div>
                <div className="catch-details">
                  <span className="catch-location">{catchEntry.locationName}</span>
                  {catchEntry.weight && (
                    <span className="catch-weight">{catchEntry.weight} lbs</span>
                  )}
                  {catchEntry.length && (
                    <span className="catch-length">{catchEntry.length} in</span>
                  )}
                </div>
                <div className="catch-technique">
                  Caught using: {catchEntry.technique}
                  {catchEntry.bait && ` with ${catchEntry.bait}`}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      <div className="action-links">
        <Link to="/journal" className="btn btn-secondary">View All Catches</Link>
        <Link to="/journal/new" className="btn btn-primary">Record New Catch</Link>
      </div>
    </div>
  );
};

export default RecentCatches;