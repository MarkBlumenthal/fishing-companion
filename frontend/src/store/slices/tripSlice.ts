import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  notes: string;
}

interface TripItem {
  id: string;
  name: string;
  checked: boolean;
}

interface Trip {
  id: string;
  name: string;
  location: Location | null;
  date: string;
  notes: string;
  checklist: TripItem[];
}

interface TripState {
  trips: Trip[];
  savedLocations: Location[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  savedLocations: [],
  currentTrip: null,
  loading: false,
  error: null,
};

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    // Add a new trip
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.trips.push(action.payload);
    },
    
    // Update an existing trip
    updateTrip: (state, action: PayloadAction<Trip>) => {
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
    },
    
    // Delete a trip
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
    },
    
    // Set the current trip for editing
    setCurrentTrip: (state, action: PayloadAction<string>) => {
      state.currentTrip = state.trips.find(trip => trip.id === action.payload) || null;
    },
    
    // Add a location to saved locations
    addLocation: (state, action: PayloadAction<Location>) => {
      state.savedLocations.push(action.payload);
    },
    
    // Remove a location from saved locations
    removeLocation: (state, action: PayloadAction<string>) => {
      state.savedLocations = state.savedLocations.filter(
        location => location.id !== action.payload
      );
    },
    
    // Toggle checklist item
    toggleChecklistItem: (state, action: PayloadAction<{ tripId: string; itemId: string }>) => {
      const { tripId, itemId } = action.payload;
      const tripIndex = state.trips.findIndex(trip => trip.id === tripId);
      
      if (tripIndex !== -1) {
        const itemIndex = state.trips[tripIndex].checklist.findIndex(
          item => item.id === itemId
        );
        
        if (itemIndex !== -1) {
          state.trips[tripIndex].checklist[itemIndex].checked = 
            !state.trips[tripIndex].checklist[itemIndex].checked;
        }
      }
    },
  },
});

export const {
  addTrip,
  updateTrip,
  deleteTrip,
  setCurrentTrip,
  addLocation,
  removeLocation,
  toggleChecklistItem,
} = tripSlice.actions;

export default tripSlice.reducer;