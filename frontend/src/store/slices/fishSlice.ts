import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FishSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  habitat: string;
  seasonality: string[];
  techniques: string[];
  imageUrl?: string;
}

interface CatchEntry {
  id: string;
  date: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  species: string;
  length?: number;
  weight?: number;
  technique: string;
  bait?: string;
  weather?: string;
  waterConditions?: string;
  notes: string;
  imageUrl?: string;
}

interface FishState {
  speciesDatabase: FishSpecies[];
  catchJournal: CatchEntry[];
  selectedSpecies: FishSpecies | null;
  loading: boolean;
  error: string | null;
}

const initialState: FishState = {
  speciesDatabase: [],
  catchJournal: [],
  selectedSpecies: null,
  loading: false,
  error: null,
};

const fishSlice = createSlice({
  name: 'fish',
  initialState,
  reducers: {
    // Load fish species data
    setSpeciesDatabase: (state, action: PayloadAction<FishSpecies[]>) => {
      state.speciesDatabase = action.payload;
    },
    
    // Set selected fish species
    selectSpecies: (state, action: PayloadAction<string>) => {
      state.selectedSpecies = state.speciesDatabase.find(
        species => species.id === action.payload
      ) || null;
    },
    
    // Add a catch entry to the journal
    addCatchEntry: (state, action: PayloadAction<CatchEntry>) => {
      state.catchJournal.push(action.payload);
    },
    
    // Update a catch entry
    updateCatchEntry: (state, action: PayloadAction<CatchEntry>) => {
      const index = state.catchJournal.findIndex(
        entry => entry.id === action.payload.id
      );
      
      if (index !== -1) {
        state.catchJournal[index] = action.payload;
      }
    },
    
    // Delete a catch entry
    deleteCatchEntry: (state, action: PayloadAction<string>) => {
      state.catchJournal = state.catchJournal.filter(
        entry => entry.id !== action.payload
      );
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSpeciesDatabase,
  selectSpecies,
  addCatchEntry,
  updateCatchEntry,
  deleteCatchEntry,
  setLoading,
  setError,
} = fishSlice.actions;

export default fishSlice.reducer;