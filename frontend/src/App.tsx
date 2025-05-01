import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import main page components
import Dashboard from './components/dashboard/Dashboard';
import TripPlanner from './components/trips/TripPlanner';
import TripForm from './components/trips/TripForm';
import TripDetails from './components/trips/TripDetails';
import FishDatabase from './components/fish/FishDatabase';
import CatchJournal from './components/journal/CatchJournal';
import CatchForm from './components/journal/CatchForm';
import GearManager from './components/gear/GearManager';
import WeatherForecast from './components/weather/WeatherForecast';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Ultimate Fishing Companion 1.0</h1>
          <nav>
            <ul className="nav-links">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/trips">Trip Planner</Link></li>
              <li><Link to="/fish">Fish Database</Link></li>
              <li><Link to="/journal">Catch Journal</Link></li>
              <li><Link to="/gear">Gear Manager</Link></li>
              <li><Link to="/weather">Weather</Link></li>
            </ul>
          </nav>
        </header>
        
        <main className="App-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Trip routes */}
            <Route path="/trips" element={<TripPlanner />} />
            <Route path="/trips/new" element={<TripForm />} />
            <Route path="/trips/edit/:id" element={<TripForm isEdit={true} />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            
            {/* Fish database route */}
            <Route path="/fish" element={<FishDatabase />} />
            
            {/* Journal routes */}
            <Route path="/journal" element={<CatchJournal />} />
            <Route path="/journal/new" element={<CatchForm />} />
            <Route path="/journal/edit/:id" element={<CatchForm isEdit={true} />} />
            
            {/* Gear manager route */}
            <Route path="/gear" element={<GearManager />} />
            
            {/* Weather forecast route */}
            <Route path="/weather" element={<WeatherForecast />} />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>&copy; {new Date().getFullYear()} Ultimate Fishing Companion1.0</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;