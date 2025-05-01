import { configureStore } from '@reduxjs/toolkit';
import tripReducer from './slices/tripSlice';
import fishReducer from './slices/fishSlice';
import gearReducer from './slices/gearSlice';
import weatherReducer from './slices/weatherSlice';

export const store = configureStore({
  reducer: {
    trips: tripReducer,
    fish: fishReducer,
    gear: gearReducer,
    weather: weatherReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;