import axios from 'axios';
import { WeatherData, TideData, SunData } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Convert OpenWeatherMap data to our app's format
const convertWeatherData = (data: any): WeatherData => {
  return {
    date: new Date(data.dt * 1000).toISOString(),
    temperature: data.main.temp,
    windSpeed: data.wind.speed,
    windDirection: getWindDirection(data.wind.deg),
    pressure: data.main.pressure,
    humidity: data.main.humidity,
    precipitation: data.rain ? data.rain['1h'] || 0 : 0,
    conditions: data.weather[0].description,
    icon: data.weather[0].icon,
  };
};

// Convert degrees to cardinal direction
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Calculate fishing conditions score (0-100)
const calculateFishingScore = (weather: WeatherData): number => {
  // This is a simplified algorithm for demo purposes
  // In a real app, this would be more sophisticated and species-specific
  
  let score = 50; // Start with a neutral score
  
  // Pressure changes affect fish activity
  // Stable or slightly falling pressure is often good
  score += 10; // Placeholder score modifier
  
  // Temperature affects fish activity
  // Different species have different preferred temperatures
  score += 5; // Placeholder score modifier
  
  // Wind affects fishing conditions
  // Moderate wind can be good, too strong is bad
  if (weather.windSpeed < 10) {
    score += 10;
  } else if (weather.windSpeed > 20) {
    score -= 15;
  }
  
  // Rain can be good or bad depending on intensity
  if (weather.precipitation > 0 && weather.precipitation < 2) {
    score += 5; // Light rain can be good
  } else if (weather.precipitation >= 2) {
    score -= 10; // Heavy rain is usually bad
  }
  
  // Normalize the score to be between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Weather API methods
export const weatherService = {
  // Get current weather for a location
  getCurrentWeather: async (lat: number, lon: number): Promise<WeatherData> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/weather/${lat}/${lon}`);
      return convertWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },
  
  // Get 5-day forecast for a location
  getForecast: async (lat: number, lon: number): Promise<WeatherData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/forecast/${lat}/${lon}`);
      return response.data.list.map(convertWeatherData);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },
  
  // Get sunrise, sunset and moon phase data
  getSunData: async (lat: number, lon: number, date: string): Promise<SunData> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sun/${lat}/${lon}/${date}`);
      return {
        date: date,
        sunrise: response.data.sunrise,
        sunset: response.data.sunset,
        moonPhase: response.data.moonPhase
      };
    } catch (error) {
      console.error('Error fetching sun data:', error);
      throw error;
    }
  },
  
  // Get tide data for a coastal location
  getTides: async (lat: number, lon: number, date: string): Promise<TideData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tides/${lat}/${lon}/${date}`);
      return response.data.map((tide: any) => ({
        date: date,
        time: tide.time,
        height: tide.height,
        type: tide.type
      }));
    } catch (error) {
      console.error('Error fetching tide data:', error);
      throw error;
    }
  },
  
  // Calculate fishing conditions score
  getFishingScore: (weather: WeatherData): number => {
    return calculateFishingScore(weather);
  }
};