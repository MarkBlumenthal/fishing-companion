// Weather related types
export interface WeatherData {
    date: string;
    temperature: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    humidity: number;
    precipitation: number;
    conditions: string;
    icon: string;
  }
  
  export interface TideData {
    date: string;
    time: string;
    height: number;
    type: 'high' | 'low';
  }
  
  export interface SunData {
    date: string;
    sunrise: string;
    sunset: string;
    moonPhase: number; // 0-1 where 0 is new moon, 0.5 is full moon
  }
  
  // Trip planning related types
  export interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    notes: string;
  }
  
  export interface TripItem {
    id: string;
    name: string;
    checked: boolean;
  }
  
  export interface Trip {
    id: string;
    name: string;
    location: Location | null;
    date: string;
    notes: string;
    checklist: TripItem[];
  }
  
  // Fish and journal related types
  export interface FishSpecies {
    id: string;
    commonName: string;
    scientificName: string;
    description: string;
    habitat: string;
    seasonality: string[];
    techniques: string[];
    imageUrl?: string;
  }
  
  export interface CatchEntry {
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
  
  // Gear related types
  export interface GearItem {
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
  
  export interface GearSet {
    id: string;
    name: string;
    description?: string;
    items: string[]; // IDs of gear items that go together
  }