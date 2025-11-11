import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CatchEntry } from '../../types';
import { journalService } from '../../services/journalService';
import { formatDate } from '../../utils/helpers';
import './CatchJournal.css';

// Chart for catch statistics
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CatchJournal: React.FC = () => {
  const [catchEntries, setCatchEntries] = useState<CatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'journal' | 'stats'>('journal');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      // Load all catch entries
      const entries = journalService.getAllEntries();
      setCatchEntries(entries);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Apply filters to the catch entries
  const filteredEntries = catchEntries.filter(entry => {
    let matchesSpecies = true;
    let matchesLocation = true;
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (filterSpecies) {
      matchesSpecies = entry.species.toLowerCase().includes(filterSpecies.toLowerCase());
    }
    
    if (filterLocation) {
      matchesLocation = entry.locationName.toLowerCase().includes(filterLocation.toLowerCase());
    }
    
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      const entryDate = new Date(entry.date);
      matchesStartDate = entryDate >= startDate;
    }
    
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      const entryDate = new Date(entry.date);
      matchesEndDate = entryDate <= endDate;
    }
    
    return matchesSpecies && matchesLocation && matchesStartDate && matchesEndDate;
  });
  
  // Sort entries by date (newest first)
  filteredEntries.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get unique location names for filter
  const locations = Array.from(new Set(
    catchEntries.map(entry => entry.locationName)
  )).sort();
  
  // Get unique species names for filter
  const speciesNames = Array.from(new Set(
    catchEntries.map(entry => entry.species)
  )).sort();
  
  // Generate statistics data for charts
  const generateStatsData = () => {
    // Species distribution
    const speciesCount: Record<string, number> = {};
    catchEntries.forEach(entry => {
      speciesCount[entry.species] = (speciesCount[entry.species] || 0) + 1;
    });
    
    const speciesData = Object.entries(speciesCount).map(([name, count]) => ({
      name,
      value: count
    }));
    
    // Catches over time (by month)
    const monthlyData: Record<string, number> = {};
    catchEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });
    
    const timeData = Object.entries(monthlyData)
      .map(([date, count]) => ({
        date,
        count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      speciesData,
      timeData
    };
  };
  
  const stats = generateStatsData();
  
  const COLORS = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];
  
  const clearFilters = () => {
    setFilterSpecies('');
    setFilterLocation('');
    setFilterStartDate('');
    setFilterEndDate('');
  };
  
  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this catch entry?')) {
      journalService.deleteEntry(id);
      setCatchEntries(catchEntries.filter(entry => entry.id !== id));
    }
  };
  
  return (
    <div className="catch-journal">
      <div className="page-header">
        <h2>Fishing Journal</h2>
        <div className="journal-actions">
          <Link to="/journal/new" className="btn btn-primary primary-action">Record New Catch</Link>
          <div className="secondary-actions">
            <button 
              className={`btn btn-secondary ${view === 'journal' ? 'active' : ''}`}
              onClick={() => setView('journal')}
            >
              Journal View
            </button>
            <button 
              className={`btn btn-secondary ${view === 'stats' ? 'active' : ''}`}
              onClick={() => setView('stats')}
            >
              Statistics
            </button>
          </div>
        </div>
      </div>
      
      {view === 'journal' ? (
        <div className="journal-view">
          <div className="filters-panel">
            <h3>Filters</h3>
            
            <div className="form-group">
              <label htmlFor="filterSpecies" className="form-label">Species</label>
              <select
                id="filterSpecies"
                className="form-input"
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
              >
                <option value="">All Species</option>
                {speciesNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="filterLocation" className="form-label">Location</label>
              <select
                id="filterLocation"
                className="form-input"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="filterStartDate" className="form-label">Start Date</label>
              <input
                type="date"
                id="filterStartDate"
                className="form-input"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="filterEndDate" className="form-label">End Date</label>
              <input
                type="date"
                id="filterEndDate"
                className="form-input"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
          
          <div className="entries-container">
            {loading ? (
              <div className="loading">Loading journal entries...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="empty-state">
                <p>No catch entries match your filters.</p>
                {catchEntries.length === 0 ? (
                  <Link to="/journal/new" className="btn btn-primary">Record Your First Catch</Link>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="entries-list">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className="catch-entry-card">
                    <div className="catch-header">
                      <div className="catch-species">{entry.species}</div>
                      <div className="catch-date">{formatDate(entry.date)}</div>
                    </div>
                    
                    <div className="catch-details">
                      <div className="catch-location">
                        <strong>Location:</strong> {entry.locationName}
                      </div>
                      
                      <div className="catch-measurements">
                        {entry.weight && (
                          <span className="catch-weight">
                            <strong>Weight:</strong> {entry.weight} lbs
                          </span>
                        )}
                        {entry.length && (
                          <span className="catch-length">
                            <strong>Length:</strong> {entry.length} in
                          </span>
                        )}
                      </div>
                      
                      <div className="catch-technique">
                        <strong>Technique:</strong> {entry.technique}
                        {entry.bait && ` with ${entry.bait}`}
                      </div>
                      
                      {entry.weather && (
                        <div className="catch-weather">
                          <strong>Weather:</strong> {entry.weather}
                        </div>
                      )}
                      
                      {entry.waterConditions && (
                        <div className="catch-water">
                          <strong>Water Conditions:</strong> {entry.waterConditions}
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className="catch-notes">
                          <strong>Notes:</strong> {entry.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="catch-actions">
                      <Link to={`/journal/edit/${entry.id}`} className="btn btn-secondary">Edit</Link>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="stats-view">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Catches by Species</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.speciesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={(entry) => entry.name}
                    >
                      {stats.speciesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} catches`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Catches Over Time</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={stats.timeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} catches`, 'Count']}
                      labelFormatter={(label) => {
                        const [year, month] = label.split('-');
                        return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Catches" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="stat-card overall-stats">
              <h3>Overall Statistics</h3>
              <div className="stats-summary">
                <div className="stat-item">
                  <div className="stat-value">{catchEntries.length}</div>
                  <div className="stat-label">Total Catches</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">{speciesNames.length}</div>
                  <div className="stat-label">Different Species</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-value">{locations.length}</div>
                  <div className="stat-label">Fishing Spots</div>
                </div>
                
                <div className="stat-item">
                  {catchEntries.length > 0 && (
                    <>
                      <div className="stat-value">
                        {Math.max(...catchEntries.filter(e => e.weight).map(e => e.weight || 0)).toFixed(1)} lbs
                      </div>
                      <div className="stat-label">Biggest Catch</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatchJournal;
