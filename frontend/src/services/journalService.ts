import { CatchEntry } from '../types';
import { storage, generateId } from '../utils/helpers';

// Local storage key
const CATCH_JOURNAL_KEY = 'fishing_companion_journal';

// Journal service
export const journalService = {
  // Get all journal entries
  getAllEntries: (): CatchEntry[] => {
    return storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
  },
  
  // Get a journal entry by ID
  getEntryById: (id: string): CatchEntry | undefined => {
    const entries = storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
    return entries.find(entry => entry.id === id);
  },
  
  // Add a new journal entry
  addEntry: (entry: Omit<CatchEntry, 'id'>): CatchEntry => {
    const allEntries = storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
    
    const newEntry: CatchEntry = {
      ...entry,
      id: generateId(),
    };
    
    storage.save(CATCH_JOURNAL_KEY, [...allEntries, newEntry]);
    return newEntry;
  },
  
  // Update an existing journal entry
  updateEntry: (entry: CatchEntry): void => {
    const allEntries = storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
    const index = allEntries.findIndex(e => e.id === entry.id);
    
    if (index !== -1) {
      allEntries[index] = entry;
      storage.save(CATCH_JOURNAL_KEY, allEntries);
    }
  },
  
  // Delete a journal entry
  deleteEntry: (id: string): void => {
    const allEntries = storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
    storage.save(CATCH_JOURNAL_KEY, allEntries.filter(e => e.id !== id));
  },
  
  // Filter journal entries by species, location, date range, etc.
  filterEntries: (filters: {
    species?: string,
    location?: string,
    startDate?: string,
    endDate?: string,
    technique?: string
  }): CatchEntry[] => {
    const entries = storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
    
    return entries.filter(entry => {
      let match = true;
      
      if (filters.species) {
        match = match && entry.species.toLowerCase().includes(filters.species.toLowerCase());
      }
      
      if (filters.location) {
        match = match && entry.locationName.toLowerCase().includes(filters.location.toLowerCase());
      }
      
      if (filters.technique) {
        match = match && entry.technique.toLowerCase().includes(filters.technique.toLowerCase());
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const entryDate = new Date(entry.date);
        match = match && entryDate >= startDate;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        const entryDate = new Date(entry.date);
        match = match && entryDate <= endDate;
      }
      
      return match;
    });
  },
  
  // Get statistics for all catches
  getStats: () => {
    const entries = storage.load<CatchEntry[]>(CATCH_JOURNAL_KEY, []);
    
    if (entries.length === 0) {
      return {
        totalCatches: 0,
        speciesCount: 0,
        locations: 0,
        biggestCatch: null,
      };
    }
    
    const uniqueSpecies = new Set(entries.map(e => e.species));
    const uniqueLocations = new Set(entries.map(e => e.locationName));
    
    let biggestCatch = entries[0];
    entries.forEach(entry => {
      if (entry.weight && biggestCatch.weight && entry.weight > biggestCatch.weight) {
        biggestCatch = entry;
      }
    });
    
    return {
      totalCatches: entries.length,
      speciesCount: uniqueSpecies.size,
      locations: uniqueLocations.size,
      biggestCatch: biggestCatch,
    };
  }
};