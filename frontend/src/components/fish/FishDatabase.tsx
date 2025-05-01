import React, { useState, useEffect } from 'react';
import { FishSpecies } from '../../types';
import { fishService } from '../../services/fishService';
import { Link } from 'react-router-dom';

const FishDatabase: React.FC = () => {
  const [fishSpecies, setFishSpecies] = useState<FishSpecies[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [habitatFilter, setHabitatFilter] = useState('');
  const [techniqueFilter, setTechniqueFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState<FishSpecies | null>(null);
  
  useEffect(() => {
    const loadFishData = () => {
      setLoading(true);
      // Initialize fish database with sample data if needed
      const species = fishService.initFishSpecies();
      setFishSpecies(species);
      setLoading(false);
    };
    
    loadFishData();
  }, []);
  
  // Apply filters to the fish species list
  const filteredSpecies = fishSpecies.filter(species => {
    let matchesSearch = true;
    let matchesHabitat = true;
    let matchesTechnique = true;
    
    if (searchQuery) {
      matchesSearch = 
        species.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        species.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    if (habitatFilter) {
      matchesHabitat = species.habitat.toLowerCase().includes(habitatFilter.toLowerCase());
    }
    
    if (techniqueFilter) {
      matchesTechnique = species.techniques.some(technique => 
        technique.toLowerCase().includes(techniqueFilter.toLowerCase())
      );
    }
    
    return matchesSearch && matchesHabitat && matchesTechnique;
  });
  
  // Get unique habitat types from all fish species
  const habitats = Array.from(new Set(
    fishSpecies.map(species => species.habitat)
  )).sort();
  
  // Get all unique fishing techniques from all fish species
  const techniques = Array.from(new Set(
    fishSpecies.flatMap(species => species.techniques)
  )).sort();
  
  const handleSpeciesSelect = (species: FishSpecies) => {
    setSelectedSpecies(species);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setHabitatFilter('');
    setTechniqueFilter('');
  };
  
  return (
    <div className="fish-database">
      <div className="page-header">
        <h2>Fish Species Database</h2>
      </div>
      
      <div className="fish-database-content">
        <div className="filters-panel">
          <h3>Search & Filters</h3>
          
          <div className="form-group">
            <label htmlFor="searchQuery" className="form-label">Search</label>
            <input
              type="text"
              id="searchQuery"
              className="form-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="habitatFilter" className="form-label">Habitat</label>
            <select
              id="habitatFilter"
              className="form-input"
              value={habitatFilter}
              onChange={(e) => setHabitatFilter(e.target.value)}
            >
              <option value="">All Habitats</option>
              {habitats.map(habitat => (
                <option key={habitat} value={habitat}>{habitat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="techniqueFilter" className="form-label">Fishing Technique</label>
            <select
              id="techniqueFilter"
              className="form-input"
              value={techniqueFilter}
              onChange={(e) => setTechniqueFilter(e.target.value)}
            >
              <option value="">All Techniques</option>
              {techniques.map(technique => (
                <option key={technique} value={technique}>{technique}</option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
        
        <div className="species-list-container">
          {loading ? (
            <div className="loading">Loading fish species data...</div>
          ) : filteredSpecies.length === 0 ? (
            <div className="empty-state">
              <p>No fish species match your filters.</p>
              <button 
                className="btn btn-secondary" 
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="species-list">
              {filteredSpecies.map(species => (
                <div 
                  key={species.id} 
                  className={`species-card ${selectedSpecies?.id === species.id ? 'selected' : ''}`}
                  onClick={() => handleSpeciesSelect(species)}
                >
                  <div className="species-header">
                    <h3 className="species-name">{species.commonName}</h3>
                    <div className="species-scientific-name">{species.scientificName}</div>
                  </div>
                  
                  <div className="species-info">
                    <div className="species-habitat">
                      <strong>Habitat:</strong> {species.habitat}
                    </div>
                    
                    <div className="species-seasonality">
                      <strong>Best Seasons:</strong> {species.seasonality.join(', ')}
                    </div>
                    
                    <div className="species-techniques">
                      <strong>Recommended Techniques:</strong> {species.techniques.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedSpecies && (
          <div className="species-details-panel">
            <div className="species-details-header">
              <h3>{selectedSpecies.commonName}</h3>
              <div className="scientific-name">{selectedSpecies.scientificName}</div>
            </div>
            
            <div className="species-description">
              <p>{selectedSpecies.description}</p>
            </div>
            
            <div className="species-details">
              <div className="detail-section">
                <h4>Habitat</h4>
                <p>{selectedSpecies.habitat}</p>
              </div>
              
              <div className="detail-section">
                <h4>Best Fishing Seasons</h4>
                <ul>
                  {selectedSpecies.seasonality.map(season => (
                    <li key={season}>{season}</li>
                  ))}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>Recommended Fishing Techniques</h4>
                <ul>
                  {selectedSpecies.techniques.map(technique => (
                    <li key={technique}>{technique}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="species-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // In a real app, this would navigate to a form to record a catch
                  alert('This would open the "Record a Catch" form in a real app');
                }}
              >
                Record a Catch
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedSpecies(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FishDatabase;