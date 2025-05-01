import { GearItem, GearSet } from '../types';
import { storage, generateId } from '../utils/helpers';

// Local storage keys
const GEAR_INVENTORY_KEY = 'fishing_companion_gear';
const GEAR_SETS_KEY = 'fishing_companion_gear_sets';

// Define an interface for the gear service
export interface GearService {
  getAllGear(): GearItem[];
  getGearById(id: string): GearItem | undefined;
  addGearItem(item: Omit<GearItem, 'id'>): GearItem;
  updateGearItem(item: GearItem): void;
  deleteGearItem(id: string): void;
  filterGearByCategory(category: GearItem['category']): GearItem[];
  getItemsNeedingMaintenance(): GearItem[];
  getAllGearSets(): GearSet[];
  getGearSetById(id: string): GearSet | undefined;
  addGearSet(set: Omit<GearSet, 'id'>): GearSet;
  updateGearSet(set: GearSet): void;
  deleteGearSet(id: string): void;
  getGearSetItems(setId: string): GearItem[];
  updateMaintenanceDate(id: string, date: string): void;
  updateItemQuantity(id: string, quantity: number): void;
}

// Create gear service implementation
export const gearService: GearService = {
  // Get all gear items
  getAllGear() {
    return storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
  },
  
  // Get a gear item by ID
  getGearById(id: string) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    return inventory.find(item => item.id === id);
  },
  
  // Add a new gear item
  addGearItem(item: Omit<GearItem, 'id'>) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    
    const newItem: GearItem = {
      ...item,
      id: generateId(),
    };
    
    storage.save(GEAR_INVENTORY_KEY, [...inventory, newItem]);
    return newItem;
  },
  
  // Update an existing gear item
  updateGearItem(item: GearItem) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    const index = inventory.findIndex(i => i.id === item.id);
    
    if (index !== -1) {
      inventory[index] = item;
      storage.save(GEAR_INVENTORY_KEY, inventory);
    }
  },
  
  // Delete a gear item
  deleteGearItem(id: string) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    storage.save(GEAR_INVENTORY_KEY, inventory.filter(i => i.id !== id));
    
    // Also remove this item from any gear sets
    const gearSets = storage.load<GearSet[]>(GEAR_SETS_KEY, []);
    const updatedGearSets = gearSets.map(set => ({
      ...set,
      items: set.items.filter(itemId => itemId !== id)
    }));
    storage.save(GEAR_SETS_KEY, updatedGearSets);
  },
  
  // Filter gear by category
  filterGearByCategory(category: GearItem['category']) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    return inventory.filter(item => item.category === category);
  },
  
  // Get items that need maintenance
  getItemsNeedingMaintenance() {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    const today = new Date();
    
    return inventory.filter(item => {
      if (!item.lastMaintenance || !item.maintenanceInterval) {
        return false;
      }
      
      const lastMaintenance = new Date(item.lastMaintenance);
      const daysSinceLastMaintenance = Math.floor(
        (today.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return daysSinceLastMaintenance >= item.maintenanceInterval;
    });
  },
  
  // Get all gear sets
  getAllGearSets() {
    return storage.load<GearSet[]>(GEAR_SETS_KEY, []);
  },
  
  // Get a gear set by ID
  getGearSetById(id: string) {
    const gearSets = storage.load<GearSet[]>(GEAR_SETS_KEY, []);
    return gearSets.find(set => set.id === id);
  },
  
  // Add a new gear set
  addGearSet(set: Omit<GearSet, 'id'>) {
    const gearSets = storage.load<GearSet[]>(GEAR_SETS_KEY, []);
    
    const newSet: GearSet = {
      ...set,
      id: generateId(),
    };
    
    storage.save(GEAR_SETS_KEY, [...gearSets, newSet]);
    return newSet;
  },
  
  // Update an existing gear set
  updateGearSet(set: GearSet) {
    const gearSets = storage.load<GearSet[]>(GEAR_SETS_KEY, []);
    const index = gearSets.findIndex(s => s.id === set.id);
    
    if (index !== -1) {
      gearSets[index] = set;
      storage.save(GEAR_SETS_KEY, gearSets);
    }
  },
  
  // Delete a gear set
  deleteGearSet(id: string) {
    const gearSets = storage.load<GearSet[]>(GEAR_SETS_KEY, []);
    storage.save(GEAR_SETS_KEY, gearSets.filter(s => s.id !== id));
  },
  
  // Get all items in a gear set
  getGearSetItems(setId: string) {
    const gearSets = storage.load<GearSet[]>(GEAR_SETS_KEY, []);
    const gearSet = gearSets.find(set => set.id === setId);
    
    if (!gearSet) return [];
    
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    return inventory.filter(item => gearSet.items.includes(item.id));
  },
  
  // Update maintenance date for an item
  updateMaintenanceDate(id: string, date: string) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    const index = inventory.findIndex(item => item.id === id);
    
    if (index !== -1) {
      inventory[index].lastMaintenance = date;
      storage.save(GEAR_INVENTORY_KEY, inventory);
    }
  },
  
  // Update item quantity
  updateItemQuantity(id: string, quantity: number) {
    const inventory = storage.load<GearItem[]>(GEAR_INVENTORY_KEY, []);
    const index = inventory.findIndex(item => item.id === id);
    
    if (index !== -1) {
      inventory[index].quantity = quantity;
      storage.save(GEAR_INVENTORY_KEY, inventory);
    }
  }
};