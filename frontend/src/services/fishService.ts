import { FishSpecies } from '../types';
import { storage } from '../utils/helpers';

// Local storage keys
const FISH_SPECIES_KEY = 'fishing_companion_species';

// Sample fish species data for demonstration
const sampleFishSpecies: FishSpecies[] = [
  {
    id: '1',
    commonName: 'Largemouth Bass',
    scientificName: 'Micropterus salmoides',
    description: 'The largemouth bass is an olive-green to greenish-gray fish, marked by a series of dark, sometimes black, blotches forming a jagged horizontal stripe along each flank.',
    habitat: 'Freshwater lakes, rivers, and ponds with vegetation and structure.',
    seasonality: ['Spring', 'Summer', 'Fall'],
    techniques: ['Plastic worms', 'Topwater lures', 'Crankbaits', 'Spinnerbaits'],
    imageUrl: '/images/largemouth-bass.jpg'
  },
  {
    id: '2',
    commonName: 'Rainbow Trout',
    scientificName: 'Oncorhynchus mykiss',
    description: 'Rainbow trout are distinguished by a pink stripe along their sides, white underbelly, and small black spots on their back and fins.',
    habitat: 'Cold, clear streams, rivers, and lakes.',
    seasonality: ['Spring', 'Fall'],
    techniques: ['Fly fishing', 'Spinners', 'Bait fishing with worms or powerbait'],
    imageUrl: '/images/rainbow-trout.jpg'
  },
  {
    id: '3',
    commonName: 'Walleye',
    scientificName: 'Sander vitreus',
    description: 'Walleyes are primarily olive and golden in color with a white belly. The dorsal side of a walleye is olive, grading into a golden hue on the flanks.',
    habitat: 'Large, turbid lakes and rivers.',
    seasonality: ['Spring', 'Fall', 'Winter'],
    techniques: ['Jig and minnow', 'Trolling with crankbaits', 'Bottom bouncers with crawler harnesses'],
    imageUrl: '/images/walleye.jpg'
  },
  {
    id: '4',
    commonName: 'Northern Pike',
    scientificName: 'Esox lucius',
    description: 'The northern pike is a species of carnivorous fish. They have elongated bodies with a duckbill-like snout and sharp teeth.',
    habitat: 'Vegetated lakes and slow rivers.',
    seasonality: ['Spring', 'Fall', 'Winter'],
    techniques: ['Spinners', 'Spoons', 'Large jerkbaits', 'Dead baits in winter'],
    imageUrl: '/images/northern-pike.jpg'
  },
  {
    id: '5',
    commonName: 'Bluegill',
    scientificName: 'Lepomis macrochirus',
    description: 'The bluegill is a small freshwater fish with a distinctive bright blue edge on its gill plate and an overall olive-green to brown color.',
    habitat: 'Ponds, lakes, and slow-moving streams with vegetation.',
    seasonality: ['Spring', 'Summer'],
    techniques: ['Small jigs', 'Worms', 'Crickets', 'Small flies'],
    imageUrl: '/images/bluegill.jpg'
  }
];

// Fish species data service
export const fishService = {
  // Initialize the fish species database with sample data if it doesn't exist
  initFishSpecies: (): FishSpecies[] => {
    const existingData = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    
    if (existingData.length === 0) {
      storage.save(FISH_SPECIES_KEY, sampleFishSpecies);
      return sampleFishSpecies;
    }
    
    return existingData;
  },
  
  // Get all fish species
  getAllSpecies: (): FishSpecies[] => {
    return storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
  },
  
  // Get a fish species by ID
  getSpeciesById: (id: string): FishSpecies | undefined => {
    const species = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    return species.find(s => s.id === id);
  },
  
  // Search for fish species by name
  searchSpecies: (query: string): FishSpecies[] => {
    const species = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    const lowerQuery = query.toLowerCase();
    
    return species.filter(s => 
      s.commonName.toLowerCase().includes(lowerQuery) || 
      s.scientificName.toLowerCase().includes(lowerQuery)
    );
  },
  
  // Filter species by habitat or technique
  filterSpecies: (criteria: { habitat?: string, technique?: string }): FishSpecies[] => {
    const species = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    
    return species.filter(s => {
      let match = true;
      
      if (criteria.habitat) {
        match = match && s.habitat.toLowerCase().includes(criteria.habitat.toLowerCase());
      }
      
      if (criteria.technique) {
        match = match && s.techniques.some(t => 
          t.toLowerCase().includes(criteria.technique!.toLowerCase())
        );
      }
      
      return match;
    });
  },
  
  // Add a new custom fish species
  addSpecies: (species: Omit<FishSpecies, 'id'>): FishSpecies => {
    const allSpecies = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    
    const newSpecies: FishSpecies = {
      ...species,
      id: Date.now().toString(),
    };
    
    storage.save(FISH_SPECIES_KEY, [...allSpecies, newSpecies]);
    return newSpecies;
  },
  
  // Update an existing fish species
  updateSpecies: (species: FishSpecies): void => {
    const allSpecies = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    const index = allSpecies.findIndex(s => s.id === species.id);
    
    if (index !== -1) {
      allSpecies[index] = species;
      storage.save(FISH_SPECIES_KEY, allSpecies);
    }
  },
  
  // Delete a fish species
  deleteSpecies: (id: string): void => {
    const allSpecies = storage.load<FishSpecies[]>(FISH_SPECIES_KEY, []);
    storage.save(FISH_SPECIES_KEY, allSpecies.filter(s => s.id !== id));
  }
};