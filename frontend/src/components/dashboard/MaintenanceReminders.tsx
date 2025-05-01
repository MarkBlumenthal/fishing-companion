import React from 'react';
import { Link } from 'react-router-dom';
import { GearItem } from '../../types';
import { formatDate } from '../../utils/helpers';

interface MaintenanceRemindersProps {
  items: GearItem[];
}

const MaintenanceReminders: React.FC<MaintenanceRemindersProps> = ({ items }) => {
  return (
    <div className="maintenance-reminders-component">
      <h3>Maintenance Reminders</h3>
      
      {items.length === 0 ? (
        <div className="empty-state">
          <p>No maintenance needed at this time.</p>
          <Link to="/gear" className="btn btn-secondary">View Gear</Link>
        </div>
      ) : (
        <ul className="maintenance-list">
          {items.map(item => {
            // Calculate days since last maintenance
            const lastMaintenance = item.lastMaintenance 
              ? new Date(item.lastMaintenance) 
              : null;
            
            const daysSinceLastMaintenance = lastMaintenance
              ? Math.floor(
                  (new Date().getTime() - lastMaintenance.getTime()) / 
                  (1000 * 60 * 60 * 24)
                )
              : null;
            
            return (
              <li key={item.id} className="maintenance-item">
                <Link to={`/gear/${item.id}`}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-category">{item.category}</div>
                  
                  {lastMaintenance && (
                    <div className="maintenance-info">
                      <div className="last-maintenance">
                        Last maintenance: {formatDate(item.lastMaintenance!)}
                      </div>
                      
                      {daysSinceLastMaintenance !== null && item.maintenanceInterval && (
                        <div className="days-overdue">
                          {daysSinceLastMaintenance > item.maintenanceInterval ? (
                            <span className="overdue">
                              {daysSinceLastMaintenance - item.maintenanceInterval} days overdue
                            </span>
                          ) : (
                            <span className="upcoming">
                              Due in {item.maintenanceInterval - daysSinceLastMaintenance} days
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
                
                <button 
                  className="btn btn-primary mark-maintained-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // This would be handled via props in a real component
                    alert('Maintenance recorded! This would update the item in a real app.');
                  }}
                >
                  Mark as Maintained
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MaintenanceReminders;