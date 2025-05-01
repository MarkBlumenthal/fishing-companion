import { Trip, Location, TripItem } from '../types';
import { storage, generateId } from '../utils/helpers';

// Local storage keys
const TRIPS_KEY = 'fishing_companion_trips';
const LOCATIONS_KEY = 'fishing_companion_locations';

// Sample default checklist items
const defaultChecklistItems: Omit<TripItem, 'id'>[] = [
  { name: 'Fishing rod', checked: false },
  { name: 'Fishing reel', checked: false },
  { name: 'Tackle box', checked: false },
  { name: 'Extra line', checked: false },
  { name: 'Lures/bait', checked: false },
  { name: 'Fishing net', checked: false },
  { name: 'Pliers', checked: false },
  { name: 'Fishing license', checked: false },
  { name: 'Sunscreen', checked: false },
  { name: 'Hat', checked: false },
  { name: 'Polarized sunglasses', checked: false },
  { name: 'Water/drinks', checked: false },
  { name: 'Snacks/food', checked: false },
  { name: 'First aid kit', checked: false },
  { name: 'Camera/phone', checked: false }
];

// Trip planning service
export const tripService = {
  // Get all trips
  getAllTrips: (): Trip[] => {
    return storage.load<Trip[]>(TRIPS_KEY, []);
  },
  
  // Get a trip by ID
  getTripById: (id: string): Trip | undefined => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    return trips.find(trip => trip.id === id);
  },
  
  // Get upcoming trips (today and future)
  getUpcomingTrips: (): Trip[] => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return tripDate >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  // Add a new trip
  addTrip: (trip: Omit<Trip, 'id' | 'checklist'>): Trip => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    
    // Create checklist items with IDs
    const checklist = defaultChecklistItems.map(item => ({
      ...item,
      id: generateId()
    }));
    
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      checklist
    };
    
    storage.save(TRIPS_KEY, [...trips, newTrip]);
    return newTrip;
  },
  
  // Update an existing trip
  updateTrip: (trip: Trip): void => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    const index = trips.findIndex(t => t.id === trip.id);
    
    if (index !== -1) {
      trips[index] = trip;
      storage.save(TRIPS_KEY, trips);
    }
  },
  
  // Delete a trip
  deleteTrip: (id: string): void => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    storage.save(TRIPS_KEY, trips.filter(t => t.id !== id));
  },
  
  // Get all saved locations
  getAllLocations: (): Location[] => {
    return storage.load<Location[]>(LOCATIONS_KEY, []);
  },
  
  // Get a location by ID
  getLocationById: (id: string): Location | undefined => {
    const locations = storage.load<Location[]>(LOCATIONS_KEY, []);
    return locations.find(loc => loc.id === id);
  },
  
  // Add a new location
  addLocation: (location: Omit<Location, 'id'>): Location => {
    const locations = storage.load<Location[]>(LOCATIONS_KEY, []);
    
    const newLocation: Location = {
      ...location,
      id: generateId()
    };
    
    storage.save(LOCATIONS_KEY, [...locations, newLocation]);
    return newLocation;
  },
  
  // Update an existing location
  updateLocation: (location: Location): void => {
    const locations = storage.load<Location[]>(LOCATIONS_KEY, []);
    const index = locations.findIndex(loc => loc.id === location.id);
    
    if (index !== -1) {
      locations[index] = location;
      storage.save(LOCATIONS_KEY, locations);
    }
  },
  
  // Delete a location
  deleteLocation: (id: string): void => {
    const locations = storage.load<Location[]>(LOCATIONS_KEY, []);
    storage.save(LOCATIONS_KEY, locations.filter(loc => loc.id !== id));
    
    // Also update any trips that use this location
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    const updatedTrips = trips.map(trip => {
      if (trip.location && trip.location.id === id) {
        return { ...trip, location: null };
      }
      return trip;
    });
    
    storage.save(TRIPS_KEY, updatedTrips);
  },
  
  // Add a custom checklist item to a trip
  addChecklistItem: (tripId: string, itemName: string): TripItem | null => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return null;
    
    const newItem: TripItem = {
      id: generateId(),
      name: itemName,
      checked: false
    };
    
    trips[tripIndex].checklist.push(newItem);
    storage.save(TRIPS_KEY, trips);
    
    return newItem;
  },
  
  // Remove a checklist item from a trip
  removeChecklistItem: (tripId: string, itemId: string): void => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return;
    
    trips[tripIndex].checklist = trips[tripIndex].checklist.filter(
      item => item.id !== itemId
    );
    
    storage.save(TRIPS_KEY, trips);
  },
  
  // Toggle checklist item checked status
  toggleChecklistItem: (tripId: string, itemId: string): boolean | null => {
    const trips = storage.load<Trip[]>(TRIPS_KEY, []);
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return null;
    
    const itemIndex = trips[tripIndex].checklist.findIndex(
      item => item.id === itemId
    );
    
    if (itemIndex === -1) return null;
    
    // Toggle the checked status
    trips[tripIndex].checklist[itemIndex].checked = 
      !trips[tripIndex].checklist[itemIndex].checked;
    
    storage.save(TRIPS_KEY, trips);
    
    return trips[tripIndex].checklist[itemIndex].checked;
  }
};