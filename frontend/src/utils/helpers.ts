/**
 * Generate a unique ID
 * @returns {string} A unique ID string
 */
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  /**
   * Format a date string to a human-readable format
   * @param {string} dateString - The ISO date string to format
   * @returns {string} Formatted date string
   */
  export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  /**
   * Format a time string to a human-readable format
   * @param {string} timeString - The time string to format
   * @returns {string} Formatted time string
   */
  export const formatTime = (timeString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: 'numeric' 
    };
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };
  
  /**
   * Convert temperature from Kelvin to Fahrenheit
   * @param {number} kelvin - Temperature in Kelvin
   * @returns {number} Temperature in Fahrenheit
   */
  export const kelvinToFahrenheit = (kelvin: number): number => {
    return Math.round((kelvin - 273.15) * 9/5 + 32);
  };
  
  /**
   * Convert temperature from Kelvin to Celsius
   * @param {number} kelvin - Temperature in Kelvin
   * @returns {number} Temperature in Celsius
   */
  export const kelvinToCelsius = (kelvin: number): number => {
    return Math.round(kelvin - 273.15);
  };
  
  /**
   * Get a color for the fishing score
   * @param {number} score - The fishing score (0-100)
   * @returns {string} A color in hex format
   */
  export const getFishingScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50'; // Good - Green
    if (score >= 60) return '#8bc34a'; // Above average - Light Green
    if (score >= 40) return '#ffc107'; // Average - Yellow
    if (score >= 20) return '#ff9800'; // Below average - Orange
    return '#f44336'; // Poor - Red
  };
  
  /**
   * Check if a date is today
   * @param {string} dateString - The date string to check
   * @returns {boolean} True if the date is today
   */
  export const isToday = (dateString: string): boolean => {
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  /**
   * Get text representation of moon phase
   * @param {number} phase - Moon phase from 0 to 1
   * @returns {string} Text description of moon phase
   */
  export const getMoonPhaseName = (phase: number): string => {
    if (phase === 0) return 'New Moon';
    if (phase < 0.25) return 'Waxing Crescent';
    if (phase === 0.25) return 'First Quarter';
    if (phase < 0.5) return 'Waxing Gibbous';
    if (phase === 0.5) return 'Full Moon';
    if (phase < 0.75) return 'Waning Gibbous';
    if (phase === 0.75) return 'Last Quarter';
    return 'Waning Crescent';
  };
  
  /**
   * Simple local storage functions for data persistence
   */
  export const storage = {
    save: (key: string, data: any): void => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    
    load: <T>(key: string, defaultValue: T): T => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
      }
    },
    
    remove: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  };