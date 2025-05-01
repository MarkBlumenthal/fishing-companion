import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CatchEntry, FishSpecies, Location } from '../../types';
import { journalService } from '../../services/journalService';
import { fishService } from '../../services/fishService';
import { tripService } from '../../services/tripService';
import { formatDate } from '../../utils/helpers';
import Map from '../common/Map';

interface CatchFormProps {
  isEdit?: boolean;
}

const CatchForm: React.FC<CatchFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [species, setSpecies] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [technique, setTechnique] = useState('');
  const [bait, setBait] = useState('');
  const [weather, setWeather] = useState('');
  const [waterConditions, setWaterConditions] = useState('');
  const [notes, setNotes] = useState('');
  
  // Reference data
  const [fishSpeciesList, setFishSpeciesList] = useState<FishSpecies[]>([]);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.8781, -87.6298]); // Default: Chicago
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load fish species
      const species = fishService.getAllSpecies();
      setFishSpeciesList(species);
      
      // Load saved locations
      const locations = tripService.getAllLocations();
      setSavedLocations(locations);
      
      // Load catch data if in edit mode
      if (isEdit && id) {
        const catchEntry = journalService.getEntryById(id);
        if (catchEntry) {
          setDate(catchEntry.date);
          setSpecies(catchEntry.species);
          setLength(catchEntry.length?.toString() || '');
          setWeight(catchEntry.weight?.toString() || '');
          setLocationName(catchEntry.locationName);
          setLatitude(catchEntry.latitude);
          setLongitude(catchEntry.longitude);
          setTechnique(catchEntry.technique);
          setBait(catchEntry.bait || '');
          setWeather(catchEntry.weather || '');
          setWaterConditions(catchEntry.waterConditions || '');
          setNotes(catchEntry.notes);
          
          // Center map on catch location if coordinates are available
          if (catchEntry.latitude && catchEntry.longitude) {
            setMapCenter([catchEntry.latitude, catchEntry.longitude]);
          }
        } else {
          // Catch entry not found, redirect to journal
          navigate('/journal');
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [id, isEdit, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !species || !locationName || !technique) {
      alert('Please fill in all required fields');
      return;
    }
    
    const catchData: Omit<CatchEntry, 'id'> = {
      date,
      species,
      locationName,
      technique,
      notes,
      ...(latitude !== undefined && longitude !== undefined && { latitude, longitude }),
      ...(length !== '' && { length: parseFloat(length) }),
      ...(weight !== '' && { weight: parseFloat(weight) }),
      ...(bait !== '' && { bait }),
      ...(weather !== '' && { weather }),
      ...(waterConditions !== '' && { waterConditions }),
    };
    
    if (isEdit && id) {
      // Update existing catch entry
      journalService.updateEntry({
        ...catchData,
        id
      });
    } else {
      // Add new catch entry
      journalService.addEntry(catchData);
    }
    
    navigate('/journal');
  };
  
  const handleLocationSelect = (location: Location) => {
    setLocationName(location.name);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setMapCenter([location.latitude, location.longitude]);
  };
  
  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };
  
  return (
    <div className="catch-form-container">
      <h2>{isEdit ? 'Edit Catch Entry' : 'Record New Catch'}</h2>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="catch-form">
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="catchDate" className="form-label">Date *</label>
                <input
                  type="date"
                  id="catchDate"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="catchSpecies" className="form-label">Fish Species *</label>
                <select
                  id="catchSpecies"
                  className="form-input"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  required
                >
                  <option value="">Select a species</option>
                  {fishSpeciesList.map(fishSpecies => (
                    <option key={fishSpecies.id} value={fishSpecies.commonName}>
                      {fishSpecies.commonName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="catchLength" className="form-label">Length (inches)</label>
                  <input
                    type="number"
                    id="catchLength"
                    className="form-input"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="catchWeight" className="form-label">Weight (lbs)</label>
                  <input
                    type="number"
                    id="catchWeight"
                    className="form-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="catchTechnique" className="form-label">Fishing Technique *</label>
                <input
                  type="text"
                  id="catchTechnique"
                  className="form-input"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  placeholder="E.g., Fly fishing, Trolling, Bottom fishing"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="catchBait" className="form-label">Bait/Lure Used</label>
                <input
                  type="text"
                  id="catchBait"
                  className="form-input"
                  value={bait}
                  onChange={(e) => setBait(e.target.value)}
                  placeholder="E.g., Worm, Spinner, Crankbait"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="catchWeather" className="form-label">Weather Conditions</label>
                <input
                  type="text"
                  id="catchWeather"
                  className="form-input"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="E.g., Sunny, Cloudy, Rainy"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="catchWater" className="form-label">Water Conditions</label>
                <input
                  type="text"
                  id="catchWater"
                  className="form-input"
                  value={waterConditions}
                  onChange={(e) => setWaterConditions(e.target.value)}
                  placeholder="E.g., Clear, Murky, Choppy"
                />
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group location-section">
                <label className="form-label">Location *</label>
                
                <div className="location-selection">
                  <div className="form-group">
                    <label htmlFor="locationName" className="form-label">Location Name *</label>
                    <input
                      type="text"
                      id="locationName"
                      className="form-input"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      required
                      placeholder="Enter a location name or select from saved locations"
                    />
                  </div>
                  
                  {latitude !== undefined && longitude !== undefined && (
                    <div className="coordinates-display">
                      <p>Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                    </div>
                  )}
                  
                  <div className="saved-locations">
                    <h4>Saved Locations</h4>
                    {savedLocations.length === 0 ? (
                      <p>No saved locations. You can add locations in the Trip Planner.</p>
                    ) : (
                      <div className="location-list">
                        {savedLocations.map(loc => (
                          <div 
                            key={loc.id} 
                            className={`location-item ${locationName === loc.name ? 'selected' : ''}`}
                            onClick={() => handleLocationSelect(loc)}
                          >
                            <div className="location-name">{loc.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="map-instructions">Click on the map to set the exact catch location</p>
                  <div className="map-container">
                    <Map
                      locations={savedLocations}
                      center={mapCenter}
                      zoom={10}
                      onMapClick={handleMapClick}
                      height="300px"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="catchNotes" className="form-label">Notes</label>
                <textarea
                  id="catchNotes"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Add any additional details about your catch..."
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Update Catch' : 'Record Catch'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/journal')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CatchForm;