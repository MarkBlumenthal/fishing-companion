import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Splash from './components/splash/Splash';
import Dashboard from './components/dashboard/Dashboard';
import TripPlanner from './components/trips/TripPlanner';
import TripForm from './components/trips/TripForm';
import TripDetails from './components/trips/TripDetails';
import FishDatabase from './components/fish/FishDatabase';
import CatchJournal from './components/journal/CatchJournal';
import CatchForm from './components/journal/CatchForm';
import WeatherForecast from './components/weather/WeatherForecast';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Splash Screen - First screen on load */}
        <Route path="/" element={<Splash />} />
        
        {/* Main App Routes with Header/Footer */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
};

// NEW COMPONENT - Layout with header and footer
const AppLayout: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Fishing Companion</h1>
        <nav>
          <ul className="nav-links">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/trips">Trip Planner</Link></li>
              <li><Link to="/fish">Fish Database</Link></li>
              <li><Link to="/journal">Catch Journal</Link></li>
              <li><Link to="/weather">Weather</Link></li>
          </ul>
        </nav>
      </header>
      
      <main className="App-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          
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
          
          {/* Weather forecast route */}
          <Route path="/weather" element={<WeatherForecast />} />
          
          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()}Fishing Companion</p>
      </footer>
    </div>
  );
};

export default App;