import React, { useState, useEffect } from 'react';
import { GearItem, GearSet } from '../../types';
import { gearService, GearService } from '../../services/gearService';

const GearManager: React.FC = () => {
  const [inventory, setInventory] = useState<GearItem[]>([]);
  const [gearSets, setGearSets] = useState<GearSet[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSetForm, setShowSetForm] = useState(false);
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [selectedSet, setSelectedSet] = useState<GearSet | null>(null);
  
  // New gear form state
  const [newGearName, setNewGearName] = useState('');
  const [newGearCategory, setNewGearCategory] = useState('rod');
  const [newGearBrand, setNewGearBrand] = useState('');
  const [newGearModel, setNewGearModel] = useState('');
  const [newGearNotes, setNewGearNotes] = useState('');
  const [newGearQuantity, setNewGearQuantity] = useState(1);
  const [newGearMaintenanceInterval, setNewGearMaintenanceInterval] = useState('');
  
  // New gear set form state
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [newSetItems, setNewSetItems] = useState<string[]>([]);
  
  useEffect(() => {
    const loadGearData = () => {
      setLoading(true);
      
      // Load gear inventory
      const gearInventory = gearService.getAllGear();
      setInventory(gearInventory);
      
      // Load gear sets
      const sets = gearService.getAllGearSets();
      setGearSets(sets);
      
      setLoading(false);
    };
    
    loadGearData();
  }, []);
  
  // Filter inventory based on selected filters
  const filteredInventory = inventory.filter(item => {
    let matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    let matchesMaintenance = maintenanceFilter ? needsMaintenance(item) : true;
    
    return matchesCategory && matchesMaintenance;
  });
  
  // Check if an item needs maintenance
  const needsMaintenance = (item: GearItem): boolean => {
    if (!item.lastMaintenance || !item.maintenanceInterval) {
      return false;
    }
    
    const lastMaintenance = new Date(item.lastMaintenance);
    const today = new Date();
    const daysSinceLastMaintenance = Math.floor(
      (today.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceLastMaintenance >= item.maintenanceInterval;
  };
  
  // Handle adding a new gear item
  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGearName || !newGearCategory) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newItem: Omit<GearItem, 'id'> = {
      name: newGearName,
      category: newGearCategory as any, // Type assertion for simplicity
      quantity: newGearQuantity,
      ...(newGearBrand && { brand: newGearBrand }),
      ...(newGearModel && { model: newGearModel }),
      ...(newGearNotes && { notes: newGearNotes }),
      ...(newGearMaintenanceInterval && { 
        maintenanceInterval: parseInt(newGearMaintenanceInterval),
        lastMaintenance: new Date().toISOString().split('T')[0]
      })
    };
    
    // Add the item to inventory
    const addedItem = gearService.addGearItem(newItem);
    setInventory([...inventory, addedItem]);
    
    // Reset form
    resetGearForm();
    setShowAddForm(false);
  };
  
  // Handle adding a new gear set
  const handleAddGearSet = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSetName || newSetItems.length === 0) {
      alert('Please fill in the set name and select at least one item');
      return;
    }
    
    const newSet: Omit<GearSet, 'id'> = {
      name: newSetName,
      items: newSetItems,
      ...(newSetDescription && { description: newSetDescription })
    };
    
    // Add the set
    const addedSet = gearService.addGearSet(newSet);
    setGearSets([...gearSets, addedSet]);
    
    // Reset form
    resetSetForm();
    setShowSetForm(false);
  };
  
  // Toggle selection of an item for a gear set
  const toggleItemSelection = (itemId: string) => {
    if (newSetItems.includes(itemId)) {
      setNewSetItems(newSetItems.filter(id => id !== itemId));
    } else {
      setNewSetItems([...newSetItems, itemId]);
    }
  };
  
  // Reset gear form fields
  const resetGearForm = () => {
    setNewGearName('');
    setNewGearCategory('rod');
    setNewGearBrand('');
    setNewGearModel('');
    setNewGearNotes('');
    setNewGearQuantity(1);
    setNewGearMaintenanceInterval('');
  };
  
  // Reset set form fields
  const resetSetForm = () => {
    setNewSetName('');
    setNewSetDescription('');
    setNewSetItems([]);
  };
  
  // Update maintenance date for an item
  const markMaintained = (itemId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Update the service - passing id and date as separate parameters
    gearService.updateMaintenanceDate(itemId, today);
    
    // Update local state
    setInventory(inventory.map(item => 
      item.id === itemId 
        ? { ...item, lastMaintenance: today } 
        : item
    ));
    
    // If an item was selected, update selected item too
    if (selectedGear && selectedGear.id === itemId) {
      setSelectedGear({ ...selectedGear, lastMaintenance: today });
    }
  };
  
  // Handle deleting a gear item
  const handleDeleteGear = (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    // Delete from service
    gearService.deleteGearItem(itemId);
    
    // Update local state
    setInventory(inventory.filter(item => item.id !== itemId));
    
    // If the item was selected, clear selection
    if (selectedGear && selectedGear.id === itemId) {
      setSelectedGear(null);
    }
  };
  
  // Handle deleting a gear set
  const handleDeleteGearSet = (setId: string) => {
    if (!window.confirm('Are you sure you want to delete this gear set?')) {
      return;
    }
    
    // Delete from service
    gearService.deleteGearSet(setId);
    
    // Update local state
    setGearSets(gearSets.filter(set => set.id !== setId));
    
    // If the set was selected, clear selection
    if (selectedSet && selectedSet.id === setId) {
      setSelectedSet(null);
    }
  };
  
  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    // Update the service - passing id and quantity as separate parameters
    gearService.updateItemQuantity(itemId, newQuantity);
    
    // Update local state
    setInventory(inventory.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
    
    // If an item was selected, update selected item too
    if (selectedGear && selectedGear.id === itemId) {
      setSelectedGear({ ...selectedGear, quantity: newQuantity });
    }
  };
  
  return (
    <div className="gear-manager">
      <div className="page-header">
        <h2>Fishing Gear Manager</h2>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetGearForm();
              setShowAddForm(true);
              setShowSetForm(false);
              setSelectedGear(null);
              setSelectedSet(null);
            }}
          >
            Add New Gear
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              resetSetForm();
              setShowSetForm(true);
              setShowAddForm(false);
              setSelectedGear(null);
              setSelectedSet(null);
            }}
          >
            Create Gear Set
          </button>
        </div>
      </div>
      
      <div className="gear-content">
        <div className="gear-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            
            <div className="form-group">
              <label htmlFor="categoryFilter" className="form-label">Category</label>
              <select
                id="categoryFilter"
                className="form-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="rod">Rods</option>
                <option value="reel">Reels</option>
                <option value="line">Fishing Line</option>
                <option value="lure">Lures</option>
                <option value="hook">Hooks</option>
                <option value="bait">Bait</option>
                <option value="tackle">Tackle</option>
                <option value="accessory">Accessories</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={maintenanceFilter}
                  onChange={(e) => setMaintenanceFilter(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="label-text">Needs Maintenance</span>
              </label>
            </div>
          </div>
          
          <div className="gear-sets-section">
            <h3>Gear Sets</h3>
            
            {gearSets.length === 0 ? (
              <p>No gear sets defined yet.</p>
            ) : (
              <div className="gear-sets-list">
                {gearSets.map(set => (
                  <div 
                    key={set.id} 
                    className={`gear-set-item ${selectedSet?.id === set.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSet(set);
                      setSelectedGear(null);
                      setShowAddForm(false);
                      setShowSetForm(false);
                    }}
                  >
                    <div className="set-name">{set.name}</div>
                    <div className="set-item-count">
                      {set.items.length} {set.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="gear-main">
          {showAddForm && (
            <div className="gear-form-container">
              <h3>Add New Gear</h3>
              
              <form onSubmit={handleAddGear} className="gear-form">
                <div className="form-group">
                  <label htmlFor="gearName" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="gearName"
                    className="form-input"
                    value={newGearName}
                    onChange={(e) => setNewGearName(e.target.value)}
                    required
                    placeholder="E.g., Shimano Medium Rod"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="gearCategory" className="form-label">Category *</label>
                  <select
                    id="gearCategory"
                    className="form-input"
                    value={newGearCategory}
                    onChange={(e) => setNewGearCategory(e.target.value)}
                    required
                  >
                    <option value="rod">Rod</option>
                    <option value="reel">Reel</option>
                    <option value="line">Fishing Line</option>
                    <option value="lure">Lure</option>
                    <option value="hook">Hook</option>
                    <option value="bait">Bait</option>
                    <option value="tackle">Tackle</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="gearBrand" className="form-label">Brand</label>
                    <input
                      type="text"
                      id="gearBrand"
                      className="form-input"
                      value={newGearBrand}
                      onChange={(e) => setNewGearBrand(e.target.value)}
                      placeholder="E.g., Shimano"
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="gearModel" className="form-label">Model</label>
                    <input
                      type="text"
                      id="gearModel"
                      className="form-input"
                      value={newGearModel}
                      onChange={(e) => setNewGearModel(e.target.value)}
                      placeholder="E.g., FX-2500"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="gearQuantity" className="form-label">Quantity *</label>
                    <input
                      type="number"
                      id="gearQuantity"
                      className="form-input"
                      value={newGearQuantity}
                      onChange={(e) => setNewGearQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label htmlFor="maintenanceInterval" className="form-label">Maintenance Interval (days)</label>
                    <input
                      type="number"
                      id="maintenanceInterval"
                      className="form-input"
                      value={newGearMaintenanceInterval}
                      onChange={(e) => setNewGearMaintenanceInterval(e.target.value)}
                      min="1"
                      placeholder="E.g., 90"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="gearNotes" className="form-label">Notes</label>
                  <textarea
                    id="gearNotes"
                    className="form-input"
                    value={newGearNotes}
                    onChange={(e) => setNewGearNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional details about this gear..."
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Add Gear</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {showSetForm && (
            <div className="gear-form-container">
              <h3>Create New Gear Set</h3>
              
              <form onSubmit={handleAddGearSet} className="gear-set-form">
                <div className="form-group">
                  <label htmlFor="setName" className="form-label">Set Name *</label>
                  <input
                    type="text"
                    id="setName"
                    className="form-input"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    required
                    placeholder="E.g., Bass Fishing Setup"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="setDescription" className="form-label">Description</label>
                  <textarea
                    id="setDescription"
                    className="form-input"
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    rows={2}
                    placeholder="What is this gear set used for?"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Select Items for this Set *</label>
                  
                  {inventory.length === 0 ? (
                    <p>No gear items available. Add some gear first.</p>
                  ) : (
                    <div className="item-selection-list">
                      {inventory.map(item => (
                        <div key={item.id} className="item-selection-row">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={newSetItems.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                            />
                            <span className="checkmark"></span>
                            <span className="item-name">{item.name}</span>
                            <span className="item-category">{item.category}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="selected-count">
                  {newSetItems.length} items selected
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Create Set</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowSetForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {!showAddForm && !showSetForm && !selectedGear && !selectedSet && (
            <div className="gear-inventory">
              <h3>Gear Inventory</h3>
              
              {loading ? (
                <div className="loading">Loading gear inventory...</div>
              ) : filteredInventory.length === 0 ? (
                <div className="empty-state">
                  <p>No gear items match your filters.</p>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setCategoryFilter('all');
                      setMaintenanceFilter(false);
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="gear-grid">
                  {filteredInventory.map(item => (
                    <div 
                      key={item.id} 
                      className="gear-item-card"
                      onClick={() => {
                        setSelectedGear(item);
                        setSelectedSet(null);
                      }}
                    >
                      <div className="gear-card-header">
                        <h4 className="gear-name">{item.name}</h4>
                        <div className="gear-category">{item.category}</div>
                      </div>
                      
                      <div className="gear-card-content">
                        {(item.brand || item.model) && (
                          <div className="gear-brand-model">
                            {item.brand && <span className="gear-brand">{item.brand}</span>}
                            {item.model && <span className="gear-model">{item.model}</span>}
                          </div>
                        )}
                        
                        <div className="gear-quantity">
                          <span className="label">Quantity:</span> {item.quantity}
                        </div>
                        
                        {item.maintenanceInterval && item.lastMaintenance && (
                          <div className={`gear-maintenance ${needsMaintenance(item) ? 'needs-maintenance' : ''}`}>
                            <span className="label">Maintenance:</span>
                            {needsMaintenance(item) ? (
                              <span className="overdue">Overdue</span>
                            ) : (
                              <span className="status">Up to date</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {selectedGear && (
            <div className="gear-details">
              <h3>Gear Details</h3>
              
              <div className="gear-detail-card">
                <div className="gear-header">
                  <h3 className="gear-name">{selectedGear.name}</h3>
                  <div className="gear-category">{selectedGear.category}</div>
                </div>
                
                <div className="gear-info">
                  {(selectedGear.brand || selectedGear.model) && (
                    <div className="gear-spec">
                      <div className="spec-label">Brand/Model:</div>
                      <div className="spec-value">
                        {selectedGear.brand} {selectedGear.model}
                      </div>
                    </div>
                  )}
                  
                  <div className="gear-spec">
                    <div className="spec-label">Quantity:</div>
                    <div className="spec-value quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(selectedGear.id, selectedGear.quantity - 1)}
                        disabled={selectedGear.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{selectedGear.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => updateQuantity(selectedGear.id, selectedGear.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {selectedGear.maintenanceInterval && (
                    <div className="gear-spec">
                      <div className="spec-label">Maintenance Interval:</div>
                      <div className="spec-value">
                        Every {selectedGear.maintenanceInterval} days
                      </div>
                    </div>
                  )}
                  
                  {selectedGear.lastMaintenance && (
                    <div className="gear-spec">
                      <div className="spec-label">Last Maintained:</div>
                      <div className="spec-value">
                        {new Date(selectedGear.lastMaintenance).toLocaleDateString()}
                        
                        {selectedGear.maintenanceInterval && (
                          <button 
                            className="btn btn-small btn-primary mark-maintained-btn"
                            onClick={() => markMaintained(selectedGear.id)}
                          >
                            Mark as Maintained
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedGear.notes && (
                    <div className="gear-spec notes">
                      <div className="spec-label">Notes:</div>
                      <div className="spec-value">{selectedGear.notes}</div>
                    </div>
                  )}
                </div>
                
                <div className="gear-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteGear(selectedGear.id)}
                  >
                    Delete Item
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedGear(null)}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {selectedSet && (
            <div className="gear-set-details">
              <h3>Gear Set Details</h3>
              
              <div className="gear-set-detail-card">
                <div className="set-header">
                  <h3 className="set-name">{selectedSet.name}</h3>
                  {selectedSet.description && (
                    <div className="set-description">{selectedSet.description}</div>
                  )}
                </div>
                
                <div className="set-items">
                  <h4>Items in this Set</h4>
                  
                  {selectedSet.items.length === 0 ? (
                    <p>No items in this set.</p>
                  ) : (
                    <div className="set-items-list">
                      {selectedSet.items.map(itemId => {
                        const item = inventory.find(i => i.id === itemId);
                        
                        if (!item) return null; // Skip if item not found
                        
                        return (
                          <div key={itemId} className="set-item">
                            <div className="item-name">{item.name}</div>
                            <div className="item-category">{item.category}</div>
                            {item.brand && <div className="item-brand">{item.brand}</div>}
                            <div className="item-quantity">Qty: {item.quantity}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="gear-set-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteGearSet(selectedSet.id)}
                  >
                    Delete Set
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSelectedSet(null)}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GearManager;