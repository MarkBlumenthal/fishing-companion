import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GearItem {
  id: string;
  name: string;
  category: 'rod' | 'reel' | 'line' | 'lure' | 'hook' | 'bait' | 'tackle' | 'accessory';
  brand?: string;
  model?: string;
  specs?: Record<string, string>;
  notes?: string;
  lastMaintenance?: string;
  maintenanceInterval?: number; // in days
  quantity: number;
}

interface GearSet {
  id: string;
  name: string;
  description?: string;
  items: string[]; // IDs of gear items that go together
}

interface GearState {
  inventory: GearItem[];
  gearSets: GearSet[];
  loading: boolean;
  error: string | null;
}

const initialState: GearState = {
  inventory: [],
  gearSets: [],
  loading: false,
  error: null,
};

const gearSlice = createSlice({
  name: 'gear',
  initialState,
  reducers: {
    // Add a new gear item to inventory
    addGearItem: (state, action: PayloadAction<GearItem>) => {
      state.inventory.push(action.payload);
    },
    
    // Update an existing gear item
    updateGearItem: (state, action: PayloadAction<GearItem>) => {
      const index = state.inventory.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.inventory[index] = action.payload;
      }
    },
    
    // Delete a gear item
    deleteGearItem: (state, action: PayloadAction<string>) => {
      state.inventory = state.inventory.filter(item => item.id !== action.payload);
      
      // Also remove this item from any gear sets
      state.gearSets.forEach(set => {
        set.items = set.items.filter(itemId => itemId !== action.payload);
      });
    },
    
    // Update item quantity
    updateItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const index = state.inventory.findIndex(item => item.id === id);
      
      if (index !== -1) {
        state.inventory[index].quantity = quantity;
      }
    },
    
    // Add a gear set
    addGearSet: (state, action: PayloadAction<GearSet>) => {
      state.gearSets.push(action.payload);
    },
    
    // Update a gear set
    updateGearSet: (state, action: PayloadAction<GearSet>) => {
      const index = state.gearSets.findIndex(set => set.id === action.payload.id);
      if (index !== -1) {
        state.gearSets[index] = action.payload;
      }
    },
    
    // Delete a gear set
    deleteGearSet: (state, action: PayloadAction<string>) => {
      state.gearSets = state.gearSets.filter(set => set.id !== action.payload);
    },
    
    // Update maintenance date for an item
    updateMaintenanceDate: (state, action: PayloadAction<{ id: string; date: string }>) => {
      const { id, date } = action.payload;
      const index = state.inventory.findIndex(item => item.id === id);
      
      if (index !== -1) {
        state.inventory[index].lastMaintenance = date;
      }
    },
  },
});

export const {
  addGearItem,
  updateGearItem,
  deleteGearItem,
  updateItemQuantity,
  addGearSet,
  updateGearSet,
  deleteGearSet,
  updateMaintenanceDate,
} = gearSlice.actions;

export default gearSlice.reducer;