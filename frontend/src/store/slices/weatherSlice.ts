import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WeatherData {
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

interface TideData {
  date: string;
  time: string;
  height: number;
  type: 'high' | 'low';
}

interface SunData {
  date: string;
  sunrise: string;
  sunset: string;
  moonPhase: number; // 0-1 where 0 is new moon, 0.5 is full moon
}

interface WeatherState {
  currentWeather: WeatherData | null;
  forecast: WeatherData[];
  tides: TideData[];
  sunData: SunData[];
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  currentWeather: null,
  forecast: [],
  tides: [],
  sunData: [],
  lastUpdated: null,
  loading: false,
  error: null,
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    // Set current weather
    setCurrentWeather: (state, action: PayloadAction<WeatherData>) => {
      state.currentWeather = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Set weather forecast
    setForecast: (state, action: PayloadAction<WeatherData[]>) => {
      state.forecast = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Set tide data
    setTides: (state, action: PayloadAction<TideData[]>) => {
      state.tides = action.payload;
    },
    
    // Set sun and moon data
    setSunData: (state, action: PayloadAction<SunData[]>) => {
      state.sunData = action.payload;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Clear weather data
    clearWeatherData: (state) => {
      state.currentWeather = null;
      state.forecast = [];
      state.tides = [];
      state.sunData = [];
      state.lastUpdated = null;
    },
  },
});

export const {
  setCurrentWeather,
  setForecast,
  setTides,
  setSunData,
  setLoading,
  setError,
  clearWeatherData,
} = weatherSlice.actions;

export default weatherSlice.reducer;