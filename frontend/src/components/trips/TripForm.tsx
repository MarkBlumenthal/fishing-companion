import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trip, Location } from '../../types';
import { tripService } from '../../services/tripService';
import Map from '../common/Map';

interface TripFormProps {
  isEdit?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.8781, -87.6298]); // Default: Chicago
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationNotes, setNewLocationNotes] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | null>(null);
  
  // Load data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const trip = tripService.getTripById(id);
      if (trip) {
        setName(trip.name);
        setDate(trip.date);
        setNotes(trip.notes);
        setLocation(trip.location);
        if (trip.location) {
          setMapCenter([trip.location.latitude, trip.location.longitude]);
        }
      } else {
        // Trip not found, redirect to trip list
        navigate('/trips');
      }
    }
    
    // Load saved locations
    const locations = tripService.getAllLocations();
    setSavedLocations(locations);
  }, [id, isEdit, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (isEdit && id) {
      // Update existing trip
      const existingTrip = tripService.getTripById(id);
      if (existingTrip) {
        const updatedTrip: Trip = {
          ...existingTrip,
          name,
          date,
          notes,
          location
        };
        
        tripService.updateTrip(updatedTrip);
        navigate(`/trips/${id}`);
      }
    } else {
      // Create new trip
      const newTrip = tripService.addTrip({
        name,
        date,
        notes,
        location
      });
      
      navigate(`/trips/${newTrip.id}`);
    }
  };
  
  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation);
    setMapCenter([selectedLocation.latitude, selectedLocation.longitude]);
  };
  
  const handleMapClick = (lat: number, lng: number) => {
    if (showLocationForm) {
      setSelectedCoordinates([lat, lng]);
    }
  };
  
  const handleAddLocation = () => {
    if (!newLocationName || !selectedCoordinates) {
      alert('Please provide a name and select a point on the map');
      return;
    }
    
    const [latitude, longitude] = selectedCoordinates;
    
    const newLocation = tripService.addLocation({
      name: newLocationName,
      latitude,
      longitude,
      notes: newLocationNotes
    });
    
    // Update saved locations
    setSavedLocations([...savedLocations, newLocation]);
    
    // Select the new location
    setLocation(newLocation);
    
    // Reset form
    setShowLocationForm(false);
    setNewLocationName('');
    setNewLocationNotes('');
    setSelectedCoordinates(null);
  };
  
  return (
    <div className="trip-form-container">
      <h2>{isEdit ? 'Edit Trip' : 'Plan New Trip'}</h2>
      
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="tripName" className="form-label">Trip Name *</label>
          <input
            type="text"
            id="tripName"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tripDate" className="form-label">Date *</label>
          <input
            type="date"
            id="tripDate"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tripNotes" className="form-label">Notes</label>
          <textarea
            id="tripNotes"
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="form-group location-section">
          <label className="form-label">Location</label>
          
          {location ? (
            <div className="selected-location">
              <h4>{location.name}</h4>
              <p>Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
              {location.notes && <p>Notes: {location.notes}</p>}
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setLocation(null)}
              >
                Change Location
              </button>
            </div>
          ) : (
            <div className="location-selection">
              <div className="saved-locations">
                <h4>Select a saved location:</h4>
                
                {savedLocations.length === 0 ? (
                  <p>No saved locations yet. Add a new one below.</p>
                ) : (
                  <div className="location-list">
                    {savedLocations.map(loc => (
                      <div 
                        key={loc.id} 
                        className="location-item"
                        onClick={() => handleLocationSelect(loc)}
                      >
                        <h5>{loc.name}</h5>
                        <p>{loc.notes || 'No additional notes'}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="new-location-section">
                  {showLocationForm ? (
                    <div className="new-location-form">
                      <h4>Add a New Location</h4>
                      <p>Click on the map to select coordinates.</p>
                      
                      <div className="form-group">
                        <label htmlFor="locationName" className="form-label">Location Name *</label>
                        <input
                          type="text"
                          id="locationName"
                          className="form-input"
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="locationNotes" className="form-label">Notes</label>
                        <textarea
                          id="locationNotes"
                          className="form-input"
                          value={newLocationNotes}
                          onChange={(e) => setNewLocationNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      {selectedCoordinates && (
                        <div className="selected-coordinates">
                          <p>Selected coordinates: {selectedCoordinates[0].toFixed(4)}, {selectedCoordinates[1].toFixed(4)}</p>
                        </div>
                      )}
                      
                      <div className="location-form-actions">
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          onClick={handleAddLocation}
                        >
                          Save Location
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowLocationForm(false);
                            setNewLocationName('');
                            setNewLocationNotes('');
                            setSelectedCoordinates(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowLocationForm(true)}
                    >
                      Add New Location
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="map-container">
            <Map
              locations={location ? [location] : savedLocations}
              selectedLocationId={location?.id}
              center={mapCenter}
              zoom={10}
              onLocationSelect={handleLocationSelect}
              onMapClick={handleMapClick}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Update Trip' : 'Create Trip'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/trips')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;